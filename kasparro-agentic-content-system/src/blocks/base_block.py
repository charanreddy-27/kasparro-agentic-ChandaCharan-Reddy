"""
Base Content Logic Block
Abstract base class for all reusable content logic blocks.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from ..models.product import Product
from ..models.content import ContentBlock


class ContentLogicBlock(ABC):
    """
    Abstract base class for content logic blocks.
    
    Content logic blocks are reusable modules that transform product data
    into specific content structures. Each block has:
    - A single responsibility
    - Defined input/output contracts
    - No hidden global state
    """
    
    def __init__(self, block_id: str, block_name: str):
        self.block_id = block_id
        self.block_name = block_name
        self._dependencies: List[str] = []
    
    @property
    def dependencies(self) -> List[str]:
        """Return list of other block IDs this block depends on."""
        return self._dependencies
    
    @abstractmethod
    def process(self, product: Product, context: Optional[Dict[str, Any]] = None) -> ContentBlock:
        """
        Process product data and generate a content block.
        
        Args:
            product: The product to process
            context: Optional additional context (e.g., outputs from dependent blocks)
            
        Returns:
            ContentBlock with transformed content
        """
        pass
    
    @abstractmethod
    def get_required_fields(self) -> List[str]:
        """Return list of product fields required by this block."""
        pass
    
    def validate_input(self, product: Product) -> bool:
        """Validate that product has required fields."""
        product_dict = product.to_dict()
        for field in self.get_required_fields():
            if field not in product_dict or not product_dict[field]:
                return False
        return True
    
    def _create_block(self, content: Dict[str, Any], metadata: Optional[Dict[str, Any]] = None) -> ContentBlock:
        """Helper to create a ContentBlock with this block's info."""
        return ContentBlock(
            block_type=self.block_id,
            content=content,
            metadata=metadata or {"block_name": self.block_name},
            dependencies=self.dependencies
        )
