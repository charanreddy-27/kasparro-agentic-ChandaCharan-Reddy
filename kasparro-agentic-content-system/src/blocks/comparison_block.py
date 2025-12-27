"""
Comparison Content Logic Block
Generates comparison content between two products.
"""

from typing import Dict, Any, List, Optional, Tuple
from .base_block import ContentLogicBlock
from ..models.product import Product
from ..models.content import ContentBlock


class ComparisonBlock(ContentLogicBlock):
    """
    Content logic block for generating comparison content.
    
    Responsibility: Transform two products into structured comparison
    content highlighting differences and similarities.
    """
    
    def __init__(self):
        super().__init__(
            block_id="comparison-block",
            block_name="Product Comparison Generator"
        )
    
    def get_required_fields(self) -> List[str]:
        return ["name", "key_ingredients", "benefits", "price"]
    
    def process(self, product: Product, context: Optional[Dict[str, Any]] = None) -> ContentBlock:
        """
        Generate comparison content.
        
        Context must contain 'comparison_product' - the product to compare against.
        """
        if not context or "comparison_product" not in context:
            raise ValueError("ComparisonBlock requires 'comparison_product' in context")
        
        product_b = context["comparison_product"]
        
        content = {
            # Product summaries
            "product_a": self._create_product_summary(product),
            "product_b": self._create_product_summary(product_b),
            
            # Feature comparison
            "feature_comparison": self._compare_features(product, product_b),
            
            # Ingredient comparison
            "ingredient_comparison": self._compare_ingredients(product, product_b),
            
            # Price comparison
            "price_comparison": self._compare_prices(product, product_b),
            
            # Benefits comparison
            "benefits_comparison": self._compare_benefits(product, product_b),
            
            # Suitability comparison
            "suitability_comparison": self._compare_suitability(product, product_b),
            
            # Winner by category
            "category_winners": self._determine_winners(product, product_b),
            
            # Overall comparison summary
            "comparison_summary": self._generate_summary(product, product_b)
        }
        
        return self._create_block(content, {
            "block_name": self.block_name,
            "products_compared": [product.name, product_b.name]
        })
    
    def _create_product_summary(self, product: Product) -> Dict[str, Any]:
        """Create a summary of a product for comparison."""
        return {
            "name": product.name,
            "key_ingredients": product.key_ingredients,
            "benefits": product.benefits,
            "price": product.price,
            "currency": product.currency,
            "skin_types": [st.value for st in product.skin_types],
            "concentration": product.concentration
        }
    
    def _compare_features(self, a: Product, b: Product) -> List[Dict[str, Any]]:
        """Create feature-by-feature comparison."""
        features = []
        
        # Concentration comparison
        features.append({
            "feature": "Concentration",
            "product_a": a.concentration or "Not specified",
            "product_b": b.concentration or "Not specified",
            "winner": self._compare_concentration(a.concentration, b.concentration)
        })
        
        # Ingredients count
        features.append({
            "feature": "Key Ingredients",
            "product_a": f"{len(a.key_ingredients)} ingredients",
            "product_b": f"{len(b.key_ingredients)} ingredients",
            "winner": "tie" if len(a.key_ingredients) == len(b.key_ingredients) else 
                     (a.name if len(a.key_ingredients) > len(b.key_ingredients) else b.name)
        })
        
        # Benefits count
        features.append({
            "feature": "Benefits",
            "product_a": f"{len(a.benefits)} benefits",
            "product_b": f"{len(b.benefits)} benefits",
            "winner": "tie" if len(a.benefits) == len(b.benefits) else 
                     (a.name if len(a.benefits) > len(b.benefits) else b.name)
        })
        
        # Skin type versatility
        features.append({
            "feature": "Skin Type Versatility",
            "product_a": f"Suitable for {len(a.skin_types)} skin types",
            "product_b": f"Suitable for {len(b.skin_types)} skin types",
            "winner": "tie" if len(a.skin_types) == len(b.skin_types) else 
                     (a.name if len(a.skin_types) > len(b.skin_types) else b.name)
        })
        
        return features
    
    def _compare_concentration(self, conc_a: Optional[str], conc_b: Optional[str]) -> str:
        """Compare concentrations if both are specified."""
        if not conc_a and not conc_b:
            return "tie"
        if not conc_a:
            return "Product B"
        if not conc_b:
            return "Product A"
        
        import re
        
        def extract_percentage(conc: str) -> float:
            match = re.search(r'(\d+(?:\.\d+)?)\s*%', conc)
            return float(match.group(1)) if match else 0
        
        perc_a = extract_percentage(conc_a)
        perc_b = extract_percentage(conc_b)
        
        if perc_a == perc_b:
            return "tie"
        return "Product A" if perc_a > perc_b else "Product B"
    
    def _compare_ingredients(self, a: Product, b: Product) -> Dict[str, Any]:
        """Compare ingredients between products."""
        set_a = set(i.lower() for i in a.key_ingredients)
        set_b = set(i.lower() for i in b.key_ingredients)
        
        common = set_a & set_b
        unique_a = set_a - set_b
        unique_b = set_b - set_a
        
        return {
            "common_ingredients": list(common),
            "unique_to_a": list(unique_a),
            "unique_to_b": list(unique_b),
            "similarity_score": len(common) / max(len(set_a | set_b), 1) * 100
        }
    
    def _compare_prices(self, a: Product, b: Product) -> Dict[str, Any]:
        """Compare prices between products."""
        price_diff = a.price - b.price
        price_diff_percent = (price_diff / b.price * 100) if b.price > 0 else 0
        
        return {
            "product_a_price": {"amount": a.price, "currency": a.currency},
            "product_b_price": {"amount": b.price, "currency": b.currency},
            "price_difference": abs(price_diff),
            "price_difference_percent": abs(price_diff_percent),
            "more_affordable": a.name if a.price < b.price else (b.name if b.price < a.price else "Same price"),
            "value_assessment": self._assess_value(a, b)
        }
    
    def _assess_value(self, a: Product, b: Product) -> str:
        """Assess relative value of products."""
        # Simple value calculation: benefits + ingredients per price unit
        value_a = (len(a.benefits) + len(a.key_ingredients)) / (a.price if a.price > 0 else 1)
        value_b = (len(b.benefits) + len(b.key_ingredients)) / (b.price if b.price > 0 else 1)
        
        if abs(value_a - value_b) < 0.001:
            return "Both products offer similar value"
        elif value_a > value_b:
            return f"{a.name} offers better value for money"
        else:
            return f"{b.name} offers better value for money"
    
    def _compare_benefits(self, a: Product, b: Product) -> Dict[str, Any]:
        """Compare benefits between products."""
        set_a = set(b.lower() for b in a.benefits)
        set_b = set(b.lower() for b in b.benefits)
        
        return {
            "product_a_benefits": a.benefits,
            "product_b_benefits": b.benefits,
            "common_benefits": list(set_a & set_b),
            "unique_to_a": list(set_a - set_b),
            "unique_to_b": list(set_b - set_a)
        }
    
    def _compare_suitability(self, a: Product, b: Product) -> Dict[str, Any]:
        """Compare skin type suitability."""
        types_a = set(st.value for st in a.skin_types)
        types_b = set(st.value for st in b.skin_types)
        
        return {
            "product_a_suitable_for": list(types_a),
            "product_b_suitable_for": list(types_b),
            "common_skin_types": list(types_a & types_b),
            "recommendation": self._generate_suitability_recommendation(a, b, types_a, types_b)
        }
    
    def _generate_suitability_recommendation(self, a: Product, b: Product, 
                                              types_a: set, types_b: set) -> str:
        """Generate suitability recommendation."""
        if types_a == types_b:
            return f"Both products are suitable for the same skin types: {', '.join(types_a)}"
        
        unique_a = types_a - types_b
        unique_b = types_b - types_a
        
        recommendations = []
        if unique_a:
            recommendations.append(f"Choose {a.name} if you have {' or '.join(unique_a)} skin")
        if unique_b:
            recommendations.append(f"Choose {b.name} if you have {' or '.join(unique_b)} skin")
        
        return ". ".join(recommendations)
    
    def _determine_winners(self, a: Product, b: Product) -> Dict[str, str]:
        """Determine winner in each category."""
        winners = {}
        
        # Price winner (lower is better)
        if a.price < b.price:
            winners["price"] = a.name
        elif b.price < a.price:
            winners["price"] = b.name
        else:
            winners["price"] = "tie"
        
        # Benefits winner (more is better)
        if len(a.benefits) > len(b.benefits):
            winners["benefits"] = a.name
        elif len(b.benefits) > len(a.benefits):
            winners["benefits"] = b.name
        else:
            winners["benefits"] = "tie"
        
        # Ingredients winner (more is better)
        if len(a.key_ingredients) > len(b.key_ingredients):
            winners["ingredients"] = a.name
        elif len(b.key_ingredients) > len(a.key_ingredients):
            winners["ingredients"] = b.name
        else:
            winners["ingredients"] = "tie"
        
        # Versatility winner
        if len(a.skin_types) > len(b.skin_types):
            winners["versatility"] = a.name
        elif len(b.skin_types) > len(a.skin_types):
            winners["versatility"] = b.name
        else:
            winners["versatility"] = "tie"
        
        return winners
    
    def _generate_summary(self, a: Product, b: Product) -> str:
        """Generate overall comparison summary."""
        winners = self._determine_winners(a, b)
        
        a_wins = sum(1 for w in winners.values() if w == a.name)
        b_wins = sum(1 for w in winners.values() if w == b.name)
        
        if a_wins > b_wins:
            return f"{a.name} edges ahead in this comparison, winning {a_wins} out of {len(winners)} categories. However, your choice should depend on your specific skin needs and budget."
        elif b_wins > a_wins:
            return f"{b.name} edges ahead in this comparison, winning {b_wins} out of {len(winners)} categories. However, your choice should depend on your specific skin needs and budget."
        else:
            return f"Both products are evenly matched. Your choice should depend on your specific skin type, concerns, and budget preferences."
