"""
Pricing Content Logic Block
Transforms pricing data into structured content.
"""

from typing import Dict, Any, List, Optional
from .base_block import ContentLogicBlock
from ..models.product import Product
from ..models.content import ContentBlock


class PricingBlock(ContentLogicBlock):
    """
    Content logic block for generating pricing-related content.
    
    Responsibility: Transform pricing data into various display formats
    and value propositions.
    """
    
    # Currency symbols
    CURRENCY_SYMBOLS = {
        "INR": "₹",
        "USD": "$",
        "EUR": "€",
        "GBP": "£"
    }
    
    def __init__(self):
        super().__init__(
            block_id="pricing-block",
            block_name="Pricing Information Generator"
        )
    
    def get_required_fields(self) -> List[str]:
        return ["price"]
    
    def process(self, product: Product, context: Optional[Dict[str, Any]] = None) -> ContentBlock:
        """Generate pricing content in multiple formats."""
        price = product.price
        currency = product.currency
        
        content = {
            # Basic price info
            "price": price,
            "currency": currency,
            "currency_symbol": self.CURRENCY_SYMBOLS.get(currency, currency),
            
            # Formatted prices
            "formatted_price": self._format_price(price, currency),
            "price_display": self._get_display_price(price, currency),
            
            # Value proposition
            "value_proposition": self._generate_value_proposition(price, product),
            
            # Price tier
            "price_tier": self._determine_price_tier(price, currency),
            
            # Purchase CTAs
            "cta_text": self._generate_cta(price, currency),
            
            # Price comparison context
            "price_context": self._generate_price_context(price, product)
        }
        
        return self._create_block(content, {
            "block_name": self.block_name,
            "price_tier": content["price_tier"]
        })
    
    def _format_price(self, price: float, currency: str) -> str:
        """Format price with currency symbol."""
        symbol = self.CURRENCY_SYMBOLS.get(currency, currency)
        
        if price == int(price):
            return f"{symbol}{int(price)}"
        return f"{symbol}{price:.2f}"
    
    def _get_display_price(self, price: float, currency: str) -> Dict[str, Any]:
        """Get structured display price."""
        symbol = self.CURRENCY_SYMBOLS.get(currency, currency)
        
        return {
            "symbol": symbol,
            "amount": price,
            "formatted": self._format_price(price, currency),
            "decimal_places": 0 if price == int(price) else 2
        }
    
    def _generate_value_proposition(self, price: float, product: Product) -> str:
        """Generate a value proposition statement."""
        benefits_count = len(product.benefits)
        ingredients_count = len(product.key_ingredients)
        
        if price < 500:
            return f"Affordable skincare with {benefits_count} key benefits"
        elif price < 1000:
            return f"Premium quality at a reasonable price with {ingredients_count} active ingredients"
        elif price < 2000:
            return f"Professional-grade formula with {ingredients_count} powerful ingredients"
        else:
            return f"Luxury skincare experience with {benefits_count} transformative benefits"
    
    def _determine_price_tier(self, price: float, currency: str) -> str:
        """Determine the price tier of the product."""
        # Adjust thresholds based on currency (using INR as base)
        conversion = {
            "INR": 1,
            "USD": 83,
            "EUR": 90,
            "GBP": 105
        }
        
        rate = conversion.get(currency, 1)
        normalized_price = price * rate if currency != "INR" else price
        
        if normalized_price < 300:
            return "budget"
        elif normalized_price < 700:
            return "mid-range"
        elif normalized_price < 1500:
            return "premium"
        else:
            return "luxury"
    
    def _generate_cta(self, price: float, currency: str) -> Dict[str, str]:
        """Generate call-to-action text."""
        formatted = self._format_price(price, currency)
        
        return {
            "primary": f"Buy Now - {formatted}",
            "secondary": "Add to Cart",
            "urgency": f"Get yours for just {formatted}"
        }
    
    def _generate_price_context(self, price: float, product: Product) -> Dict[str, Any]:
        """Generate context about the price."""
        tier = self._determine_price_tier(price, product.currency)
        
        tier_descriptions = {
            "budget": "An excellent entry point for skincare enthusiasts",
            "mid-range": "Great value for quality skincare",
            "premium": "Investment-worthy skincare with proven ingredients",
            "luxury": "High-end formulation for discerning skincare lovers"
        }
        
        return {
            "tier": tier,
            "tier_description": tier_descriptions.get(tier, "Quality skincare option"),
            "per_use_estimate": self._estimate_per_use_cost(price)
        }
    
    def _estimate_per_use_cost(self, price: float, uses_estimate: int = 60) -> str:
        """Estimate cost per use."""
        per_use = price / uses_estimate
        
        if per_use < 10:
            return f"Less than ₹{int(per_use + 1)} per use"
        else:
            return f"About ₹{int(per_use)} per use"
