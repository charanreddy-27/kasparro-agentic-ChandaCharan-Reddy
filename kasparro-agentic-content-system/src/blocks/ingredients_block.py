"""
Ingredients Content Logic Block
Transforms ingredient data into structured content.
"""

from typing import Dict, Any, List, Optional
from .base_block import ContentLogicBlock
from ..models.product import Product
from ..models.content import ContentBlock


class IngredientsBlock(ContentLogicBlock):
    """
    Content logic block for generating ingredients-related content.
    
    Responsibility: Transform raw ingredients list into informative,
    structured content with details about each ingredient.
    """
    
    # Ingredient knowledge base (would be expanded in production)
    INGREDIENT_INFO = {
        "vitamin c": {
            "full_name": "Vitamin C (L-Ascorbic Acid)",
            "category": "antioxidant",
            "benefits": ["Brightening", "Antioxidant protection", "Collagen synthesis"],
            "description": "A powerful antioxidant that helps brighten skin and protect against environmental damage."
        },
        "hyaluronic acid": {
            "full_name": "Hyaluronic Acid",
            "category": "humectant",
            "benefits": ["Hydration", "Plumping", "Moisture retention"],
            "description": "A moisture-binding ingredient that can hold up to 1000x its weight in water."
        },
        "niacinamide": {
            "full_name": "Niacinamide (Vitamin B3)",
            "category": "vitamin",
            "benefits": ["Pore minimizing", "Oil control", "Barrier repair"],
            "description": "A versatile vitamin that helps improve skin texture and tone."
        },
        "retinol": {
            "full_name": "Retinol (Vitamin A)",
            "category": "retinoid",
            "benefits": ["Anti-aging", "Cell turnover", "Wrinkle reduction"],
            "description": "A gold-standard anti-aging ingredient that promotes cell renewal."
        },
        "salicylic acid": {
            "full_name": "Salicylic Acid (BHA)",
            "category": "exfoliant",
            "benefits": ["Pore cleansing", "Acne treatment", "Exfoliation"],
            "description": "An oil-soluble acid that penetrates pores to clear congestion."
        }
    }
    
    def __init__(self):
        super().__init__(
            block_id="ingredients-block",
            block_name="Ingredients Information Generator"
        )
    
    def get_required_fields(self) -> List[str]:
        return ["key_ingredients"]
    
    def process(self, product: Product, context: Optional[Dict[str, Any]] = None) -> ContentBlock:
        """Generate ingredients content in multiple formats."""
        ingredients = product.key_ingredients
        concentration = product.concentration
        
        content = {
            # Basic list
            "ingredients_list": ingredients,
            
            # Detailed ingredient information
            "ingredients_detailed": self._get_detailed_ingredients(ingredients),
            
            # Hero ingredient (first one or highest concentration)
            "hero_ingredient": self._identify_hero_ingredient(ingredients, concentration),
            
            # Ingredient categories
            "ingredient_categories": self._categorize_ingredients(ingredients),
            
            # Concentration info if available
            "concentration_info": self._parse_concentration(concentration),
            
            # Combined benefits from all ingredients
            "combined_benefits": self._get_combined_benefits(ingredients),
            
            # Ingredient summary
            "ingredients_summary": self._generate_summary(ingredients, product.name)
        }
        
        return self._create_block(content, {
            "block_name": self.block_name,
            "ingredients_count": len(ingredients),
            "has_concentration": bool(concentration)
        })
    
    def _get_detailed_ingredients(self, ingredients: List[str]) -> List[Dict[str, Any]]:
        """Get detailed information for each ingredient."""
        detailed = []
        
        for ingredient in ingredients:
            ingredient_lower = ingredient.lower()
            
            if ingredient_lower in self.INGREDIENT_INFO:
                info = self.INGREDIENT_INFO[ingredient_lower]
                detailed.append({
                    "name": ingredient,
                    "full_name": info["full_name"],
                    "category": info["category"],
                    "benefits": info["benefits"],
                    "description": info["description"]
                })
            else:
                detailed.append({
                    "name": ingredient,
                    "full_name": ingredient,
                    "category": "active",
                    "benefits": ["Skin improvement"],
                    "description": f"{ingredient} is an active ingredient that helps improve skin health."
                })
        
        return detailed
    
    def _identify_hero_ingredient(self, ingredients: List[str], concentration: Optional[str]) -> Dict[str, Any]:
        """Identify the hero/star ingredient."""
        if not ingredients:
            return {}
        
        # If concentration mentions a specific ingredient, that's likely the hero
        hero = ingredients[0]
        hero_concentration = None
        
        if concentration:
            for ingredient in ingredients:
                if ingredient.lower() in concentration.lower():
                    hero = ingredient
                    hero_concentration = concentration
                    break
        
        hero_lower = hero.lower()
        hero_info = self.INGREDIENT_INFO.get(hero_lower, {})
        
        return {
            "name": hero,
            "concentration": hero_concentration,
            "description": hero_info.get("description", f"{hero} is the star ingredient in this formulation."),
            "benefits": hero_info.get("benefits", ["Skin improvement"])
        }
    
    def _categorize_ingredients(self, ingredients: List[str]) -> Dict[str, List[str]]:
        """Categorize ingredients by their type."""
        categories = {}
        
        for ingredient in ingredients:
            ingredient_lower = ingredient.lower()
            info = self.INGREDIENT_INFO.get(ingredient_lower, {})
            category = info.get("category", "active")
            
            if category not in categories:
                categories[category] = []
            categories[category].append(ingredient)
        
        return categories
    
    def _parse_concentration(self, concentration: Optional[str]) -> Dict[str, Any]:
        """Parse concentration information."""
        if not concentration:
            return {}
        
        import re
        
        # Extract percentage
        percentage_match = re.search(r'(\d+(?:\.\d+)?)\s*%', concentration)
        
        return {
            "raw": concentration,
            "percentage": percentage_match.group(1) if percentage_match else None,
            "description": f"Formulated with {concentration} for optimal effectiveness"
        }
    
    def _get_combined_benefits(self, ingredients: List[str]) -> List[str]:
        """Get combined unique benefits from all ingredients."""
        benefits = set()
        
        for ingredient in ingredients:
            ingredient_lower = ingredient.lower()
            info = self.INGREDIENT_INFO.get(ingredient_lower, {})
            for benefit in info.get("benefits", []):
                benefits.add(benefit)
        
        return list(benefits)
    
    def _generate_summary(self, ingredients: List[str], product_name: str) -> str:
        """Generate a summary of the ingredients."""
        if not ingredients:
            return ""
        
        if len(ingredients) == 1:
            return f"{product_name} features {ingredients[0]} as its key active ingredient."
        
        ingredients_text = ", ".join(ingredients[:-1])
        return f"{product_name} combines the power of {ingredients_text} and {ingredients[-1]}."
