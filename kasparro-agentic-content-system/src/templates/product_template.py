"""
Product Page Template
Template for generating product description pages from content blocks.
"""

from typing import Dict, Any, List
from .template_engine import BaseTemplate
from ..models.content import ContentBlock, GeneratedPage, ContentType


class ProductPageTemplate(BaseTemplate):
    """
    Template for generating product description pages.
    
    Structure:
    - Hero section (name, headline, price)
    - Benefits section
    - Ingredients section
    - How to use section
    - Safety information
    - Purchase CTA
    """
    
    def __init__(self):
        super().__init__(
            template_id="product-page-template",
            template_name="Product Description Page Template",
            content_type=ContentType.PRODUCT_PAGE
        )
        self._required_blocks = [
            "benefits-block",
            "usage-block",
            "safety-block",
            "ingredients-block",
            "pricing-block"
        ]
    
    def render(self, blocks: Dict[str, ContentBlock], context: Dict[str, Any]) -> GeneratedPage:
        """Render product page from content blocks."""
        product = context.get("product")
        product_name = product.name if product else context.get("product_name", "Product")
        
        content = {
            "page_title": product_name,
            "meta_description": self._generate_meta_description(blocks, product_name),
            
            # Hero Section
            "hero": {
                "product_name": product_name,
                "headline": self._get_block_content(blocks, "benefits-block", "benefits_headline"),
                "tagline": self._get_block_content(blocks, "benefits-block", "benefits_summary"),
                "price": self._get_block_content(blocks, "pricing-block", "price_display"),
                "cta": self._get_block_content(blocks, "pricing-block", "cta_text")
            },
            
            # Key Features
            "key_features": self._build_key_features(blocks, product),
            
            # Benefits Section
            "benefits_section": {
                "title": "Benefits",
                "primary_benefit": self._get_block_content(blocks, "benefits-block", "primary_benefit"),
                "benefits_list": self._get_block_content(blocks, "benefits-block", "benefits_detailed", []),
                "summary": self._get_block_content(blocks, "benefits-block", "benefits_summary")
            },
            
            # Ingredients Section
            "ingredients_section": {
                "title": "Key Ingredients",
                "hero_ingredient": self._get_block_content(blocks, "ingredients-block", "hero_ingredient"),
                "ingredients_list": self._get_block_content(blocks, "ingredients-block", "ingredients_detailed", []),
                "concentration": self._get_block_content(blocks, "ingredients-block", "concentration_info")
            },
            
            # Usage Section
            "usage_section": {
                "title": "How to Use",
                "quick_guide": self._get_block_content(blocks, "usage-block", "quick_guide"),
                "steps": self._get_block_content(blocks, "usage-block", "usage_steps", []),
                "timing": self._get_block_content(blocks, "usage-block", "timing"),
                "dosage": self._get_block_content(blocks, "usage-block", "dosage")
            },
            
            # Safety Section
            "safety_section": {
                "title": "Safety Information",
                "suitable_for": self._get_block_content(blocks, "safety-block", "suitable_for", []),
                "warnings": self._get_block_content(blocks, "safety-block", "warnings", []),
                "precautions": self._get_block_content(blocks, "safety-block", "precautions", []),
                "patch_test": self._get_block_content(blocks, "safety-block", "patch_test")
            },
            
            # Pricing Section
            "pricing_section": {
                "title": "Pricing",
                "price": self._get_block_content(blocks, "pricing-block", "formatted_price"),
                "value_proposition": self._get_block_content(blocks, "pricing-block", "value_proposition"),
                "price_tier": self._get_block_content(blocks, "pricing-block", "price_tier"),
                "cta_buttons": self._get_block_content(blocks, "pricing-block", "cta_text")
            },
            
            # Structured Data (for SEO)
            "structured_data": self._generate_structured_data(blocks, product)
        }
        
        return GeneratedPage(
            page_type=ContentType.PRODUCT_PAGE,
            title=content["page_title"],
            content=content,
            template_used=self.template_id,
            blocks_used=list(blocks.keys())
        )
    
    def _generate_meta_description(self, blocks: Dict[str, ContentBlock], 
                                    product_name: str) -> str:
        """Generate SEO meta description."""
        benefits = self._get_block_content(blocks, "benefits-block", "benefits_list", [])
        price = self._get_block_content(blocks, "pricing-block", "formatted_price", "")
        
        benefits_text = ", ".join(benefits[:2]).lower() if benefits else "skincare"
        
        return f"Shop {product_name} for {benefits_text}. {price}. Free shipping available."
    
    def _build_key_features(self, blocks: Dict[str, ContentBlock], product) -> List[Dict[str, str]]:
        """Build key features highlights."""
        features = []
        
        # Add concentration if available
        concentration = self._get_block_content(blocks, "ingredients-block", "concentration_info")
        if concentration and concentration.get("percentage"):
            features.append({
                "icon": "formula",
                "label": "Concentration",
                "value": concentration["raw"]
            })
        
        # Add skin types
        suitable_for = self._get_block_content(blocks, "safety-block", "suitable_for", [])
        if suitable_for:
            features.append({
                "icon": "skin",
                "label": "Suitable For",
                "value": ", ".join(suitable_for)
            })
        
        # Add key benefit
        primary_benefit = self._get_block_content(blocks, "benefits-block", "primary_benefit")
        if primary_benefit:
            features.append({
                "icon": "star",
                "label": "Key Benefit",
                "value": primary_benefit
            })
        
        # Add application time
        timing = self._get_block_content(blocks, "usage-block", "timing")
        if timing:
            features.append({
                "icon": "clock",
                "label": "Best Used",
                "value": timing.replace("in the ", "").title()
            })
        
        return features
    
    def _generate_structured_data(self, blocks: Dict[str, ContentBlock], product) -> Dict[str, Any]:
        """Generate JSON-LD structured data for SEO."""
        price = self._get_block_content(blocks, "pricing-block", "price", 0)
        currency = self._get_block_content(blocks, "pricing-block", "currency", "INR")
        
        return {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name if product else "Product",
            "description": self._get_block_content(blocks, "benefits-block", "benefits_summary", ""),
            "offers": {
                "@type": "Offer",
                "price": price,
                "priceCurrency": currency,
                "availability": "https://schema.org/InStock"
            }
        }
    
    def get_schema(self) -> Dict[str, Any]:
        """Return JSON schema for product page output."""
        return {
            "type": "object",
            "properties": {
                "page_title": {"type": "string"},
                "meta_description": {"type": "string"},
                "hero": {"type": "object"},
                "key_features": {"type": "array"},
                "benefits_section": {"type": "object"},
                "ingredients_section": {"type": "object"},
                "usage_section": {"type": "object"},
                "safety_section": {"type": "object"},
                "pricing_section": {"type": "object"},
                "structured_data": {"type": "object"}
            }
        }
