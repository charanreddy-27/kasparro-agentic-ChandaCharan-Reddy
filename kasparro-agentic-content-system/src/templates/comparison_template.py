"""
Comparison Page Template
Template for generating product comparison pages.
"""

from typing import Dict, Any, List
from .template_engine import BaseTemplate
from ..models.content import ContentBlock, GeneratedPage, ContentType


class ComparisonPageTemplate(BaseTemplate):
    """
    Template for generating product comparison pages.
    
    Structure:
    - Header with both products
    - Side-by-side comparison table
    - Category-wise comparison
    - Winner highlights
    - Recommendation
    """
    
    def __init__(self):
        super().__init__(
            template_id="comparison-template",
            template_name="Product Comparison Page Template",
            content_type=ContentType.COMPARISON
        )
        self._required_blocks = [
            "comparison-block"
        ]
    
    def render(self, blocks: Dict[str, ContentBlock], context: Dict[str, Any]) -> GeneratedPage:
        """Render comparison page from content blocks."""
        comparison_block = blocks.get("comparison-block")
        
        if not comparison_block:
            raise ValueError("Comparison block is required")
        
        comp = comparison_block.content
        product_a = comp["product_a"]
        product_b = comp["product_b"]
        
        content = {
            "page_title": f"{product_a['name']} vs {product_b['name']} - Comparison",
            "meta_description": self._generate_meta_description(product_a, product_b),
            
            # Header
            "header": {
                "title": "Product Comparison",
                "subtitle": f"Compare {product_a['name']} and {product_b['name']} to find the best fit for your skincare routine",
                "products": [product_a["name"], product_b["name"]]
            },
            
            # Quick Overview
            "quick_overview": {
                "product_a": self._build_quick_overview(product_a),
                "product_b": self._build_quick_overview(product_b)
            },
            
            # Feature Comparison Table
            "comparison_table": self._build_comparison_table(comp),
            
            # Detailed Comparisons
            "detailed_comparisons": {
                "ingredients": self._format_ingredient_comparison(comp["ingredient_comparison"], product_a, product_b),
                "benefits": self._format_benefits_comparison(comp["benefits_comparison"], product_a, product_b),
                "price": self._format_price_comparison(comp["price_comparison"], product_a, product_b),
                "suitability": comp["suitability_comparison"]
            },
            
            # Winners Summary
            "winners": {
                "by_category": comp["category_winners"],
                "summary": self._generate_winner_summary(comp["category_winners"], product_a, product_b)
            },
            
            # Recommendation
            "recommendation": {
                "summary": comp["comparison_summary"],
                "choose_product_a_if": self._generate_choice_reasons(product_a, product_b, "a"),
                "choose_product_b_if": self._generate_choice_reasons(product_a, product_b, "b")
            },
            
            # Individual Product Details
            "product_details": {
                "product_a": product_a,
                "product_b": product_b
            }
        }
        
        return GeneratedPage(
            page_type=ContentType.COMPARISON,
            title=content["page_title"],
            content=content,
            template_used=self.template_id,
            blocks_used=list(blocks.keys())
        )
    
    def _generate_meta_description(self, product_a: Dict, product_b: Dict) -> str:
        """Generate SEO meta description."""
        return (f"Compare {product_a['name']} vs {product_b['name']}. "
                f"See ingredients, benefits, prices, and find the best choice for your skin.")
    
    def _build_quick_overview(self, product: Dict) -> Dict[str, Any]:
        """Build quick overview card for a product."""
        return {
            "name": product["name"],
            "price": f"₹{product['price']}",
            "key_ingredients": product["key_ingredients"][:3],
            "top_benefit": product["benefits"][0] if product["benefits"] else "N/A",
            "skin_types": product.get("skin_types", [])
        }
    
    def _build_comparison_table(self, comp: Dict) -> List[Dict[str, Any]]:
        """Build structured comparison table."""
        product_a = comp["product_a"]
        product_b = comp["product_b"]
        
        rows = []
        
        # Price row
        rows.append({
            "attribute": "Price",
            "product_a_value": f"₹{product_a['price']}",
            "product_b_value": f"₹{product_b['price']}",
            "winner": comp["category_winners"].get("price", "tie"),
            "highlight": True
        })
        
        # Concentration row
        rows.append({
            "attribute": "Concentration",
            "product_a_value": product_a.get("concentration", "Not specified"),
            "product_b_value": product_b.get("concentration", "Not specified"),
            "winner": "tie",
            "highlight": False
        })
        
        # Key Ingredients row
        rows.append({
            "attribute": "Key Ingredients",
            "product_a_value": ", ".join(product_a["key_ingredients"]),
            "product_b_value": ", ".join(product_b["key_ingredients"]),
            "winner": comp["category_winners"].get("ingredients", "tie"),
            "highlight": False
        })
        
        # Benefits row
        rows.append({
            "attribute": "Benefits",
            "product_a_value": ", ".join(product_a["benefits"]),
            "product_b_value": ", ".join(product_b["benefits"]),
            "winner": comp["category_winners"].get("benefits", "tie"),
            "highlight": False
        })
        
        # Skin Types row
        rows.append({
            "attribute": "Suitable Skin Types",
            "product_a_value": ", ".join(product_a.get("skin_types", [])),
            "product_b_value": ", ".join(product_b.get("skin_types", [])),
            "winner": comp["category_winners"].get("versatility", "tie"),
            "highlight": False
        })
        
        return rows
    
    def _format_ingredient_comparison(self, ing_comp: Dict, product_a: Dict, product_b: Dict) -> Dict[str, Any]:
        """Format ingredient comparison section."""
        return {
            "title": "Ingredient Comparison",
            "common_ingredients": {
                "label": "Shared Ingredients",
                "items": ing_comp["common_ingredients"],
                "description": f"Both products contain {', '.join(ing_comp['common_ingredients'])}" if ing_comp["common_ingredients"] else "No common ingredients"
            },
            "unique_to_a": {
                "label": f"Only in {product_a['name']}",
                "items": ing_comp["unique_to_a"]
            },
            "unique_to_b": {
                "label": f"Only in {product_b['name']}",
                "items": ing_comp["unique_to_b"]
            },
            "similarity_score": f"{ing_comp['similarity_score']:.0f}%"
        }
    
    def _format_benefits_comparison(self, ben_comp: Dict, product_a: Dict, product_b: Dict) -> Dict[str, Any]:
        """Format benefits comparison section."""
        return {
            "title": "Benefits Comparison",
            "product_a_benefits": {
                "product_name": product_a["name"],
                "benefits": ben_comp["product_a_benefits"]
            },
            "product_b_benefits": {
                "product_name": product_b["name"],
                "benefits": ben_comp["product_b_benefits"]
            },
            "common_benefits": ben_comp["common_benefits"],
            "unique_to_a": ben_comp["unique_to_a"],
            "unique_to_b": ben_comp["unique_to_b"]
        }
    
    def _format_price_comparison(self, price_comp: Dict, product_a: Dict, product_b: Dict) -> Dict[str, Any]:
        """Format price comparison section."""
        return {
            "title": "Price Comparison",
            "product_a_price": price_comp["product_a_price"],
            "product_b_price": price_comp["product_b_price"],
            "difference": {
                "amount": price_comp["price_difference"],
                "percentage": f"{price_comp['price_difference_percent']:.1f}%"
            },
            "more_affordable": price_comp["more_affordable"],
            "value_assessment": price_comp["value_assessment"]
        }
    
    def _generate_winner_summary(self, winners: Dict, product_a: Dict, product_b: Dict) -> Dict[str, Any]:
        """Generate summary of winners."""
        a_wins = [cat for cat, winner in winners.items() if winner == product_a["name"]]
        b_wins = [cat for cat, winner in winners.items() if winner == product_b["name"]]
        ties = [cat for cat, winner in winners.items() if winner == "tie"]
        
        return {
            "product_a_wins": {
                "count": len(a_wins),
                "categories": a_wins
            },
            "product_b_wins": {
                "count": len(b_wins),
                "categories": b_wins
            },
            "ties": {
                "count": len(ties),
                "categories": ties
            }
        }
    
    def _generate_choice_reasons(self, product_a: Dict, product_b: Dict, choice: str) -> List[str]:
        """Generate reasons to choose one product over another."""
        if choice == "a":
            product = product_a
            other = product_b
        else:
            product = product_b
            other = product_a
        
        reasons = []
        
        # Price reason
        if product["price"] < other["price"]:
            reasons.append("You're looking for a more budget-friendly option")
        
        # Ingredient reasons
        unique_ingredients = set(i.lower() for i in product["key_ingredients"]) - set(i.lower() for i in other["key_ingredients"])
        if unique_ingredients:
            reasons.append(f"You want products with {', '.join(unique_ingredients)}")
        
        # Benefit reasons
        unique_benefits = set(b.lower() for b in product["benefits"]) - set(b.lower() for b in other["benefits"])
        if unique_benefits:
            reasons.append(f"Your primary concern is {' or '.join(unique_benefits)}")
        
        # Skin type reasons
        unique_skin_types = set(product.get("skin_types", [])) - set(other.get("skin_types", []))
        if unique_skin_types:
            reasons.append(f"You have {' or '.join(unique_skin_types).lower()} skin")
        
        # Generic reason if no specific ones
        if not reasons:
            reasons.append(f"You prefer {product['name']}'s formulation")
        
        return reasons
    
    def get_schema(self) -> Dict[str, Any]:
        """Return JSON schema for comparison page output."""
        return {
            "type": "object",
            "properties": {
                "page_title": {"type": "string"},
                "meta_description": {"type": "string"},
                "header": {"type": "object"},
                "quick_overview": {"type": "object"},
                "comparison_table": {"type": "array"},
                "detailed_comparisons": {"type": "object"},
                "winners": {"type": "object"},
                "recommendation": {"type": "object"},
                "product_details": {"type": "object"}
            }
        }
