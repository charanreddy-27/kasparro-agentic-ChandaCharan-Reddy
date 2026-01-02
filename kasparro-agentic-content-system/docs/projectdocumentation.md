# Kasparro Agentic Content System

## Project Documentation

---

## Problem Statement

Modern e-commerce and content platforms require dynamic, consistent, and scalable content generation for product pages. Manual content creation is:

- **Time-consuming**: Each product requires multiple content pieces (FAQs, descriptions, comparisons)
- **Inconsistent**: Different writers produce varying quality and style
- **Non-scalable**: Adding new products requires proportional human effort
- **Error-prone**: Manual processes lead to inconsistencies and omissions

The challenge is to build an **autonomous, multi-agent content generation system** that takes structured product data and generates machine-readable content pages without human intervention, while maintaining consistency, accuracy, and extensibility.

---

## Solution Overview

This project implements a **true multi-agent architecture** for autonomous content generation. The system consists of:

- **6 Independent Agents** - Each with explicit input/output contracts
- **Reusable Logic Blocks** - Pure functions for content transformation
- **Declarative Templates** - JSON schemas defining page structure
- **Central Orchestrator** - Coordinates agent execution without business logic

### Key Design Principles

1. **Agent Autonomy**: Each agent operates independently with no shared global state
2. **Explicit Contracts**: All agents have typed input/output interfaces
3. **Functional Purity**: Logic blocks are side-effect-free pure functions
4. **Template-Driven**: Page structure defined declaratively, not imperatively
5. **Pipeline Architecture**: Orchestrator coordinates via DAG execution

---

## Scopes & Assumptions

### In Scope

- Single product data ingestion and normalization
- Generation of 3 page types: FAQ, Product Page, Comparison Page
- Minimum 15 categorized questions for FAQ
- Fictional competitor product for comparison
- JSON-only output (no markdown, no prose, no UI)

### Assumptions

1. Input data follows the specified JSON schema
2. Product is a skincare/cosmetic item
3. Currency is INR (Indian Rupee)
4. Single product comparison (1 real vs 1 fictional)
5. English language content only

### Out of Scope

- Multi-product batch processing
- Real-time content updates
- Database persistence
- API endpoints
- User interface
- Multi-language support

---

## System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR AGENT                               │
│                    (Pipeline Coordinator - No Business Logic)            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│    DATA       │          │   QUESTION    │          │   CONTENT     │
│  INGESTION    │─────────▶│  GENERATION   │          │    LOGIC      │
│    AGENT      │          │    AGENT      │          │    AGENT      │
└───────────────┘          └───────────────┘          └───────────────┘
        │                           │                           │
        │                           │                    ┌──────┴──────┐
        ▼                           │                    ▼             ▼
┌───────────────┐                   │          ┌─────────────┐ ┌───────────┐
│   PRODUCT     │                   │          │   LOGIC     │ │ TEMPLATES │
│    MODEL      │                   │          │   BLOCKS    │ │           │
└───────────────┘                   │          └─────────────┘ └───────────┘
                                    │                   │             │
                                    ▼                   ▼             ▼
                           ┌───────────────┐   ┌───────────────────────────┐
                           │   TEMPLATE    │   │      PAGE ASSEMBLY        │
                           │    AGENT      │──▶│         AGENT             │
                           └───────────────┘   └───────────────────────────┘
                                                          │
                                    ┌─────────────────────┼─────────────────────┐
                                    ▼                     ▼                     ▼
                            ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
                            │   faq.json   │     │product_page  │     │comparison    │
                            │              │     │   .json      │     │  _page.json  │
                            └──────────────┘     └──────────────┘     └──────────────┘
```

### Data Flow Diagram

```
Raw Product JSON
       │
       ▼
┌──────────────────┐
│ DataIngestion    │ ──────▶ ProductModel (normalized)
│     Agent        │
└──────────────────┘
       │
       ├────────────────────────────────────┐
       ▼                                    ▼
┌──────────────────┐               ┌──────────────────┐
│ QuestionGen      │               │  ContentLogic    │
│    Agent         │               │     Agent        │
└──────────────────┘               └──────────────────┘
       │                                    │
       ▼                                    ▼
  QuestionSet                       Content Blocks
  (15+ Q&As)                     (benefits, usage, etc.)
       │                                    │
       └────────────────┬───────────────────┘
                        ▼
               ┌──────────────────┐
               │  TemplateAgent   │ ──────▶ Page Templates
               └──────────────────┘
                        │
                        ▼
               ┌──────────────────┐
               │ PageAssembly     │
               │    Agent         │
               └──────────────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
      faq.json   product_page   comparison_page
                    .json           .json
```

---

## Agent Responsibilities

### 1. DataIngestionAgent

**Purpose**: Normalize raw product data into internal model

| Aspect | Details |
|--------|---------|
| Input | `RawProductData` (raw JSON) |
| Output | `ProductModel` (normalized) |
| Responsibilities | Validation, normalization, ID generation, metadata creation |

```typescript
interface DataIngestionInput {
  rawData: RawProductData;
}

interface DataIngestionOutput {
  product: ProductModel;
  validationResult: { valid: boolean; warnings: string[] };
}
```

### 2. QuestionGenerationAgent

**Purpose**: Generate categorized Q&A from product model

| Aspect | Details |
|--------|---------|
| Input | `ProductModel` |
| Output | `QuestionSet` (>=15 questions) |
| Categories | informational, safety, usage, purchase, comparison |

```typescript
interface QuestionGenerationInput {
  product: ProductModel;
  minQuestions?: number;
}

interface QuestionGenerationOutput {
  questionSet: QuestionSet;
}
```

### 3. ContentLogicAgent

**Purpose**: Own and expose reusable logic blocks

| Aspect | Details |
|--------|---------|
| Input | `ProductModel`, optional `ComparisonProduct` |
| Output | `GeneratedBlocks` |
| Blocks | benefits, usage, safety, pricing, ingredients, description, comparison |

**Logic Blocks**:
- `generateBenefitsBlock()` - Extract and format product benefits
- `extractUsageBlock()` - Parse usage instructions into steps
- `safetyNotesBlock()` - Generate safety warnings and side effects
- `priceBlock()` - Format pricing information
- `ingredientComparisonBlock()` - Compare ingredients between products

### 4. TemplateAgent

**Purpose**: Own and manage declarative page templates

| Aspect | Details |
|--------|---------|
| Input | `templateType` (faq/product/comparison) |
| Output | Template schema, validation rules, required blocks |
| Templates | FAQ, Product Page, Comparison Page |

**Template Types**:
- `FAQTemplateSchema` - Defines FAQ page structure
- `ProductTemplateSchema` - Defines product page sections
- `ComparisonTemplateSchema` - Defines comparison matrix structure

### 5. PageAssemblyAgent

**Purpose**: Combine model, blocks, and templates into final pages

| Aspect | Details |
|--------|---------|
| Input | `ProductModel` + `Blocks` + `Template` |
| Output | Final JSON page |
| Responsibility | Pure assembly, no business logic |

### 6. OrchestratorAgent

**Purpose**: Coordinate agent execution pipeline

| Aspect | Details |
|--------|---------|
| Input | Raw product data, pages to generate |
| Output | Generated pages, execution log, summary |
| Responsibility | Execution order, message passing, NO business logic |

---

## Logic Blocks

Reusable, pure functions for content transformation:

| Block | File | Purpose |
|-------|------|---------|
| Benefits | `benefits.logic.ts` | Generate benefit descriptions, categorization |
| Usage | `usage.logic.ts` | Parse instructions, timing recommendations |
| Safety | `safety.logic.ts` | Generate warnings, side effect parsing |
| Pricing | `price.logic.ts` | Format prices, tier calculation |
| Ingredients | `ingredients.logic.ts` | Categorize, check interactions |
| Comparison | `comparison.logic.ts` | Generate comparison matrices |

---

## Templates

Declarative JSON schemas defining page structure:

### FAQ Template

```typescript
{
  pageType: 'faq',
  sections: [
    { id: 'informational', minQuestions: 1, maxQuestions: 5 },
    { id: 'usage', minQuestions: 1, maxQuestions: 5 },
    { id: 'safety', minQuestions: 1, maxQuestions: 5 },
    { id: 'purchase', minQuestions: 1, maxQuestions: 3 },
    { id: 'comparison', minQuestions: 1, maxQuestions: 3 }
  ],
  metadata: { totalMinQuestions: 5 }
}
```

### Product Template

```typescript
{
  pageType: 'product',
  sections: [
    { id: 'description', source: 'generateDescriptionBlock' },
    { id: 'ingredients', source: 'generateIngredientsBlock' },
    { id: 'benefits', source: 'generateBenefitsBlock' },
    { id: 'usage', source: 'extractUsageBlock' },
    { id: 'safety', source: 'safetyNotesBlock' },
    { id: 'pricing', source: 'priceBlock' }
  ]
}
```

### Comparison Template

```typescript
{
  pageType: 'comparison',
  sections: ['header', 'products', 'matrix', 'summary'],
  comparisonCategories: ['ingredients', 'benefits', 'pricing', 'features'],
  metadata: { productCount: 2, requireFictionalProduct: true }
}
```

---

## Repository Structure

```
kasparro-agentic-content-system/
├── src/
│   ├── agents/
│   │   ├── BaseAgent.ts              # Abstract base class
│   │   ├── DataIngestionAgent.ts     # Data normalization
│   │   ├── QuestionGenerationAgent.ts # Q&A generation
│   │   ├── ContentLogicAgent.ts      # Logic block orchestration
│   │   ├── TemplateAgent.ts          # Template management
│   │   ├── PageAssemblyAgent.ts      # Page construction
│   │   ├── OrchestratorAgent.ts      # Pipeline coordinator
│   │   └── index.ts
│   ├── logic/
│   │   ├── benefits.logic.ts         # Benefits processing
│   │   ├── usage.logic.ts            # Usage instructions
│   │   ├── safety.logic.ts           # Safety warnings
│   │   ├── price.logic.ts            # Pricing logic
│   │   ├── ingredients.logic.ts      # Ingredient handling
│   │   ├── comparison.logic.ts       # Comparison matrix
│   │   └── index.ts
│   ├── templates/
│   │   ├── faq.template.ts           # FAQ schema
│   │   ├── product.template.ts       # Product page schema
│   │   ├── comparison.template.ts    # Comparison schema
│   │   └── index.ts
│   ├── models/
│   │   ├── ProductModel.ts           # Core data models
│   │   ├── QuestionModel.ts          # Question structures
│   │   ├── PageModel.ts              # Page output models
│   │   └── index.ts
│   └── main.ts                       # Entry point
├── output/
│   ├── faq.json                      # Generated FAQ page
│   ├── product_page.json             # Generated product page
│   ├── comparison_page.json          # Generated comparison page
│   ├── questions.json                # All generated questions
│   └── execution_summary.json        # Pipeline execution log
├── docs/
│   └── projectdocumentation.md       # This file
├── package.json
├── tsconfig.json
└── README.md
```

---

## Execution Flow

1. **Initialize** - OrchestratorAgent creates all child agents
2. **Ingest** - DataIngestionAgent normalizes raw product JSON
3. **Generate Questions** - QuestionGenerationAgent creates 15+ Q&As
4. **Load Templates** - TemplateAgent provides page schemas
5. **Generate Blocks** - ContentLogicAgent produces content blocks
6. **Assemble Pages** - PageAssemblyAgent combines everything
7. **Output** - JSON files written to `/output` directory

---

## Running the System

```bash
# Install dependencies
npm install

# Run the system
npm start
# or
npx ts-node src/main.ts
```

---

## Output Files

| File | Description |
|------|-------------|
| `faq.json` | FAQ page with 18+ categorized Q&As |
| `product_page.json` | Complete product page with all sections |
| `comparison_page.json` | GlowBoost vs RadiantClear comparison |
| `questions.json` | All generated questions (flat list) |
| `execution_summary.json` | Pipeline execution log and metrics |

---

## Extensibility

The system is designed for easy extension:

- **New Agents**: Extend `BaseAgent` class
- **New Logic Blocks**: Add to `/logic` directory
- **New Templates**: Add to `/templates` directory
- **New Page Types**: Add template + assembly logic
- **New Products**: Pass different `RawProductData`

---

## Key Technical Decisions

1. **TypeScript** - Strong typing for contract enforcement
2. **No External AI Calls** - All logic is deterministic
3. **Pure Functions** - Logic blocks have no side effects
4. **Async Agents** - Future-proof for async operations
5. **JSON Output Only** - Machine-readable, no formatting

---

## Fictional Product B

For comparison page, the system uses:

```json
{
  "name": "RadiantClear Serum",
  "ingredients": ["Niacinamide", "Salicylic Acid", "Green Tea Extract"],
  "benefits": ["Pore minimizing", "Oil control", "Soothing"],
  "price": 799,
  "concentration": "5% Niacinamide",
  "skinTypes": ["Oily", "Acne-prone"]
}
```

---

## Conclusion

This multi-agent content generation system demonstrates a true agentic architecture with:

- ✅ Independent agents with explicit contracts
- ✅ No shared global state
- ✅ Central orchestrator without business logic
- ✅ Reusable logic blocks and templates
- ✅ Pure JSON output
- ✅ Extensible design

The system successfully generates 3 structured content pages from a single product data input, demonstrating autonomous content generation capabilities.
