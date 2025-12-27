"""
Safety Content Logic Block
Transforms safety/side effects data into structured content.
"""

from typing import Dict, Any, List, Optional
from .base_block import ContentLogicBlock
from ..models.product import Product
from ..models.content import ContentBlock


class SafetyBlock(ContentLogicBlock):
    """
    Content logic block for generating safety-related content.
    
    Responsibility: Transform side effects and safety information into
    clear, user-friendly warnings and guidelines.
    """
    
    def __init__(self):
        super().__init__(
            block_id="safety-block",
            block_name="Safety Information Generator"
        )
    
    def get_required_fields(self) -> List[str]:
        return []  # Side effects are optional
    
    def process(self, product: Product, context: Optional[Dict[str, Any]] = None) -> ContentBlock:
        """Generate safety content in multiple formats."""
        side_effects = product.side_effects
        skin_types = product.skin_types
        
        content = {
            # Original side effects
            "side_effects_text": side_effects or "No known side effects",
            
            # Parsed warnings
            "warnings": self._parse_warnings(side_effects),
            
            # Suitable skin types
            "suitable_for": [st.value for st in skin_types],
            
            # Precautions
            "precautions": self._generate_precautions(side_effects, product),
            
            # Patch test recommendation
            "patch_test": self._get_patch_test_recommendation(side_effects),
            
            # Safety summary
            "safety_summary": self._generate_safety_summary(side_effects, skin_types),
            
            # Contraindications
            "contraindications": self._identify_contraindications(product)
        }
        
        return self._create_block(content, {
            "block_name": self.block_name,
            "has_side_effects": bool(side_effects),
            "severity": self._assess_severity(side_effects)
        })
    
    def _parse_warnings(self, side_effects: Optional[str]) -> List[Dict[str, str]]:
        """Parse side effects into structured warnings."""
        warnings = []
        
        if not side_effects:
            return warnings
        
        side_effects_lower = side_effects.lower()
        
        warning_keywords = {
            "tingling": ("Tingling Sensation", "mild"),
            "redness": ("Skin Redness", "mild"),
            "irritation": ("Skin Irritation", "moderate"),
            "burning": ("Burning Sensation", "moderate"),
            "sensitivity": ("Increased Sensitivity", "mild"),
            "dryness": ("Skin Dryness", "mild"),
            "peeling": ("Skin Peeling", "moderate")
        }
        
        for keyword, (warning_name, severity) in warning_keywords.items():
            if keyword in side_effects_lower:
                warnings.append({
                    "warning": warning_name,
                    "severity": severity,
                    "description": f"May cause {keyword} in some users"
                })
        
        # Check for skin type specific warnings
        if "sensitive" in side_effects_lower:
            warnings.append({
                "warning": "Sensitive Skin Advisory",
                "severity": "mild",
                "description": "Users with sensitive skin should proceed with caution"
            })
        
        return warnings
    
    def _generate_precautions(self, side_effects: Optional[str], product: Product) -> List[str]:
        """Generate list of precautions."""
        precautions = []
        
        # Universal precautions
        precautions.append("Perform a patch test before first use")
        precautions.append("Avoid contact with eyes")
        precautions.append("Keep out of reach of children")
        
        # Product-specific precautions
        ingredients_lower = [i.lower() for i in product.key_ingredients]
        
        if "vitamin c" in ingredients_lower:
            precautions.append("Store in a cool, dark place to maintain potency")
            precautions.append("Use sunscreen during the day as Vitamin C can increase sun sensitivity")
        
        if "retinol" in ingredients_lower:
            precautions.append("Avoid use during pregnancy")
            precautions.append("Do not combine with other retinoids")
        
        if side_effects and "sensitive" in side_effects.lower():
            precautions.append("Start with less frequent application if you have sensitive skin")
        
        return precautions
    
    def _get_patch_test_recommendation(self, side_effects: Optional[str]) -> Dict[str, str]:
        """Generate patch test recommendation."""
        urgency = "recommended"
        
        if side_effects:
            if any(word in side_effects.lower() for word in ["irritation", "burning", "sensitivity"]):
                urgency = "strongly recommended"
        
        return {
            "recommendation": f"Patch test is {urgency}",
            "instructions": "Apply a small amount to inner arm and wait 24 hours before full use",
            "urgency": urgency
        }
    
    def _generate_safety_summary(self, side_effects: Optional[str], skin_types) -> str:
        """Generate a safety summary statement."""
        skin_type_text = ", ".join(st.value for st in skin_types) if skin_types else "all skin types"
        
        if not side_effects:
            return f"This product is generally safe for {skin_type_text}. As with any skincare product, a patch test is recommended before first use."
        
        return f"This product is formulated for {skin_type_text}. {side_effects}. We recommend a patch test before full application."
    
    def _identify_contraindications(self, product: Product) -> List[str]:
        """Identify potential contraindications."""
        contraindications = []
        
        ingredients_lower = [i.lower() for i in product.key_ingredients]
        
        if "retinol" in ingredients_lower:
            contraindications.append("Not recommended during pregnancy or breastfeeding")
        
        if any(acid in ingredients_lower for acid in ["salicylic acid", "glycolic acid", "lactic acid"]):
            contraindications.append("Avoid if you have very sensitive or compromised skin barrier")
        
        return contraindications
    
    def _assess_severity(self, side_effects: Optional[str]) -> str:
        """Assess overall severity of side effects."""
        if not side_effects:
            return "none"
        
        side_effects_lower = side_effects.lower()
        
        severe_keywords = ["burning", "severe", "allergic", "reaction"]
        moderate_keywords = ["irritation", "peeling", "redness"]
        mild_keywords = ["tingling", "mild", "slight"]
        
        if any(word in side_effects_lower for word in severe_keywords):
            return "moderate"  # Cap at moderate for OTC products
        elif any(word in side_effects_lower for word in moderate_keywords):
            return "moderate"
        elif any(word in side_effects_lower for word in mild_keywords):
            return "mild"
        
        return "mild"
