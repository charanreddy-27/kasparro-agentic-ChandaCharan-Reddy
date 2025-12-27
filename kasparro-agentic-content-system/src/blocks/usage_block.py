"""
Usage Content Logic Block
Transforms usage instructions into structured content.
"""

from typing import Dict, Any, List, Optional
from .base_block import ContentLogicBlock
from ..models.product import Product
from ..models.content import ContentBlock


class UsageBlock(ContentLogicBlock):
    """
    Content logic block for generating usage-related content.
    
    Responsibility: Transform raw usage instructions into structured,
    easy-to-follow formats.
    """
    
    def __init__(self):
        super().__init__(
            block_id="usage-block",
            block_name="Usage Instructions Generator"
        )
    
    def get_required_fields(self) -> List[str]:
        return ["usage_instructions"]
    
    def process(self, product: Product, context: Optional[Dict[str, Any]] = None) -> ContentBlock:
        """Generate usage content in multiple formats."""
        usage = product.usage_instructions
        
        content = {
            # Original format
            "usage_text": usage,
            
            # Step-by-step format
            "usage_steps": self._parse_steps(usage),
            
            # Quick reference
            "quick_guide": self._generate_quick_guide(usage, product),
            
            # Timing information
            "timing": self._extract_timing(usage),
            
            # Application method
            "application_method": self._extract_application_method(usage),
            
            # Dosage information
            "dosage": self._extract_dosage(usage)
        }
        
        return self._create_block(content, {
            "block_name": self.block_name,
            "has_timing": bool(content["timing"]),
            "has_dosage": bool(content["dosage"])
        })
    
    def _parse_steps(self, usage: str) -> List[Dict[str, Any]]:
        """Parse usage instructions into numbered steps."""
        steps = []
        
        # Extract timing
        timing = self._extract_timing(usage)
        dosage = self._extract_dosage(usage)
        
        step_num = 1
        
        if dosage:
            steps.append({
                "step": step_num,
                "instruction": f"Take {dosage}",
                "type": "dosage"
            })
            step_num += 1
        
        if timing:
            steps.append({
                "step": step_num,
                "instruction": f"Apply {timing}",
                "type": "timing"
            })
            step_num += 1
        
        # Check for additional instructions like "before sunscreen"
        if "before" in usage.lower():
            before_match = usage.lower().split("before")
            if len(before_match) > 1:
                steps.append({
                    "step": step_num,
                    "instruction": f"Follow with {before_match[1].strip()}",
                    "type": "sequence"
                })
        
        return steps
    
    def _generate_quick_guide(self, usage: str, product: Product) -> str:
        """Generate a quick reference guide."""
        dosage = self._extract_dosage(usage) or "appropriate amount"
        timing = self._extract_timing(usage) or "as directed"
        
        return f"Apply {dosage} of {product.name} {timing}."
    
    def _extract_timing(self, usage: str) -> str:
        """Extract timing information from usage instructions."""
        timing_keywords = ["morning", "evening", "night", "daily", "twice daily"]
        usage_lower = usage.lower()
        
        for keyword in timing_keywords:
            if keyword in usage_lower:
                return f"in the {keyword}" if keyword in ["morning", "evening", "night"] else keyword
        
        return ""
    
    def _extract_application_method(self, usage: str) -> str:
        """Extract how to apply the product."""
        methods = ["apply", "massage", "pat", "spread", "dab"]
        usage_lower = usage.lower()
        
        for method in methods:
            if method in usage_lower:
                return method.capitalize()
        
        return "Apply"
    
    def _extract_dosage(self, usage: str) -> str:
        """Extract dosage information."""
        import re
        
        # Look for patterns like "2-3 drops", "pea-sized amount", etc.
        patterns = [
            r'\d+[-–]\d+\s+drops?',
            r'\d+\s+drops?',
            r'pea[- ]sized\s+amount',
            r'small\s+amount'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, usage.lower())
            if match:
                return match.group()
        
        return ""
