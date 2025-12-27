"""
Question Data Models
Defines models for generated questions and their categories.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from enum import Enum


class QuestionCategory(Enum):
    """Categories for user questions."""
    INFORMATIONAL = "informational"
    SAFETY = "safety"
    USAGE = "usage"
    PURCHASE = "purchase"
    COMPARISON = "comparison"
    INGREDIENTS = "ingredients"
    EFFECTIVENESS = "effectiveness"
    SUITABILITY = "suitability"


@dataclass
class Question:
    """
    Represents a generated user question about a product.
    """
    question_id: str
    question_text: str
    category: QuestionCategory
    answer: Optional[str] = None
    source_fields: List[str] = field(default_factory=list)  # Which product fields informed this
    priority: int = 1  # 1 = highest priority
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "question_id": self.question_id,
            "question": self.question_text,
            "category": self.category.value,
            "answer": self.answer,
            "source_fields": self.source_fields,
            "priority": self.priority
        }


@dataclass
class QuestionSet:
    """
    Collection of questions organized by category.
    """
    questions: List[Question] = field(default_factory=list)
    product_name: str = ""
    
    def add_question(self, question: Question) -> None:
        """Add a question to the set."""
        self.questions.append(question)
    
    def get_by_category(self, category: QuestionCategory) -> List[Question]:
        """Get all questions in a specific category."""
        return [q for q in self.questions if q.category == category]
    
    def get_top_questions(self, n: int = 5) -> List[Question]:
        """Get top N questions by priority."""
        sorted_questions = sorted(self.questions, key=lambda q: q.priority)
        return sorted_questions[:n]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary grouped by category."""
        result = {
            "product_name": self.product_name,
            "total_questions": len(self.questions),
            "questions_by_category": {}
        }
        
        for category in QuestionCategory:
            category_questions = self.get_by_category(category)
            if category_questions:
                result["questions_by_category"][category.value] = [
                    q.to_dict() for q in category_questions
                ]
        
        return result
