"use strict";
/**
 * main.ts
 * Entry point for the TRUE Multi-Agent Content Generation System
 *
 * ARCHITECTURE OVERVIEW:
 * This system uses TRUE agent autonomy with message-passing architecture:
 *
 * 1. AUTONOMOUS AGENTS: Each agent extends AutonomousAgent base class
 *    - Self-registers with AgentRegistry
 *    - Subscribes to relevant message types
 *    - Reacts to messages autonomously (no direct invocation)
 *
 * 2. MESSAGE BUS: Central communication system
 *    - Publish/Subscribe pattern
 *    - Decoupled agent communication
 *    - No hard-coded dependencies between agents
 *
 * 3. EVENT-DRIVEN ORCHESTRATION:
 *    - Orchestrator publishes events, does NOT call agents directly
 *    - Agents react to events and publish their results
 *    - Pipeline completes when all expected pages are assembled
 *
 * 4. DYNAMIC COORDINATION:
 *    - Agents can be added/removed at runtime
 *    - AgentRegistry tracks capabilities and status
 *    - TaskQueue enables distributed task assignment
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Core infrastructure
const MessageBus_1 = require("./core/MessageBus");
const AgentRegistry_1 = require("./core/AgentRegistry");
const TaskQueue_1 = require("./core/TaskQueue");
// Autonomous agents
const DataIngestionAgent_1 = require("./agents/DataIngestionAgent");
const QuestionGenerationAgent_1 = require("./agents/QuestionGenerationAgent");
const ContentLogicAgent_1 = require("./agents/ContentLogicAgent");
const TemplateAgent_1 = require("./agents/TemplateAgent");
const PageAssemblyAgent_1 = require("./agents/PageAssemblyAgent");
const OrchestratorAgent_1 = require("./agents/OrchestratorAgent");
/**
 * Input product data - single source of truth
 */
const PRODUCT_DATA = {
    product_name: "GlowBoost Vitamin C Serum",
    concentration: "10% Vitamin C",
    skin_type: ["Oily", "Combination"],
    key_ingredients: ["Vitamin C", "Hyaluronic Acid"],
    benefits: ["Brightening", "Fades dark spots"],
    how_to_use: "Apply 2–3 drops in the morning before sunscreen",
    side_effects: "Mild tingling for sensitive skin",
    price: 699
};
/**
 * Output directory for generated JSON files
 */
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
/**
 * Ensure output directory exists
 */
function ensureOutputDirectory() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
}
/**
 * Write JSON output to file
 */
function writeJsonOutput(filename, data) {
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`   ✓ Generated: ${filename}`);
}
/**
 * Print agent architecture diagram
 */
function printArchitecture() {
    console.log('');
    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│                    AGENT COMMUNICATION FLOW                     │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log('│                                                                 │');
    console.log('│   ┌──────────────────────────────────────────────────────┐     │');
    console.log('│   │                    MESSAGE BUS                        │     │');
    console.log('│   │         (Publish/Subscribe Communication)             │     │');
    console.log('│   └────┬───────┬───────┬───────┬───────┬───────┬────────┘     │');
    console.log('│        │       │       │       │       │       │              │');
    console.log('│        ▼       ▼       ▼       ▼       ▼       ▼              │');
    console.log('│   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │');
    console.log('│   │ DATA   │ │QUESTION│ │CONTENT │ │TEMPLATE│ │  PAGE  │     │');
    console.log('│   │INGEST  │ │  GEN   │ │ LOGIC  │ │ AGENT  │ │ASSEMBLY│     │');
    console.log('│   │ AGENT  │ │ AGENT  │ │ AGENT  │ │        │ │ AGENT  │     │');
    console.log('│   └────────┘ └────────┘ └────────┘ └────────┘ └────────┘     │');
    console.log('│        │       │       │       │       │       │              │');
    console.log('│        └───────┴───────┴───────┴───────┴───────┘              │');
    console.log('│                        ▲                                      │');
    console.log('│                        │                                      │');
    console.log('│                ┌───────────────┐                              │');
    console.log('│                │ ORCHESTRATOR  │                              │');
    console.log('│                │   (Events)    │                              │');
    console.log('│                └───────────────┘                              │');
    console.log('│                                                               │');
    console.log('└───────────────────────────────────────────────────────────────┘');
    console.log('');
}
/**
 * Main execution function
 */
async function main() {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║     TRUE MULTI-AGENT CONTENT GENERATION SYSTEM                    ║');
    console.log('║     With Message-Passing Architecture & Agent Autonomy            ║');
    console.log('║     Kasparro Agentic Content System v2.0.0                        ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝');
    printArchitecture();
    // Ensure output directory exists
    ensureOutputDirectory();
    // Reset core infrastructure for clean state
    console.log('🔧 Initializing Core Infrastructure...');
    MessageBus_1.MessageBus.reset();
    AgentRegistry_1.AgentRegistry.reset();
    TaskQueue_1.TaskQueue.reset();
    const messageBus = MessageBus_1.MessageBus.getInstance();
    const registry = AgentRegistry_1.AgentRegistry.getInstance();
    console.log('   ✓ MessageBus initialized');
    console.log('   ✓ AgentRegistry initialized');
    console.log('   ✓ TaskQueue initialized');
    console.log('');
    // Initialize all autonomous agents
    console.log('🤖 Initializing Autonomous Agents...');
    console.log('   (Agents self-register and subscribe to messages)');
    console.log('');
    const dataIngestionAgent = new DataIngestionAgent_1.DataIngestionAgent();
    const questionGenerationAgent = new QuestionGenerationAgent_1.QuestionGenerationAgent();
    const contentLogicAgent = new ContentLogicAgent_1.ContentLogicAgent();
    const templateAgent = new TemplateAgent_1.TemplateAgent();
    const pageAssemblyAgent = new PageAssemblyAgent_1.PageAssemblyAgent();
    const orchestrator = new OrchestratorAgent_1.OrchestratorAgent();
    // Start all agents - they become ready to process messages
    await dataIngestionAgent.start();
    await questionGenerationAgent.start();
    await contentLogicAgent.start();
    await templateAgent.start();
    await pageAssemblyAgent.start();
    await orchestrator.start();
    // Display registered agents
    console.log('');
    console.log('📋 Registered Agents:');
    const agents = registry.getAllAgents();
    for (const agent of agents) {
        const capabilities = agent.capabilities.map(c => c.name).join(', ');
        console.log(`   • ${agent.type} (${agent.id})`);
        console.log(`     Capabilities: ${capabilities}`);
        console.log(`     Status: ${agent.status}`);
    }
    console.log('');
    // Input data display
    console.log('📋 Input Product Data:');
    console.log(`   Name: ${PRODUCT_DATA.product_name}`);
    console.log(`   Concentration: ${PRODUCT_DATA.concentration}`);
    console.log(`   Skin Types: ${PRODUCT_DATA.skin_type.join(', ')}`);
    console.log(`   Key Ingredients: ${PRODUCT_DATA.key_ingredients.join(', ')}`);
    console.log(`   Benefits: ${PRODUCT_DATA.benefits.join(', ')}`);
    console.log(`   Price: ₹${PRODUCT_DATA.price}`);
    console.log('');
    console.log('═'.repeat(70));
    console.log('🚀 STARTING EVENT-DRIVEN PIPELINE');
    console.log('   The orchestrator will publish events to the message bus.');
    console.log('   Autonomous agents will react and process data independently.');
    console.log('═'.repeat(70));
    console.log('');
    const startTime = Date.now();
    try {
        // Run the event-driven pipeline
        // The orchestrator publishes events, agents react autonomously
        const result = await orchestrator.runPipeline(PRODUCT_DATA, ['faq', 'product', 'comparison']);
        const { pages, executionLog, summary } = result;
        // Print event log
        console.log('');
        console.log('📝 Event Execution Log:');
        console.log('─'.repeat(70));
        for (const entry of executionLog) {
            const icon = entry.status === 'completed' ? '✓' :
                entry.status === 'triggered' ? '→' : '✗';
            console.log(`   ${icon} [${entry.step}] ${entry.event} (${entry.agentId})`);
            if (entry.message) {
                console.log(`     └─ ${entry.message}`);
            }
        }
        console.log('─'.repeat(70));
        console.log('');
        // Write output files
        console.log('📁 Writing output files...');
        if (pages.faq) {
            writeJsonOutput('faq.json', pages.faq);
        }
        if (pages.product) {
            writeJsonOutput('product_page.json', pages.product);
        }
        if (pages.comparison) {
            writeJsonOutput('comparison_page.json', pages.comparison);
        }
        // Write execution summary
        writeJsonOutput('execution_summary.json', {
            architecture: 'Event-Driven Multi-Agent System',
            messagePassingEnabled: true,
            autonomousAgents: agents.map(a => a.id),
            summary,
            executionLog,
            generatedAt: new Date().toISOString()
        });
        // Write questions separately for reference
        if (pages.faq) {
            const allQuestions = pages.faq.categories.flatMap(cat => cat.items);
            writeJsonOutput('questions.json', {
                productName: pages.faq.productName,
                totalQuestions: allQuestions.length,
                questions: allQuestions
            });
        }
        console.log('');
        console.log('═'.repeat(70));
        console.log('📊 EXECUTION SUMMARY');
        console.log('═'.repeat(70));
        console.log(`   Architecture: Event-Driven Multi-Agent System`);
        console.log(`   Message Bus Events: ${summary.totalEvents}`);
        console.log(`   Autonomous Agents: ${agents.length}`);
        console.log(`   Pipeline Duration: ${summary.durationMs}ms`);
        console.log(`   Pages Generated: ${summary.pagesGenerated.join(', ')}`);
        console.log('');
        console.log('   KEY AUTONOMOUS BEHAVIORS DEMONSTRATED:');
        console.log('   • Agents self-registered with AgentRegistry');
        console.log('   • Agents subscribed to message types autonomously');
        console.log('   • DataIngestionAgent reacted to RAW_DATA_RECEIVED');
        console.log('   • QuestionGenerationAgent reacted to PRODUCT_MODEL_READY');
        console.log('   • ContentLogicAgent reacted to PRODUCT_MODEL_READY');
        console.log('   • PageAssemblyAgent assembled pages from published data');
        console.log('   • Orchestrator coordinated through events, not direct calls');
        console.log('═'.repeat(70));
        console.log('');
        console.log('✅ Pipeline completed successfully with TRUE agent autonomy!');
        console.log('');
    }
    catch (error) {
        console.error('');
        console.error('❌ Fatal error:', error instanceof Error ? error.message : 'Unknown error');
        if (error instanceof Error && error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}
// Run main
main().catch(console.error);
//# sourceMappingURL=main.js.map