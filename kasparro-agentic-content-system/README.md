# Kasparro AI Agentic Content Generation System

A modular, multi-agent content generation system designed to automatically generate structured, machine-readable content pages from product data.

## 🎯 Overview

This system demonstrates production-grade agentic architecture for automated content generation. It takes product data as input and generates FAQ pages, product description pages, and comparison pages through a coordinated pipeline of specialized agents.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         WORKFLOW ORCHESTRATOR                           │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    EXECUTION PIPELINE (DAG)                      │   │
│   │                                                                  │   │
│   │    ┌──────────┐     ┌──────────────┐     ┌───────────────┐      │   │
│   │    │  Data    │────▶│   Question   │────▶│   FAQ Page    │      │   │
│   │    │  Parser  │     │  Generator   │     │    Agent      │      │   │
│   │    │  Agent   │     │    Agent     │     └───────────────┘      │   │
│   │    └──────────┘     └──────────────┘                            │   │
│   │          │                                                       │   │
│   │          │          ┌───────────────┐                           │   │
│   │          ├─────────▶│  Product Page │                           │   │
│   │          │          │     Agent     │                           │   │
│   │          │          └───────────────┘                           │   │
│   │          │                                                       │   │
│   │          │          ┌───────────────┐                           │   │
│   │          └─────────▶│  Comparison   │                           │   │
│   │                     │  Page Agent   │                           │   │
│   │                     └───────────────┘                           │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    CONTENT LOGIC BLOCKS                          │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │   │
│   │  │ Benefits │ │  Usage   │ │Ingredients│ │  Safety  │ │Pricing │ │   │
│   │  │  Block   │ │  Block   │ │  Block   │ │  Block   │ │ Block  │ │   │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │   │
│   │                      ┌──────────────┐                           │   │
│   │                      │  Comparison  │                           │   │
│   │                      │    Block     │                           │   │
│   │                      └──────────────┘                           │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      TEMPLATE ENGINE                             │   │
│   │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐         │   │
│   │  │ FAQ Template │ │Product Page  │ │Comparison Template│         │   │
│   │  │              │ │  Template    │ │                  │         │   │
│   │  └──────────────┘ └──────────────┘ └──────────────────┘         │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
kasparro-agentic-content-system/
├── src/
│   ├── __init__.py
│   ├── models/                 # Data models
│   │   ├── product.py          # Product data model
│   │   ├── content.py          # Content block models
│   │   └── questions.py        # Question models
│   ├── agents/                 # Agent implementations
│   │   ├── base_agent.py       # Abstract base agent
│   │   ├── parser_agent.py     # Data parsing agent
│   │   ├── question_generator_agent.py
│   │   ├── faq_agent.py        # FAQ page generator
│   │   ├── product_page_agent.py
│   │   └── comparison_agent.py
│   ├── blocks/                 # Content logic blocks
│   │   ├── base_block.py       # Abstract base block
│   │   ├── benefits_block.py
│   │   ├── usage_block.py
│   │   ├── ingredients_block.py
│   │   ├── safety_block.py
│   │   ├── pricing_block.py
│   │   └── comparison_block.py
│   ├── templates/              # Page templates
│   │   ├── template_engine.py
│   │   ├── faq_template.py
│   │   ├── product_template.py
│   │   └── comparison_template.py
│   └── orchestrator/           # Pipeline orchestration
│       ├── pipeline.py
│       └── workflow_orchestrator.py
├── output/                     # Generated JSON outputs
│   ├── faq.json
│   ├── product_page.json
│   ├── comparison_page.json
│   └── questions.json
├── docs/
│   └── projectdocumentation.md
├── main.py                     # Entry point
└── README.md
```

## 🚀 Quick Start

### Running the System

```bash
cd kasparro-agentic-content-system
python main.py
```

### Input Data Format

```python
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
```

### Output Files

- `output/faq.json` - FAQ page with 8 categorized Q&As
- `output/product_page.json` - Complete product description page
- `output/comparison_page.json` - Comparison with fictional product
- `output/questions.json` - 18 categorized user questions

## 🧩 Components

### Agents

| Agent | Responsibility | Input | Output |
|-------|---------------|-------|--------|
| DataParserAgent | Parse raw data into Product model | Dict | Product |
| QuestionGeneratorAgent | Generate categorized questions | Product | QuestionSet |
| FAQPageAgent | Generate FAQ page | Product | GeneratedPage |
| ProductPageAgent | Generate product description | Product | GeneratedPage |
| ComparisonPageAgent | Generate comparison page | Product | GeneratedPage |

### Content Logic Blocks

| Block | Purpose |
|-------|---------|
| BenefitsBlock | Transform benefits into multiple formats |
| UsageBlock | Parse usage instructions into steps |
| IngredientsBlock | Enrich ingredient data |
| SafetyBlock | Generate safety warnings and precautions |
| PricingBlock | Format pricing and value propositions |
| ComparisonBlock | Generate product comparisons |

### Templates

| Template | Output Structure |
|----------|-----------------|
| FAQTemplate | Q&A entries, categories, quick links |
| ProductPageTemplate | Hero, benefits, ingredients, usage, safety sections |
| ComparisonPageTemplate | Comparison table, winners, recommendations |

## 📊 Pipeline Flow

```
Raw Data → DataParserAgent → Product Model
                ↓
        QuestionGeneratorAgent → 18 Questions (8 categories)
                ↓
    ┌───────────┼───────────┐
    ↓           ↓           ↓
FAQAgent  ProductAgent  ComparisonAgent
    ↓           ↓           ↓
faq.json  product.json  comparison.json
```

## 🔧 Extensibility

### Adding New Agents

```python
class CustomAgent(BaseAgent[InputType, OutputType]):
    def __init__(self):
        super().__init__("custom-agent", "Custom Agent")
        self._dependencies = ["data-parser-agent"]
    
    def validate_input(self, input_data: InputType) -> bool:
        return True
    
    def execute(self, input_data: InputType, context: AgentContext) -> OutputType:
        # Implementation
        pass
```

### Adding New Content Blocks

```python
class CustomBlock(ContentLogicBlock):
    def __init__(self):
        super().__init__("custom-block", "Custom Block")
    
    def get_required_fields(self) -> List[str]:
        return ["field1", "field2"]
    
    def process(self, product: Product, context: Dict) -> ContentBlock:
        # Implementation
        pass
```

## 📝 License

MIT License

## 👤 Author

Kasparro AI Assignment
