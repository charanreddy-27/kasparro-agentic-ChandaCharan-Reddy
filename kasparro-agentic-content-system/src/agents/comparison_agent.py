"""
Comparison Page Agent
Responsible for generating product comparison pages.
"""

from typing import Dict, Any, Optional
from .base_agent import BaseAgent, AgentContext
from ..models.product import Product, SkinType
from ..models.content import GeneratedPage, ContentBlock
from ..blocks import ComparisonBlock
from ..templates.comparison_template import ComparisonPageTemplate


class ComparisonPageAgent(BaseAgent[Product, GeneratedPage]):
    """
    Agent responsible for generating product comparison pages.
    
    Responsibility: Compare two products and generate a structured
    comparison page.
    
    Input: Product model (primary product)
    Output: GeneratedPage containing comparison content
    """
    
    def __init__(self):
        super().__init__(
            agent_id="comparison-page-agent",
            agent_name="Comparison Page Generator Agent"
        )
        self._dependencies = ["data-parser-agent"]
        
        # Initialize comparison block
        self._comparison_block = ComparisonBlock()
        
        # Initialize template
        self._template = ComparisonPageTemplate()
    
    def validate_input(self, input_data: Product) -> bool:
        """Validate product data."""
        return input_data is not None and bool(input_data.name)
    
    def execute(self, input_data: Product, context: AgentContext) -> GeneratedPage:
        """Generate comparison page."""
        product_a = input_data
        
        # Get or create comparison product
        product_b = context.get("comparison_product")
        
        if not product_b:
            # Generate fictional Product B
            product_b = self._create_fictional_product(product_a)
            context.set("comparison_product", product_b)
        
        # Step 1: Process comparison block
        block_context = {"comparison_product": product_b}
        comparison_content = self._comparison_block.process(product_a, block_context)
        
        # Step 2: Render page using template
        processed_blocks = {
            "comparison-block": comparison_content
        }
        
        template_context = {
            "product_a": product_a,
            "product_b": product_b
        }
        
        comparison_page = self._template.render(processed_blocks, template_context)
        
        # Store in context
        context.set("comparison_page", comparison_page)
        
        context.log(self.agent_id, "generated_comparison_page", {
            "product_a": product_a.name,
            "product_b": product_b.name
        })
        
        return comparison_page
    
    def _create_fictional_product(self, reference_product: Product) -> Product:
        """
        Create a fictional Product B for comparison.
        
        The fictional product is designed to provide meaningful comparison
        points while being clearly distinct from the reference product.
        """
        # Create a complementary fictional product
        fictional_product = Product(
            name="RadiantGlow Niacinamide Serum",
            concentration="5% Niacinamide",
            skin_types=[SkinType.OILY, SkinType.SENSITIVE, SkinType.NORMAL],
            key_ingredients=["Niacinamide", "Zinc PCA", "Hyaluronic Acid"],
            benefits=["Pore minimizing", "Oil control", "Brightening"],
            usage_instructions="Apply 3-4 drops morning and evening on cleansed skin",
            side_effects="May cause slight redness in first-time users",
            price=599.0,
            currency="INR",
            product_id="PROD-FICTIONAL-001",
            category="skincare"
        )
        
        return fictional_product
    
    def set_comparison_product(self, product: Product, context: AgentContext) -> None:
        """
        Explicitly set the comparison product.
        
        Use this method when you want to compare against a specific product
        rather than the auto-generated fictional one.
        """
        context.set("comparison_product", product)
