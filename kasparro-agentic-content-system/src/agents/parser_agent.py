"""
Data Parser Agent
Responsible for parsing raw product data into clean internal models.
"""

from typing import Dict, Any, Optional
from .base_agent import BaseAgent, AgentContext
from ..models.product import Product, ProductData, SkinType


class DataParserAgent(BaseAgent[Dict[str, Any], Product]):
    """
    Agent responsible for parsing and normalizing product data.
    
    Responsibility: Convert raw product data into clean, validated internal models.
    
    Input: Raw dictionary of product data
    Output: Validated Product model
    """
    
    def __init__(self):
        super().__init__(
            agent_id="data-parser-agent",
            agent_name="Data Parser Agent"
        )
        
        # Field mappings for normalization
        self._field_mappings = {
            "product name": "name",
            "product_name": "name",
            "productname": "name",
            "name": "name",
            "concentration": "concentration",
            "skin type": "skin_types",
            "skin_type": "skin_types",
            "skintype": "skin_types",
            "key ingredients": "key_ingredients",
            "key_ingredients": "key_ingredients",
            "keyingredients": "key_ingredients",
            "ingredients": "key_ingredients",
            "benefits": "benefits",
            "how to use": "usage_instructions",
            "how_to_use": "usage_instructions",
            "usage": "usage_instructions",
            "usage_instructions": "usage_instructions",
            "side effects": "side_effects",
            "side_effects": "side_effects",
            "sideeffects": "side_effects",
            "price": "price",
            "currency": "currency"
        }
    
    def validate_input(self, input_data: Dict[str, Any]) -> bool:
        """Validate that input contains minimum required fields."""
        if not input_data:
            return False
        
        # Normalize keys for checking
        normalized_keys = {k.lower().replace(" ", "_"): k for k in input_data.keys()}
        
        # Must have at least a name
        return any(key in normalized_keys for key in ["name", "product_name", "productname"])
    
    def execute(self, input_data: Dict[str, Any], context: AgentContext) -> Product:
        """Parse raw data into Product model."""
        
        # Normalize the input data
        normalized_data = self._normalize_data(input_data)
        
        # Parse individual fields
        product = Product(
            name=self._parse_name(normalized_data),
            concentration=self._parse_concentration(normalized_data),
            skin_types=self._parse_skin_types(normalized_data),
            key_ingredients=self._parse_ingredients(normalized_data),
            benefits=self._parse_benefits(normalized_data),
            usage_instructions=self._parse_usage(normalized_data),
            side_effects=self._parse_side_effects(normalized_data),
            price=self._parse_price(normalized_data),
            currency=self._parse_currency(normalized_data)
        )
        
        # Store parsed product in context
        context.set("product", product)
        context.set("raw_data", input_data)
        
        # Log parsing results
        context.log(self.agent_id, "parsed_product", {
            "product_name": product.name,
            "fields_parsed": len([f for f in product.to_dict().values() if f])
        })
        
        return product
    
    def _normalize_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize field names to standard format."""
        normalized = {}
        
        for key, value in data.items():
            normalized_key = key.lower().strip()
            
            # Check if we have a mapping for this key
            if normalized_key in self._field_mappings:
                standard_key = self._field_mappings[normalized_key]
                normalized[standard_key] = value
            else:
                # Keep original if no mapping found
                normalized[normalized_key] = value
        
        return normalized
    
    def _parse_name(self, data: Dict[str, Any]) -> str:
        """Parse product name."""
        return str(data.get("name", "Unknown Product")).strip()
    
    def _parse_concentration(self, data: Dict[str, Any]) -> Optional[str]:
        """Parse concentration information."""
        concentration = data.get("concentration")
        return str(concentration).strip() if concentration else None
    
    def _parse_skin_types(self, data: Dict[str, Any]) -> list:
        """Parse skin types into enum values."""
        raw_types = data.get("skin_types", [])
        
        # Handle string input (comma-separated)
        if isinstance(raw_types, str):
            raw_types = [t.strip() for t in raw_types.split(",")]
        
        skin_types = []
        for raw_type in raw_types:
            raw_type_lower = raw_type.lower().strip()
            
            for skin_type in SkinType:
                if skin_type.value.lower() == raw_type_lower:
                    skin_types.append(skin_type)
                    break
        
        return skin_types
    
    def _parse_ingredients(self, data: Dict[str, Any]) -> list:
        """Parse key ingredients into list."""
        raw_ingredients = data.get("key_ingredients", [])
        
        # Handle string input (comma-separated)
        if isinstance(raw_ingredients, str):
            raw_ingredients = [i.strip() for i in raw_ingredients.split(",")]
        
        return [str(i).strip() for i in raw_ingredients if i]
    
    def _parse_benefits(self, data: Dict[str, Any]) -> list:
        """Parse benefits into list."""
        raw_benefits = data.get("benefits", [])
        
        # Handle string input (comma-separated)
        if isinstance(raw_benefits, str):
            raw_benefits = [b.strip() for b in raw_benefits.split(",")]
        
        return [str(b).strip() for b in raw_benefits if b]
    
    def _parse_usage(self, data: Dict[str, Any]) -> str:
        """Parse usage instructions."""
        usage = data.get("usage_instructions", "")
        return str(usage).strip()
    
    def _parse_side_effects(self, data: Dict[str, Any]) -> Optional[str]:
        """Parse side effects information."""
        side_effects = data.get("side_effects")
        return str(side_effects).strip() if side_effects else None
    
    def _parse_price(self, data: Dict[str, Any]) -> float:
        """Parse price into float."""
        price = data.get("price", 0)
        
        if isinstance(price, str):
            # Remove currency symbols and parse
            price = price.replace("₹", "").replace("$", "").replace(",", "").strip()
            try:
                return float(price)
            except ValueError:
                return 0.0
        
        return float(price)
    
    def _parse_currency(self, data: Dict[str, Any]) -> str:
        """Parse or infer currency."""
        currency = data.get("currency")
        
        if currency:
            return str(currency).upper()
        
        # Infer from price format
        price_str = str(data.get("price", ""))
        if "₹" in price_str:
            return "INR"
        elif "$" in price_str:
            return "USD"
        elif "€" in price_str:
            return "EUR"
        
        return "INR"  # Default
