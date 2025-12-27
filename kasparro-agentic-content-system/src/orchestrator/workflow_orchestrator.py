"""
Workflow Orchestrator
Central orchestrator that manages agent execution and pipeline flow.
"""

from typing import Dict, Any, List, Optional, Type
from datetime import datetime
import json

from .pipeline import Pipeline, PipelineStep, PipelineStepStatus
from ..agents.base_agent import BaseAgent, AgentContext
from ..agents.parser_agent import DataParserAgent
from ..agents.question_generator_agent import QuestionGeneratorAgent
from ..agents.faq_agent import FAQPageAgent
from ..agents.product_page_agent import ProductPageAgent
from ..agents.comparison_agent import ComparisonPageAgent
from ..models.product import Product
from ..models.content import GeneratedPage


class WorkflowOrchestrator:
    """
    Central orchestrator for the content generation system.
    
    Responsibilities:
    - Register and manage agents
    - Build and execute pipelines
    - Manage shared context
    - Handle error recovery
    - Produce final outputs
    """
    
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
        self._context = AgentContext()
        self._pipeline: Optional[Pipeline] = None
        
        # Register default agents
        self._register_default_agents()
    
    def _register_default_agents(self) -> None:
        """Register the default set of agents."""
        self.register_agent(DataParserAgent())
        self.register_agent(QuestionGeneratorAgent())
        self.register_agent(FAQPageAgent())
        self.register_agent(ProductPageAgent())
        self.register_agent(ComparisonPageAgent())
    
    def register_agent(self, agent: BaseAgent) -> None:
        """Register an agent with the orchestrator."""
        self._agents[agent.agent_id] = agent
    
    def get_agent(self, agent_id: str) -> Optional[BaseAgent]:
        """Get a registered agent by ID."""
        return self._agents.get(agent_id)
    
    def build_content_generation_pipeline(self) -> Pipeline:
        """
        Build the complete content generation pipeline.
        
        Pipeline Flow:
        1. Data Parser Agent - Parse raw product data
        2. Question Generator Agent - Generate categorized questions
        3. FAQ Page Agent - Generate FAQ page
        4. Product Page Agent - Generate product description page
        5. Comparison Page Agent - Generate comparison page
        """
        pipeline = Pipeline(
            pipeline_id="content-generation-pipeline",
            name="Content Generation Pipeline"
        )
        
        # Step 1: Parse product data
        pipeline.add_step(PipelineStep(
            step_id="parse-data",
            agent_id="data-parser-agent",
            name="Parse Product Data",
            description="Convert raw product data into internal model",
            dependencies=[],
            output_key="product"
        ))
        
        # Step 2: Generate questions
        pipeline.add_step(PipelineStep(
            step_id="generate-questions",
            agent_id="question-generator-agent",
            name="Generate Questions",
            description="Generate categorized user questions",
            dependencies=["parse-data"],
            output_key="question_set"
        ))
        
        # Step 3: Generate FAQ page
        pipeline.add_step(PipelineStep(
            step_id="generate-faq",
            agent_id="faq-page-agent",
            name="Generate FAQ Page",
            description="Generate FAQ page from questions and content blocks",
            dependencies=["generate-questions"],
            output_key="faq_page"
        ))
        
        # Step 4: Generate product page
        pipeline.add_step(PipelineStep(
            step_id="generate-product-page",
            agent_id="product-page-agent",
            name="Generate Product Page",
            description="Generate product description page",
            dependencies=["parse-data"],
            output_key="product_page"
        ))
        
        # Step 5: Generate comparison page
        pipeline.add_step(PipelineStep(
            step_id="generate-comparison",
            agent_id="comparison-page-agent",
            name="Generate Comparison Page",
            description="Generate product comparison page",
            dependencies=["parse-data"],
            output_key="comparison_page"
        ))
        
        self._pipeline = pipeline
        return pipeline
    
    def execute_pipeline(self, raw_product_data: Dict[str, Any]) -> Dict[str, GeneratedPage]:
        """
        Execute the complete content generation pipeline.
        
        Args:
            raw_product_data: Raw product data dictionary
            
        Returns:
            Dictionary of generated pages
        """
        # Build pipeline if not already built
        if not self._pipeline:
            self.build_content_generation_pipeline()
        
        # Reset context for new execution
        self._context = AgentContext()
        self._context.set("raw_input", raw_product_data)
        
        # Log pipeline start
        self._context.log("orchestrator", "pipeline_start", {
            "pipeline_id": self._pipeline.pipeline_id,
            "steps_count": len(self._pipeline.steps)
        })
        
        # Execute steps in dependency order
        while not self._pipeline.is_complete():
            executable_steps = self._pipeline.get_next_executable_steps()
            
            if not executable_steps:
                if self._pipeline.has_failures():
                    break
                # No executable steps but not complete - might be a deadlock
                self._context.log("orchestrator", "warning", {
                    "message": "No executable steps available"
                })
                break
            
            # Execute each ready step (could be parallelized in production)
            for step in executable_steps:
                self._execute_step(step, raw_product_data)
        
        # Log pipeline completion
        self._pipeline.completed_at = datetime.now().isoformat()
        self._context.log("orchestrator", "pipeline_complete", {
            "summary": self._pipeline.get_execution_summary()
        })
        
        # Collect and return generated pages
        return self._collect_outputs()
    
    def _execute_step(self, step: PipelineStep, raw_data: Dict[str, Any]) -> None:
        """Execute a single pipeline step."""
        step.mark_running()
        
        agent = self._agents.get(step.agent_id)
        if not agent:
            step.mark_failed(f"Agent '{step.agent_id}' not found")
            return
        
        try:
            # Determine input for this step
            input_data = self._get_step_input(step, raw_data)
            
            # Execute agent
            result = agent.run(input_data, self._context)
            
            # Store result
            if step.output_key:
                self._context.set(step.output_key, result)
            
            step.mark_completed(result)
            
        except Exception as e:
            step.mark_failed(str(e))
            self._context.log("orchestrator", "step_error", {
                "step_id": step.step_id,
                "error": str(e)
            })
    
    def _get_step_input(self, step: PipelineStep, raw_data: Dict[str, Any]) -> Any:
        """Determine the input for a pipeline step."""
        agent_id = step.agent_id
        
        if agent_id == "data-parser-agent":
            return raw_data
        
        elif agent_id in ["question-generator-agent", "faq-page-agent", 
                          "product-page-agent", "comparison-page-agent"]:
            return self._context.get("product")
        
        return None
    
    def _collect_outputs(self) -> Dict[str, GeneratedPage]:
        """Collect all generated pages from context."""
        outputs = {}
        
        page_keys = ["faq_page", "product_page", "comparison_page"]
        
        for key in page_keys:
            page = self._context.get(key)
            if page:
                outputs[key] = page
        
        return outputs
    
    def get_context(self) -> AgentContext:
        """Get the current execution context."""
        return self._context
    
    def get_pipeline_summary(self) -> Dict[str, Any]:
        """Get summary of pipeline execution."""
        if not self._pipeline:
            return {"status": "not_initialized"}
        
        return self._pipeline.get_execution_summary()
    
    def get_execution_log(self) -> List[Dict[str, Any]]:
        """Get the execution log."""
        return self._context.execution_log
    
    def export_outputs_to_json(self, output_dir: str = "output") -> Dict[str, str]:
        """
        Export all generated pages to JSON files.
        
        Returns:
            Dictionary mapping page type to file path
        """
        import os
        
        os.makedirs(output_dir, exist_ok=True)
        
        exported_files = {}
        
        # Export FAQ page
        faq_page = self._context.get("faq_page")
        if faq_page:
            faq_path = os.path.join(output_dir, "faq.json")
            with open(faq_path, 'w', encoding='utf-8') as f:
                json.dump(faq_page.to_json(), f, indent=2, ensure_ascii=False)
            exported_files["faq"] = faq_path
        
        # Export product page
        product_page = self._context.get("product_page")
        if product_page:
            product_path = os.path.join(output_dir, "product_page.json")
            with open(product_path, 'w', encoding='utf-8') as f:
                json.dump(product_page.to_json(), f, indent=2, ensure_ascii=False)
            exported_files["product_page"] = product_path
        
        # Export comparison page
        comparison_page = self._context.get("comparison_page")
        if comparison_page:
            comparison_path = os.path.join(output_dir, "comparison_page.json")
            with open(comparison_path, 'w', encoding='utf-8') as f:
                json.dump(comparison_page.to_json(), f, indent=2, ensure_ascii=False)
            exported_files["comparison_page"] = comparison_path
        
        # Export questions
        question_set = self._context.get("question_set")
        if question_set:
            questions_path = os.path.join(output_dir, "questions.json")
            with open(questions_path, 'w', encoding='utf-8') as f:
                json.dump(question_set.to_dict(), f, indent=2, ensure_ascii=False)
            exported_files["questions"] = questions_path
        
        # Export execution summary
        summary_path = os.path.join(output_dir, "execution_summary.json")
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump({
                "pipeline": self.get_pipeline_summary(),
                "execution_log": self.get_execution_log()
            }, f, indent=2, ensure_ascii=False)
        exported_files["summary"] = summary_path
        
        return exported_files
