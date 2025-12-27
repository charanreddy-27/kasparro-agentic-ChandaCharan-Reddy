"""
Product Page Agent
Responsible for generating product description pages.
"""

from typing import Dict, Any
from .base_agent import BaseAgent, AgentContext
from ..models.product import Product
from ..models.content import GeneratedPage, ContentBlock
from ..blocks import (
    BenefitsBlock, UsageBlock, SafetyBlock, 
    IngredientsBlock, PricingBlock
)
from ..templates.product_template import ProductPageTemplate


class ProductPageAgent(BaseAgent[Product, GeneratedPage]):
    """
    Agent responsible for generating product description pages.
    
    Responsibility: Orchestrate content blocks and template to produce
    a complete product description page.
    
    Input: Product model
    Output: GeneratedPage containing product description content
    """
    
    def __init__(self):
        super().__init__(
            agent_id="product-page-agent",
            agent_name="Product Page Generator Agent"
        )
        self._dependencies = ["data-parser-agent"]
        
        # Initialize content blocks
        self._blocks = {
            "benefits-block": BenefitsBlock(),
            "usage-block": UsageBlock(),
            "safety-block": SafetyBlock(),
            "ingredients-block": IngredientsBlock(),
            "pricing-block": PricingBlock()
        }
        
        # Initialize template
        self._template = ProductPageTemplate()
    
    def validate_input(self, input_data: Product) -> bool:
        """Validate product data."""
        return input_data is not None and bool(input_data.name)
    
    def execute(self, input_data: Product, context: AgentContext) -> GeneratedPage:
        """Generate product description page."""
        product = input_data
        
        # Step 1: Process all content blocks
        processed_blocks = self._process_blocks(product, context)
        
        # Step 2: Render page using template
        template_context = {
            "product": product,
            "product_name": product.name
        }
        
        product_page = self._template.render(processed_blocks, template_context)
        
        # Store in context
        context.set("product_page", product_page)
        
        context.log(self.agent_id, "generated_product_page", {
            "product_name": product.name,
            "blocks_used": list(processed_blocks.keys()),
            "sections_generated": self._count_sections(product_page)
        })
        
        return product_page
    
    def _process_blocks(self, product: Product, context: AgentContext) -> Dict[str, ContentBlock]:
        """Process all required content blocks."""
        processed = {}
        
        for block_id, block in self._blocks.items():
            try:
                content_block = block.process(product, {})
                processed[block_id] = content_block
                
                context.log(self.agent_id, "processed_block", {
                    "block_id": block_id,
                    "success": True
                })
                
            except Exception as e:
                context.log(self.agent_id, "block_error", {
                    "block_id": block_id,
                    "error": str(e)
                })
        
        return processed
    
    def _count_sections(self, page: GeneratedPage) -> int:
        """Count the number of sections in the generated page."""
        content = page.content
        sections = ["hero", "key_features", "benefits_section", 
                   "ingredients_section", "usage_section", 
                   "safety_section", "pricing_section"]
        
        return sum(1 for s in sections if s in content and content[s])
