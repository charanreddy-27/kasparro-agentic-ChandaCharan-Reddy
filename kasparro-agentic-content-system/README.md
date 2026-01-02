# Kasparro Agentic Content System

A **true multi-agent content generation system** built in TypeScript that autonomously generates machine-readable content pages from structured product data.

## 🚀 Features

- **6 Independent Agents** with explicit input/output contracts
- **Reusable Logic Blocks** for content transformation
- **Declarative Templates** defining page structure
- **Central Orchestrator** coordinating agent execution (no business logic)
- **Pure JSON Output** - No markdown, no prose, no UI

## 📦 Generated Pages

1. **FAQ Page** (`faq.json`) - 18+ categorized Q&As
2. **Product Page** (`product_page.json`) - Complete product information
3. **Comparison Page** (`comparison_page.json`) - Product comparison matrix

## 🏗️ Architecture

```
Orchestrator
    ├── DataIngestionAgent      → ProductModel
    ├── QuestionGenerationAgent → QuestionSet (15+ Q&As)
    ├── ContentLogicAgent       → Content Blocks
    ├── TemplateAgent           → Page Templates
    └── PageAssemblyAgent       → Final JSON Pages
```

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Run the system
npm start
```

## 📁 Project Structure

```
src/
├── agents/           # 6 independent agents
├── logic/            # Reusable logic blocks
├── templates/        # Declarative page templates
├── models/           # TypeScript interfaces
└── main.ts           # Entry point

output/               # Generated JSON files
docs/                 # Project documentation
```

## 📖 Documentation

See [docs/projectdocumentation.md](docs/projectdocumentation.md) for detailed system design and architecture.

## 🔧 Input Data

```json
{
  "product_name": "GlowBoost Vitamin C Serum",
  "concentration": "10% Vitamin C",
  "skin_type": ["Oily", "Combination"],
  "key_ingredients": ["Vitamin C", "Hyaluronic Acid"],
  "benefits": ["Brightening", "Fades dark spots"],
  "how_to_use": "Apply 2–3 drops in the morning before sunscreen",
  "side_effects": "Mild tingling for sensitive skin",
  "price": 699
}
```

## 📄 License

MIT
