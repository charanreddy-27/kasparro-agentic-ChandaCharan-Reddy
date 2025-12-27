"""
Pipeline Module
Defines the pipeline structure for orchestrating agent execution.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Callable
from enum import Enum
from datetime import datetime


class PipelineStepStatus(Enum):
    """Status of a pipeline step."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class PipelineStep:
    """
    Represents a single step in the pipeline.
    
    Each step corresponds to an agent execution with defined
    input sources and output destinations.
    """
    step_id: str
    agent_id: str
    name: str
    description: str = ""
    dependencies: List[str] = field(default_factory=list)
    input_mapping: Dict[str, str] = field(default_factory=dict)  # context_key -> agent_input
    output_key: str = ""  # Where to store output in context
    status: PipelineStepStatus = PipelineStepStatus.PENDING
    result: Any = None
    error: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    
    def mark_running(self) -> None:
        """Mark step as running."""
        self.status = PipelineStepStatus.RUNNING
        self.started_at = datetime.now().isoformat()
    
    def mark_completed(self, result: Any) -> None:
        """Mark step as completed."""
        self.status = PipelineStepStatus.COMPLETED
        self.result = result
        self.completed_at = datetime.now().isoformat()
    
    def mark_failed(self, error: str) -> None:
        """Mark step as failed."""
        self.status = PipelineStepStatus.FAILED
        self.error = error
        self.completed_at = datetime.now().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "step_id": self.step_id,
            "agent_id": self.agent_id,
            "name": self.name,
            "status": self.status.value,
            "error": self.error,
            "started_at": self.started_at,
            "completed_at": self.completed_at
        }


@dataclass
class Pipeline:
    """
    Represents an execution pipeline of multiple steps.
    
    The pipeline manages the execution order, dependency resolution,
    and state tracking for a sequence of agent executions.
    """
    pipeline_id: str
    name: str
    steps: List[PipelineStep] = field(default_factory=list)
    current_step_index: int = 0
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    completed_at: Optional[str] = None
    
    def add_step(self, step: PipelineStep) -> None:
        """Add a step to the pipeline."""
        self.steps.append(step)
    
    def get_step(self, step_id: str) -> Optional[PipelineStep]:
        """Get a step by ID."""
        for step in self.steps:
            if step.step_id == step_id:
                return step
        return None
    
    def get_next_executable_steps(self) -> List[PipelineStep]:
        """
        Get steps that are ready to execute.
        
        A step is ready when:
        - It's in PENDING status
        - All its dependencies are COMPLETED
        """
        executable = []
        
        for step in self.steps:
            if step.status != PipelineStepStatus.PENDING:
                continue
            
            # Check if all dependencies are completed
            deps_satisfied = all(
                self._is_dependency_satisfied(dep)
                for dep in step.dependencies
            )
            
            if deps_satisfied:
                executable.append(step)
        
        return executable
    
    def _is_dependency_satisfied(self, dep_step_id: str) -> bool:
        """Check if a dependency is satisfied."""
        dep_step = self.get_step(dep_step_id)
        return dep_step is not None and dep_step.status == PipelineStepStatus.COMPLETED
    
    def is_complete(self) -> bool:
        """Check if all steps are complete."""
        return all(
            step.status in [PipelineStepStatus.COMPLETED, PipelineStepStatus.SKIPPED]
            for step in self.steps
        )
    
    def has_failures(self) -> bool:
        """Check if any step has failed."""
        return any(step.status == PipelineStepStatus.FAILED for step in self.steps)
    
    def get_execution_summary(self) -> Dict[str, Any]:
        """Get summary of pipeline execution."""
        status_counts = {status.value: 0 for status in PipelineStepStatus}
        
        for step in self.steps:
            status_counts[step.status.value] += 1
        
        return {
            "pipeline_id": self.pipeline_id,
            "name": self.name,
            "total_steps": len(self.steps),
            "status_breakdown": status_counts,
            "is_complete": self.is_complete(),
            "has_failures": self.has_failures(),
            "created_at": self.created_at,
            "completed_at": self.completed_at
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert pipeline to dictionary."""
        return {
            "pipeline_id": self.pipeline_id,
            "name": self.name,
            "steps": [step.to_dict() for step in self.steps],
            "summary": self.get_execution_summary()
        }
