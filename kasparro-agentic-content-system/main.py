"""
Main Entry Point
Run the complete content generation pipeline.
"""

import json
import os
from src.orchestrator import WorkflowOrchestrator


# Product data from assignment
PRODUCT_DATA = {
    "Product Name": "GlowBoost Vitamin C Serum",
    "Concentration": "10% Vitamin C",
    "Skin Type": "Oily, Combination",
    "Key Ingredients": "Vitamin C, Hyaluronic Acid",
    "Benefits": "Brightening, Fades dark spots",
    "How to Use": "Apply 2–3 drops in the morning before sunscreen",
    "Side Effects": "Mild tingling for sensitive skin",
    "Price": "₹699"
}


def main():
    """Main entry point for the content generation system."""
    
    print("=" * 60)
    print("Kasparro AI Agentic Content Generation System")
    print("=" * 60)
    print()
    
    # Initialize orchestrator
    print("[1/4] Initializing orchestrator and agents...")
    orchestrator = WorkflowOrchestrator()
    
    # Build pipeline
    print("[2/4] Building content generation pipeline...")
    pipeline = orchestrator.build_content_generation_pipeline()
    print(f"      Pipeline created with {len(pipeline.steps)} steps:")
    for step in pipeline.steps:
        deps = f" (depends on: {', '.join(step.dependencies)})" if step.dependencies else ""
        print(f"      - {step.name}{deps}")
    print()
    
    # Execute pipeline
    print("[3/4] Executing pipeline...")
    print(f"      Input product: {PRODUCT_DATA['Product Name']}")
    print()
    
    outputs = orchestrator.execute_pipeline(PRODUCT_DATA)
    
    # Display execution summary
    summary = orchestrator.get_pipeline_summary()
    print(f"      Pipeline Status: {'COMPLETE' if summary['is_complete'] else 'INCOMPLETE'}")
    print(f"      Steps completed: {summary['status_breakdown']['completed']}/{summary['total_steps']}")
    print()
    
    # Export outputs
    print("[4/4] Exporting outputs to JSON files...")
    output_dir = "output"
    exported_files = orchestrator.export_outputs_to_json(output_dir)
    
    print(f"      Exported {len(exported_files)} files to '{output_dir}/' directory:")
    for file_type, file_path in exported_files.items():
        print(f"      - {file_path}")
    print()
    
    # Display generated content summary
    print("=" * 60)
    print("Generated Content Summary")
    print("=" * 60)
    
    context = orchestrator.get_context()
    
    # Questions summary
    question_set = context.get("question_set")
    if question_set:
        print(f"\nQuestions Generated: {len(question_set.questions)}")
        categories = {}
        for q in question_set.questions:
            cat = q.category.value
            categories[cat] = categories.get(cat, 0) + 1
        for cat, count in categories.items():
            print(f"  - {cat}: {count}")
    
    # FAQ page summary
    faq_page = context.get("faq_page")
    if faq_page:
        print(f"\nFAQ Page: {faq_page.content['total_questions']} Q&As")
    
    # Product page summary
    product_page = context.get("product_page")
    if product_page:
        print(f"\nProduct Page: {product_page.title}")
        sections = ["hero", "benefits_section", "ingredients_section", 
                   "usage_section", "safety_section", "pricing_section"]
        print(f"  Sections: {len([s for s in sections if s in product_page.content])}")
    
    # Comparison page summary
    comparison_page = context.get("comparison_page")
    if comparison_page:
        print(f"\nComparison Page: {comparison_page.title}")
    
    print()
    print("=" * 60)
    print("Pipeline execution complete!")
    print("=" * 60)
    
    return outputs


if __name__ == "__main__":
    main()
