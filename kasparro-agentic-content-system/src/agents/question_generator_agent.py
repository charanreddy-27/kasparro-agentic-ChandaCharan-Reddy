"""
Question Generator Agent
Responsible for generating categorized user questions from product data.
"""

from typing import Dict, Any, List
from .base_agent import BaseAgent, AgentContext
from ..models.product import Product
from ..models.questions import Question, QuestionCategory, QuestionSet


class QuestionGeneratorAgent(BaseAgent[Product, QuestionSet]):
    """
    Agent responsible for generating user questions about a product.
    
    Responsibility: Analyze product data and generate categorized questions
    that users might ask about the product.
    
    Input: Product model
    Output: QuestionSet with categorized questions
    """
    
    def __init__(self):
        super().__init__(
            agent_id="question-generator-agent",
            agent_name="Question Generator Agent"
        )
        self._dependencies = ["data-parser-agent"]
        
        # Question templates by category
        self._question_templates = {
            QuestionCategory.INFORMATIONAL: [
                "What is {product_name}?",
                "What does {product_name} do?",
                "What makes {product_name} unique?",
                "Is {product_name} suitable for daily use?"
            ],
            QuestionCategory.SAFETY: [
                "Is {product_name} safe to use?",
                "Are there any side effects of using {product_name}?",
                "Can I use {product_name} if I have sensitive skin?",
                "Should I do a patch test before using {product_name}?"
            ],
            QuestionCategory.USAGE: [
                "How do I use {product_name}?",
                "When should I apply {product_name}?",
                "How much {product_name} should I use?",
                "Can I use {product_name} with other products?"
            ],
            QuestionCategory.PURCHASE: [
                "What is the price of {product_name}?",
                "Is {product_name} worth the price?",
                "Where can I buy {product_name}?",
                "Are there any discounts available for {product_name}?"
            ],
            QuestionCategory.COMPARISON: [
                "How does {product_name} compare to other serums?",
                "Is {product_name} better than other Vitamin C serums?"
            ],
            QuestionCategory.INGREDIENTS: [
                "What are the key ingredients in {product_name}?",
                "What is the concentration of Vitamin C in {product_name}?",
                "Does {product_name} contain Hyaluronic Acid?"
            ],
            QuestionCategory.EFFECTIVENESS: [
                "How long does it take to see results from {product_name}?",
                "Does {product_name} really work for brightening?",
                "Can {product_name} help with dark spots?"
            ],
            QuestionCategory.SUITABILITY: [
                "Is {product_name} suitable for oily skin?",
                "Can I use {product_name} if I have combination skin?",
                "Who should use {product_name}?"
            ]
        }
    
    def validate_input(self, input_data: Product) -> bool:
        """Validate that product data is available."""
        return input_data is not None and bool(input_data.name)
    
    def execute(self, input_data: Product, context: AgentContext) -> QuestionSet:
        """Generate categorized questions for the product."""
        product = input_data
        question_set = QuestionSet(product_name=product.name)
        
        question_id = 1
        
        # Generate questions for each category
        for category in QuestionCategory:
            questions = self._generate_category_questions(
                product, category, question_id
            )
            
            for question in questions:
                question_set.add_question(question)
                question_id += 1
        
        # Store in context
        context.set("question_set", question_set)
        context.set("questions", question_set.questions)
        
        context.log(self.agent_id, "generated_questions", {
            "total_questions": len(question_set.questions),
            "categories": list(set(q.category.value for q in question_set.questions))
        })
        
        return question_set
    
    def _generate_category_questions(self, product: Product, 
                                      category: QuestionCategory,
                                      start_id: int) -> List[Question]:
        """Generate questions for a specific category."""
        questions = []
        templates = self._question_templates.get(category, [])
        
        # Filter and customize templates based on product data
        relevant_templates = self._filter_relevant_templates(
            templates, product, category
        )
        
        for i, template in enumerate(relevant_templates):
            question_text = self._fill_template(template, product)
            answer = self._generate_answer(question_text, product, category)
            
            # Determine source fields based on category
            source_fields = self._get_source_fields(category)
            
            questions.append(Question(
                question_id=f"Q{start_id + i}",
                question_text=question_text,
                category=category,
                answer=answer,
                source_fields=source_fields,
                priority=self._calculate_priority(category, i)
            ))
        
        return questions
    
    def _filter_relevant_templates(self, templates: List[str], 
                                    product: Product,
                                    category: QuestionCategory) -> List[str]:
        """Filter templates to those relevant for this product."""
        relevant = []
        
        for template in templates:
            # Check if template references specific ingredients
            template_lower = template.lower()
            
            if "vitamin c" in template_lower:
                if any("vitamin c" in i.lower() for i in product.key_ingredients):
                    relevant.append(template)
            elif "hyaluronic" in template_lower:
                if any("hyaluronic" in i.lower() for i in product.key_ingredients):
                    relevant.append(template)
            elif "oily" in template_lower:
                if any(st.value.lower() == "oily" for st in product.skin_types):
                    relevant.append(template)
            elif "combination" in template_lower:
                if any(st.value.lower() == "combination" for st in product.skin_types):
                    relevant.append(template)
            elif "brightening" in template_lower or "dark spots" in template_lower:
                if any(b.lower() in ["brightening", "fades dark spots"] for b in product.benefits):
                    relevant.append(template)
            else:
                # Generic templates are always relevant
                relevant.append(template)
        
        # Limit to 2-3 questions per category
        return relevant[:3]
    
    def _fill_template(self, template: str, product: Product) -> str:
        """Fill template placeholders with product data."""
        return template.format(
            product_name=product.name,
            concentration=product.concentration or "specified concentration",
            benefits=", ".join(product.benefits) if product.benefits else "various benefits",
            ingredients=", ".join(product.key_ingredients) if product.key_ingredients else "key ingredients"
        )
    
    def _generate_answer(self, question: str, product: Product, 
                         category: QuestionCategory) -> str:
        """Generate a contextual answer based on product data."""
        # Answers will be fully generated by the FAQ agent using content blocks
        # Here we provide preliminary answers based on available data
        
        if category == QuestionCategory.INFORMATIONAL:
            return f"{product.name} is a skincare product featuring {', '.join(product.key_ingredients)} for {', '.join(product.benefits).lower()}."
        
        elif category == QuestionCategory.SAFETY:
            if product.side_effects:
                return f"{product.side_effects}. Always perform a patch test before first use."
            return "This product is generally safe for use. Perform a patch test before first use."
        
        elif category == QuestionCategory.USAGE:
            return product.usage_instructions or "Please refer to the product label for usage instructions."
        
        elif category == QuestionCategory.PURCHASE:
            return f"{product.name} is priced at ₹{product.price}."
        
        elif category == QuestionCategory.INGREDIENTS:
            return f"Key ingredients include {', '.join(product.key_ingredients)}."
        
        elif category == QuestionCategory.EFFECTIVENESS:
            return f"{product.name} helps with {', '.join(product.benefits).lower()}."
        
        elif category == QuestionCategory.SUITABILITY:
            skin_types = ", ".join(st.value for st in product.skin_types)
            return f"{product.name} is formulated for {skin_types} skin types."
        
        elif category == QuestionCategory.COMPARISON:
            return f"For detailed comparisons, please see our comparison page."
        
        return f"Please refer to the product information for {product.name}."
    
    def _get_source_fields(self, category: QuestionCategory) -> List[str]:
        """Get product fields that inform this category."""
        field_mapping = {
            QuestionCategory.INFORMATIONAL: ["name", "benefits", "key_ingredients"],
            QuestionCategory.SAFETY: ["side_effects", "skin_types"],
            QuestionCategory.USAGE: ["usage_instructions"],
            QuestionCategory.PURCHASE: ["price", "currency"],
            QuestionCategory.COMPARISON: ["name", "key_ingredients", "benefits", "price"],
            QuestionCategory.INGREDIENTS: ["key_ingredients", "concentration"],
            QuestionCategory.EFFECTIVENESS: ["benefits"],
            QuestionCategory.SUITABILITY: ["skin_types", "side_effects"]
        }
        return field_mapping.get(category, [])
    
    def _calculate_priority(self, category: QuestionCategory, index: int) -> int:
        """Calculate priority (lower = higher priority)."""
        # Priority mapping for categories
        category_priority = {
            QuestionCategory.USAGE: 1,
            QuestionCategory.INFORMATIONAL: 2,
            QuestionCategory.SAFETY: 3,
            QuestionCategory.EFFECTIVENESS: 4,
            QuestionCategory.INGREDIENTS: 5,
            QuestionCategory.SUITABILITY: 6,
            QuestionCategory.PURCHASE: 7,
            QuestionCategory.COMPARISON: 8
        }
        
        base_priority = category_priority.get(category, 5)
        return base_priority + index
