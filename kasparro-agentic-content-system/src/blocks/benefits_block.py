"""
Benefits Content Logic Block
Transforms product benefits into structured content.
"""

from typing import Dict, Any, List, Optional
from .base_block import ContentLogicBlock
from ..models.product import Product
from ..models.content import ContentBlock


class BenefitsBlock(ContentLogicBlock):
    """
    Content logic block for generating benefits-related content.
    
    Responsibility: Transform raw benefits data into multiple content formats
    suitable for different page types.
    """
    
    def __init__(self):
        super().__init__(
            block_id="benefits-block",
            block_name="Product Benefits Generator"
        )
    
    def get_required_fields(self) -> List[str]:
        return ["benefits"]
    
    def process(self, product: Product, context: Optional[Dict[str, Any]] = None) -> ContentBlock:
        """Generate benefits content in multiple formats."""
        benefits = product.benefits
        
        content = {
            # List format for bullet points
            "benefits_list": benefits,
            
            # Headline format
            "primary_benefit": benefits[0] if benefits else "",
            "secondary_benefits": benefits[1:] if len(benefits) > 1 else [],
            
            # Summary format
            "benefits_summary": self._generate_summary(benefits, product.name),
            
            # Marketing copy format
            "benefits_headline": self._generate_headline(benefits),
            
            # Structured benefits with details
            "benefits_detailed": self._generate_detailed_benefits(benefits, product)
        }
        
        return self._create_block(content, {
            "block_name": self.block_name,
            "benefits_count": len(benefits)
        })
    
    def _generate_summary(self, benefits: List[str], product_name: str) -> str:
        """Generate a summary sentence from benefits."""
        if not benefits:
            return ""
        
        if len(benefits) == 1:
            return f"{product_name} helps with {benefits[0].lower()}."
        
        benefits_text = ", ".join(b.lower() for b in benefits[:-1])
        return f"{product_name} provides {benefits_text} and {benefits[-1].lower()}."
    
    def _generate_headline(self, benefits: List[str]) -> str:
        """Generate a marketing headline from benefits."""
        if not benefits:
            return "Discover the Benefits"
        
        primary = benefits[0]
        return f"Achieve {primary} and More"
    
    def _generate_detailed_benefits(self, benefits: List[str], product: Product) -> List[Dict[str, str]]:
        """Generate detailed benefit descriptions."""
        detailed = []
        
        benefit_descriptions = {
            "brightening": "Enhances skin radiance and gives you a natural glow",
            "fades dark spots": "Helps reduce the appearance of dark spots and uneven skin tone",
            "hydrating": "Provides deep moisture to keep skin supple",
            "anti-aging": "Helps reduce fine lines and wrinkles",
            "smoothing": "Creates a smoother, more even skin texture"
        }
        
        for benefit in benefits:
            description = benefit_descriptions.get(
                benefit.lower(), 
                f"Helps improve overall skin health through {benefit.lower()}"
            )
            detailed.append({
                "benefit": benefit,
                "description": description
            })
        
        return detailed
