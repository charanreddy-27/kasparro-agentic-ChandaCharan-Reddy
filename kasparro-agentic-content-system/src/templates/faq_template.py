"""
FAQ Page Template
Template for generating FAQ pages from content blocks.
"""

from typing import Dict, Any, List
from .template_engine import BaseTemplate
from ..models.content import ContentBlock, GeneratedPage, ContentType
from ..models.questions import Question


class FAQTemplate(BaseTemplate):
    """
    Template for generating FAQ pages.
    
    Structure:
    - Page metadata
    - FAQ entries (question + answer pairs)
    - Category groupings
    - Related information
    """
    
    def __init__(self):
        super().__init__(
            template_id="faq-template",
            template_name="FAQ Page Template",
            content_type=ContentType.FAQ
        )
        self._required_blocks = [
            "benefits-block",
            "usage-block",
            "safety-block",
            "ingredients-block",
            "pricing-block"
        ]
    
    def render(self, blocks: Dict[str, ContentBlock], context: Dict[str, Any]) -> GeneratedPage:
        """Render FAQ page from content blocks."""
        product_name = context.get("product_name", "Product")
        questions = context.get("questions", [])
        
        # Build FAQ entries
        faq_entries = self._build_faq_entries(blocks, questions, product_name)
        
        # Group by category
        categorized_faqs = self._categorize_faqs(faq_entries)
        
        content = {
            "page_title": f"Frequently Asked Questions - {product_name}",
            "product_name": product_name,
            "total_questions": len(faq_entries),
            "faq_entries": faq_entries,
            "faqs_by_category": categorized_faqs,
            "quick_links": self._generate_quick_links(categorized_faqs),
            "related_info": {
                "usage_summary": self._get_block_content(blocks, "usage-block", "quick_guide"),
                "safety_summary": self._get_block_content(blocks, "safety-block", "safety_summary")
            }
        }
        
        return GeneratedPage(
            page_type=ContentType.FAQ,
            title=content["page_title"],
            content=content,
            template_used=self.template_id,
            blocks_used=list(blocks.keys())
        )
    
    def _build_faq_entries(self, blocks: Dict[str, ContentBlock], 
                           questions: List[Question], product_name: str) -> List[Dict[str, Any]]:
        """Build FAQ entries from questions and blocks."""
        entries = []
        
        for i, q in enumerate(questions):
            answer = self._generate_answer(q, blocks, product_name)
            
            entries.append({
                "id": f"faq-{i+1}",
                "question": q.question_text,
                "answer": answer,
                "category": q.category.value,
                "priority": q.priority
            })
        
        return entries
    
    def _generate_answer(self, question: Question, blocks: Dict[str, ContentBlock], 
                         product_name: str) -> str:
        """Generate answer based on question category and available blocks."""
        category = question.category.value
        
        # Map categories to blocks and content
        if category == "usage":
            usage_text = self._get_block_content(blocks, "usage-block", "usage_text", "")
            quick_guide = self._get_block_content(blocks, "usage-block", "quick_guide", "")
            return quick_guide or usage_text
        
        elif category == "safety":
            safety_summary = self._get_block_content(blocks, "safety-block", "safety_summary", "")
            side_effects = self._get_block_content(blocks, "safety-block", "side_effects_text", "")
            return safety_summary or side_effects
        
        elif category == "ingredients":
            summary = self._get_block_content(blocks, "ingredients-block", "ingredients_summary", "")
            ingredients = self._get_block_content(blocks, "ingredients-block", "ingredients_list", [])
            if not summary and ingredients:
                summary = f"{product_name} contains {', '.join(ingredients)}."
            return summary
        
        elif category == "informational":
            benefits = self._get_block_content(blocks, "benefits-block", "benefits_summary", "")
            return benefits
        
        elif category == "purchase":
            formatted_price = self._get_block_content(blocks, "pricing-block", "formatted_price", "")
            value_prop = self._get_block_content(blocks, "pricing-block", "value_proposition", "")
            return f"{product_name} is priced at {formatted_price}. {value_prop}"
        
        elif category == "effectiveness":
            benefits = self._get_block_content(blocks, "benefits-block", "benefits_list", [])
            if benefits:
                return f"{product_name} helps with {', '.join(benefits).lower()}."
            return f"{product_name} is formulated for effective results."
        
        elif category == "suitability":
            suitable = self._get_block_content(blocks, "safety-block", "suitable_for", [])
            if suitable:
                return f"{product_name} is suitable for {', '.join(suitable).lower()} skin types."
            return f"Please refer to the product label for skin type recommendations."
        
        elif category == "comparison":
            return f"For detailed comparisons, please see our comparison page."
        
        # Default answer
        return question.answer or f"Please refer to the product information for {product_name}."
    
    def _categorize_faqs(self, entries: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Group FAQ entries by category."""
        categorized = {}
        
        for entry in entries:
            category = entry["category"]
            if category not in categorized:
                categorized[category] = []
            categorized[category].append(entry)
        
        return categorized
    
    def _generate_quick_links(self, categorized: Dict[str, List]) -> List[Dict[str, str]]:
        """Generate quick navigation links for categories."""
        category_labels = {
            "informational": "General Information",
            "usage": "How to Use",
            "safety": "Safety & Precautions",
            "purchase": "Pricing & Purchase",
            "comparison": "Comparisons",
            "ingredients": "Ingredients",
            "effectiveness": "Results & Effectiveness",
            "suitability": "Skin Type Suitability"
        }
        
        return [
            {
                "category": cat,
                "label": category_labels.get(cat, cat.title()),
                "count": len(faqs)
            }
            for cat, faqs in categorized.items()
        ]
    
    def get_schema(self) -> Dict[str, Any]:
        """Return JSON schema for FAQ page output."""
        return {
            "type": "object",
            "properties": {
                "page_title": {"type": "string"},
                "product_name": {"type": "string"},
                "total_questions": {"type": "integer"},
                "faq_entries": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
                            "question": {"type": "string"},
                            "answer": {"type": "string"},
                            "category": {"type": "string"}
                        }
                    }
                },
                "faqs_by_category": {"type": "object"}
            }
        }
