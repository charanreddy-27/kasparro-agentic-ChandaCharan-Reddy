# Project Documentation

## Problem Statement

Design and implement a modular agentic automation system that takes a small product dataset and automatically generates structured, machine-readable content pages. The system must demonstrate:
- Multi-agent workflows
- Automation graphs (DAG-based pipeline)
- Reusable content logic blocks
- Template-based generation
- Structured JSON output
- System abstraction and documentation

## Solution Overview

The solution implements a **Multi-Agent Content Generation System** with the following architecture:

### Core Design Principles

1. **Single Responsibility**: Each agent handles one specific task
2. **Loose Coupling**: Agents communicate through a shared context, not direct dependencies
3. **Composability**: Content blocks and templates can be mixed and matched
4. **Extensibility**: New agents, blocks, and templates can be added without modifying existing code
5. **Deterministic Flow**: DAG-based pipeline ensures correct execution order

### System Components

#### 1. Data Layer (Models)
- **Product**: Internal representation of product data with validation
- **ContentBlock**: Output of content logic blocks
- **Question**: User question with category and answer
- **GeneratedPage**: Final page output ready for JSON export

#### 2. Agent Layer
- **DataParserAgent**: Normalizes raw input into structured Product model
- **QuestionGeneratorAgent**: Creates 18 categorized user questions
- **FAQPageAgent**: Orchestrates blocks/template to produce FAQ page
- **ProductPageAgent**: Orchestrates blocks/template to produce product page
- **ComparisonPageAgent**: Generates comparison with fictional product

#### 3. Content Logic Blocks
- **BenefitsBlock**: Transforms benefits into headlines, lists, summaries
- **UsageBlock**: Parses usage into steps, timing, dosage
- **IngredientsBlock**: Enriches ingredients with descriptions and categories
- **SafetyBlock**: Generates warnings, precautions, patch test info
- **PricingBlock**: Formats price and generates value propositions
- **ComparisonBlock**: Creates feature-by-feature product comparison

#### 4. Template Engine
- **FAQTemplate**: Defines FAQ page structure and rendering rules
- **ProductPageTemplate**: Defines product page sections and SEO data
- **ComparisonPageTemplate**: Defines comparison table and recommendations

#### 5. Orchestrator
- **Pipeline**: DAG-based step management with dependency resolution
- **WorkflowOrchestrator**: Central coordinator managing agents and context

## Scopes & Assumptions

### In Scope
- Processing single product JSON input
- Generating FAQ, Product Description, and Comparison pages
- Creating 15+ categorized user questions
- Machine-readable JSON output
- Modular, extensible architecture

### Assumptions
- Input data follows the provided schema (Product Name, Price, etc.)
- Fictional Product B is auto-generated for comparison
- All content is derived from input data (no external research)
- Output is JSON (not rendered HTML/UI)

### Out of Scope
- Multi-product batch processing
- External API integrations
- Database persistence
- User interface
- Real-time content updates

## System Design

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INPUT LAYER                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      Raw Product Data (JSON)                         │   │
│   │  {Product Name, Concentration, Skin Type, Ingredients, Benefits...}  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATION LAYER                                  │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    WorkflowOrchestrator                              │   │
│   │  • Manages agent lifecycle                                          │   │
│   │  • Maintains shared AgentContext                                    │   │
│   │  • Coordinates pipeline execution                                    │   │
│   │  • Handles error recovery                                           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Pipeline (DAG)                                    │   │
│   │                                                                      │   │
│   │     Step 1          Step 2           Step 3,4,5                     │   │
│   │   ┌────────┐     ┌──────────┐     ┌───────────────┐                 │   │
│   │   │ Parse  │────▶│ Generate │────▶│ FAQ/Product/  │                 │   │
│   │   │ Data   │     │Questions │     │ Comparison    │                 │   │
│   │   └────────┘     └──────────┘     └───────────────┘                 │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AGENT LAYER                                       │
│                                                                              │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                    │
│   │ DataParser   │   │ Question     │   │ FAQPage      │                    │
│   │ Agent        │   │ Generator    │   │ Agent        │                    │
│   │              │   │ Agent        │   │              │                    │
│   │ Input: Dict  │   │ Input:Product│   │ Input:Product│                    │
│   │ Output:      │   │ Output:      │   │ Output:      │                    │
│   │  Product     │   │  QuestionSet │   │  GeneratedPage                   │
│   └──────────────┘   └──────────────┘   └──────────────┘                    │
│                                                                              │
│   ┌──────────────┐   ┌──────────────┐                                       │
│   │ ProductPage  │   │ Comparison   │                                       │
│   │ Agent        │   │ Agent        │                                       │
│   │              │   │              │                                       │
│   │ Input:Product│   │ Input:Product│                                       │
│   │ Output:      │   │ Output:      │                                       │
│   │  GeneratedPage   │  GeneratedPage                                      │
│   └──────────────┘   └──────────────┘                                       │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CONTENT LOGIC LAYER                                    │
│                                                                              │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│   │ Benefits   │ │ Usage      │ │Ingredients │ │ Safety     │ │ Pricing  │ │
│   │ Block      │ │ Block      │ │ Block      │ │ Block      │ │ Block    │ │
│   │            │ │            │ │            │ │            │ │          │ │
│   │• Summary   │ │• Steps     │ │• Details   │ │• Warnings  │ │• Format  │ │
│   │• Headline  │ │• Timing    │ │• Hero      │ │• Precaution│ │• Value   │ │
│   │• Detailed  │ │• Dosage    │ │• Categories│ │• Patch test│ │• CTA     │ │
│   └────────────┘ └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
│                                                                              │
│   ┌────────────────────────────────────────────┐                            │
│   │ Comparison Block                           │                            │
│   │ • Feature comparison  • Price comparison   │                            │
│   │ • Ingredient overlap  • Winner by category │                            │
│   └────────────────────────────────────────────┘                            │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TEMPLATE LAYER                                       │
│                                                                              │
│   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐           │
│   │ FAQ Template     │ │ Product Template │ │Comparison Template│           │
│   │                  │ │                  │ │                  │           │
│   │ Required Blocks: │ │ Required Blocks: │ │ Required Blocks: │           │
│   │ • benefits       │ │ • benefits       │ │ • comparison     │           │
│   │ • usage          │ │ • usage          │ │                  │           │
│   │ • safety         │ │ • safety         │ │ Structure:       │           │
│   │ • ingredients    │ │ • ingredients    │ │ • Header         │           │
│   │ • pricing        │ │ • pricing        │ │ • Comparison table│          │
│   │                  │ │                  │ │ • Winners        │           │
│   │ Structure:       │ │ Structure:       │ │ • Recommendation │           │
│   │ • FAQ entries    │ │ • Hero section   │ │                  │           │
│   │ • Categories     │ │ • Benefits       │ │                  │           │
│   │ • Quick links    │ │ • Ingredients    │ │                  │           │
│   │                  │ │ • Usage          │ │                  │           │
│   │                  │ │ • Safety         │ │                  │           │
│   │                  │ │ • Pricing        │ │                  │           │
│   └──────────────────┘ └──────────────────┘ └──────────────────┘           │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OUTPUT LAYER                                       │
│                                                                              │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────┐    │
│   │  faq.json    │   │product_page  │   │comparison_   │   │questions │    │
│   │              │   │   .json      │   │  page.json   │   │  .json   │    │
│   │ 8 Q&As       │   │ 6 sections   │   │ 2 products   │   │18 questions   │
│   │ 8 categories │   │ SEO data     │   │ comparison   │   │8 categories   │
│   └──────────────┘   └──────────────┘   └──────────────┘   └──────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Execution Sequence Diagram

```
┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   Main   │ │Orchestrator│ │  Parser  │ │ Question │ │   FAQ    │ │ Product  │
└────┬─────┘ └─────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │             │            │            │            │            │
     │ execute()   │            │            │            │            │
     │────────────▶│            │            │            │            │
     │             │            │            │            │            │
     │             │ run()      │            │            │            │
     │             │───────────▶│            │            │            │
     │             │            │            │            │            │
     │             │   Product  │            │            │            │
     │             │◀───────────│            │            │            │
     │             │            │            │            │            │
     │             │        run(Product)     │            │            │
     │             │───────────────────────▶│            │            │
     │             │            │            │            │            │
     │             │      QuestionSet        │            │            │
     │             │◀───────────────────────│            │            │
     │             │            │            │            │            │
     │             │                 run(Product)        │            │
     │             │────────────────────────────────────▶│            │
     │             │            │            │            │            │
     │             │            │            │   Process Blocks        │
     │             │            │            │   ┌───────┴───────┐     │
     │             │            │            │   │ BenefitsBlock │     │
     │             │            │            │   │ UsageBlock    │     │
     │             │            │            │   │ SafetyBlock   │     │
     │             │            │            │   │ IngredientsBlock    │
     │             │            │            │   │ PricingBlock  │     │
     │             │            │            │   └───────┬───────┘     │
     │             │            │            │           │            │
     │             │            │            │   Render Template      │
     │             │            │            │   ┌───────┴───────┐     │
     │             │            │            │   │  FAQTemplate  │     │
     │             │            │            │   └───────┬───────┘     │
     │             │            │            │           │            │
     │             │                GeneratedPage (FAQ)  │            │
     │             │◀────────────────────────────────────│            │
     │             │            │            │            │            │
     │             │                      run(Product)                │
     │             │─────────────────────────────────────────────────▶│
     │             │            │            │            │            │
     │             │                                   GeneratedPage  │
     │             │◀─────────────────────────────────────────────────│
     │             │            │            │            │            │
     │   outputs   │            │            │            │            │
     │◀────────────│            │            │            │            │
     │             │            │            │            │            │
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA TRANSFORMATION                           │
└─────────────────────────────────────────────────────────────────────┘

Raw Input (Dict)
    │
    ▼
┌─────────────────┐
│ DataParserAgent │
│                 │
│ • Normalize keys│
│ • Parse types   │
│ • Validate      │
└────────┬────────┘
         │
         ▼
    Product Model
    ┌─────────────────────────────────────────┐
    │ name: "GlowBoost Vitamin C Serum"       │
    │ concentration: "10% Vitamin C"           │
    │ skin_types: [OILY, COMBINATION]          │
    │ key_ingredients: ["Vitamin C", "HA"]     │
    │ benefits: ["Brightening", "Fades spots"] │
    │ usage_instructions: "Apply 2-3 drops..." │
    │ side_effects: "Mild tingling..."         │
    │ price: 699.0                             │
    │ currency: "INR"                          │
    └─────────────────────────────────────────┘
         │
         ├──────────────────────┬────────────────────┐
         │                      │                    │
         ▼                      ▼                    ▼
  ┌─────────────┐       ┌─────────────┐      ┌─────────────┐
  │  Benefits   │       │   Usage     │      │ Ingredients │
  │   Block     │       │   Block     │      │    Block    │
  └──────┬──────┘       └──────┬──────┘      └──────┬──────┘
         │                     │                    │
         ▼                     ▼                    ▼
  ContentBlock          ContentBlock          ContentBlock
  • benefits_list       • usage_steps         • ingredients_detailed
  • benefits_summary    • quick_guide         • hero_ingredient
  • benefits_headline   • timing, dosage      • concentration_info
         │                     │                    │
         └──────────────┬──────┴────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │ Template Engine │
              │                 │
              │ Compose blocks  │
              │ Apply rules     │
              │ Format output   │
              └────────┬────────┘
                       │
                       ▼
                GeneratedPage
                ┌────────────────────────────────────┐
                │ page_type: "product_page"          │
                │ title: "GlowBoost Vitamin C Serum" │
                │ content: {                         │
                │   hero: {...},                     │
                │   benefits_section: {...},         │
                │   ingredients_section: {...},      │
                │   usage_section: {...},            │
                │   safety_section: {...},           │
                │   pricing_section: {...}           │
                │ }                                  │
                │ metadata: {...}                    │
                └────────────────────────────────────┘
                       │
                       ▼
                   JSON Output
```

### Agent Communication Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AGENT CONTEXT                                 │
│                  (Shared State Container)                            │
│                                                                      │
│   data: {                                                           │
│     "raw_input": {...},                                             │
│     "product": Product,                                             │
│     "question_set": QuestionSet,                                    │
│     "questions": [...],                                             │
│     "faq_page": GeneratedPage,                                      │
│     "product_page": GeneratedPage,                                  │
│     "comparison_page": GeneratedPage,                               │
│     "comparison_product": Product                                   │
│   }                                                                  │
│                                                                      │
│   messages: [AgentMessage, ...]                                     │
│                                                                      │
│   execution_log: [                                                  │
│     {agent_id, action, details, timestamp},                         │
│     ...                                                             │
│   ]                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        │                     │                     │
   ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
   │ Agent A │          │ Agent B │          │ Agent C │
   │         │          │         │          │         │
   │ context │          │ context │          │ context │
   │ .set()  │          │ .get()  │          │ .set()  │
   │ .log()  │          │ .set()  │          │ .get()  │
   └─────────┘          └─────────┘          └─────────┘

Agents DO NOT communicate directly.
All data passes through AgentContext.
```

## Key Design Decisions

### 1. DAG-Based Pipeline
- Ensures correct execution order
- Allows parallel execution of independent steps
- Makes dependencies explicit and verifiable

### 2. Content Logic Blocks as Reusable Units
- Single transformation responsibility per block
- Can be composed differently by different templates
- Easy to add new blocks without modifying agents

### 3. Template-Based Rendering
- Separates content generation from page structure
- Templates define required blocks and composition rules
- Easy to add new page types

### 4. Shared Context Over Direct Communication
- Agents don't know about each other directly
- Context acts as message bus and state store
- Enables easier testing and debugging

### 5. Type Safety with Dataclasses
- Clear input/output contracts
- Self-documenting code
- IDE support for autocomplete and validation
