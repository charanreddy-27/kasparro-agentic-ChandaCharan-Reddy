"""
Template Engine
Core template engine for rendering content blocks into structured pages.
"""

from typing import Dict, Any, List, Optional, Type
from abc import ABC, abstractmethod
from ..models.content import ContentBlock, GeneratedPage, ContentType, PageTemplate


class BaseTemplate(ABC):
    """
    Abstract base class for all page templates.
    
    Templates define the structure and rules for generating specific page types.
    """
    
    def __init__(self, template_id: str, template_name: str, content_type: ContentType):
        self.template_id = template_id
        self.template_name = template_name
        self.content_type = content_type
        self._required_blocks: List[str] = []
    
    @property
    def required_blocks(self) -> List[str]:
        """List of block IDs required by this template."""
        return self._required_blocks
    
    @abstractmethod
    def render(self, blocks: Dict[str, ContentBlock], context: Dict[str, Any]) -> GeneratedPage:
        """
        Render content blocks into a generated page.
        
        Args:
            blocks: Dictionary mapping block_id to ContentBlock
            context: Additional context (e.g., product data, metadata)
            
        Returns:
            GeneratedPage ready for JSON output
        """
        pass
    
    @abstractmethod
    def get_schema(self) -> Dict[str, Any]:
        """Return the JSON schema for this template's output."""
        pass
    
    def validate_blocks(self, blocks: Dict[str, ContentBlock]) -> bool:
        """Validate that all required blocks are present."""
        return all(block_id in blocks for block_id in self._required_blocks)
    
    def _get_block_content(self, blocks: Dict[str, ContentBlock], 
                          block_id: str, key: str, default: Any = None) -> Any:
        """Safely get content from a block."""
        if block_id not in blocks:
            return default
        return blocks[block_id].content.get(key, default)


class TemplateEngine:
    """
    Central template engine that manages template registration and rendering.
    """
    
    def __init__(self):
        self._templates: Dict[str, BaseTemplate] = {}
    
    def register_template(self, template: BaseTemplate) -> None:
        """Register a template with the engine."""
        self._templates[template.template_id] = template
    
    def get_template(self, template_id: str) -> Optional[BaseTemplate]:
        """Get a template by ID."""
        return self._templates.get(template_id)
    
    def list_templates(self) -> List[str]:
        """List all registered template IDs."""
        return list(self._templates.keys())
    
    def render(self, template_id: str, blocks: Dict[str, ContentBlock], 
               context: Dict[str, Any]) -> GeneratedPage:
        """
        Render a page using the specified template.
        
        Args:
            template_id: ID of the template to use
            blocks: Dictionary of content blocks
            context: Additional rendering context
            
        Returns:
            GeneratedPage
            
        Raises:
            ValueError: If template not found or blocks validation fails
        """
        template = self._templates.get(template_id)
        
        if not template:
            raise ValueError(f"Template '{template_id}' not found")
        
        if not template.validate_blocks(blocks):
            missing = [b for b in template.required_blocks if b not in blocks]
            raise ValueError(f"Missing required blocks: {missing}")
        
        return template.render(blocks, context)
    
    def get_required_blocks(self, template_id: str) -> List[str]:
        """Get required blocks for a template."""
        template = self._templates.get(template_id)
        return template.required_blocks if template else []
