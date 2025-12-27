"""
Product Data Models
Defines the internal representation of product data used throughout the system.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from enum import Enum


class SkinType(Enum):
    """Enumeration of supported skin types."""
    OILY = "Oily"
    DRY = "Dry"
    COMBINATION = "Combination"
    SENSITIVE = "Sensitive"
    NORMAL = "Normal"


@dataclass
class Product:
    """
    Core product model representing a skincare/beauty product.
    This is the internal normalized representation of product data.
    """
    name: str
    concentration: Optional[str] = None
    skin_types: List[SkinType] = field(default_factory=list)
    key_ingredients: List[str] = field(default_factory=list)
    benefits: List[str] = field(default_factory=list)
    usage_instructions: str = ""
    side_effects: Optional[str] = None
    price: float = 0.0
    currency: str = "INR"
    
    # Metadata
    product_id: Optional[str] = None
    category: str = "skincare"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert product to dictionary representation."""
        return {
            "name": self.name,
            "concentration": self.concentration,
            "skin_types": [st.value for st in self.skin_types],
            "key_ingredients": self.key_ingredients,
            "benefits": self.benefits,
            "usage_instructions": self.usage_instructions,
            "side_effects": self.side_effects,
            "price": self.price,
            "currency": self.currency,
            "product_id": self.product_id,
            "category": self.category
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Product':
        """Create product from dictionary."""
        skin_types = []
        for st in data.get("skin_types", []):
            if isinstance(st, SkinType):
                skin_types.append(st)
            elif isinstance(st, str):
                try:
                    skin_types.append(SkinType(st))
                except ValueError:
                    # Try matching by name
                    for skin_type in SkinType:
                        if skin_type.value.lower() == st.lower():
                            skin_types.append(skin_type)
                            break
        
        return cls(
            name=data.get("name", ""),
            concentration=data.get("concentration"),
            skin_types=skin_types,
            key_ingredients=data.get("key_ingredients", []),
            benefits=data.get("benefits", []),
            usage_instructions=data.get("usage_instructions", ""),
            side_effects=data.get("side_effects"),
            price=float(data.get("price", 0)),
            currency=data.get("currency", "INR"),
            product_id=data.get("product_id"),
            category=data.get("category", "skincare")
        )


@dataclass
class ProductData:
    """
    Container for raw product data before parsing.
    Acts as the input interface for the system.
    """
    raw_data: Dict[str, Any]
    source: str = "manual"
    timestamp: Optional[str] = None
    
    def get_field(self, field_name: str, default: Any = None) -> Any:
        """Safely retrieve a field from raw data."""
        return self.raw_data.get(field_name, default)
    
    def has_field(self, field_name: str) -> bool:
        """Check if a field exists in raw data."""
        return field_name in self.raw_data
