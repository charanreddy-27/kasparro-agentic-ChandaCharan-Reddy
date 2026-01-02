"use strict";
/**
 * OrchestratorAgent.ts
 * EVENT-DRIVEN orchestrator that coordinates agents through the message bus
 *
 * CRITICAL DESIGN: This orchestrator does NOT directly invoke other agents.
 * Instead, it:
 * 1. Publishes events to the message bus
 * 2. Lets autonomous agents react to those events
 * 3. Tracks pipeline progress through message subscriptions
 * 4. Produces final output when all pages are assembled
 *
 * This demonstrates TRUE agent autonomy and dynamic coordination.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorAgent = void 0;
const AutonomousAgent_1 = require("./AutonomousAgent");
const MessageBus_1 = require("../core/MessageBus");
/**
 * Capabilities provided by this orchestrator
 */
const CAPABILITIES = [
    {
        name: 'pipeline-orchestration',
        description: 'Orchestrate multi-agent content generation pipeline',
        inputTypes: ['RawProductData'],
        outputTypes: ['OrchestratorOutput']
    },
    {
        name: 'event-coordination',
        description: 'Coordinate agents through event-driven messaging',
        inputTypes: [],
        outputTypes: []
    }
];
/**
 * Message types this orchestrator subscribes to
 */
const SUBSCRIPTIONS = [
    MessageBus_1.MessageType.PRODUCT_MODEL_READY,
    MessageBus_1.MessageType.QUESTIONS_GENERATED,
    MessageBus_1.MessageType.CONTENT_BLOCKS_READY,
    MessageBus_1.MessageType.PAGE_ASSEMBLED,
    MessageBus_1.MessageType.AGENT_ERROR,
    MessageBus_1.MessageType.PIPELINE_COMPLETE
];
/**
 * OrchestratorAgent - EVENT-DRIVEN pipeline coordinator
 *
 * KEY DIFFERENCE FROM TRADITIONAL ORCHESTRATORS:
 * - Does NOT call other agents directly
 * - Publishes events and lets autonomous agents react
 * - Tracks progress through message subscriptions
 * - Coordinates through the message bus, not direct invocation
 */
class OrchestratorAgent extends AutonomousAgent_1.AutonomousAgent {
    constructor(id = 'orchestrator-agent') {
        const config = {
            id,
            type: 'OrchestratorAgent',
            capabilities: CAPABILITIES,
            subscriptions: SUBSCRIPTIONS
        };
        super(config);
        this.pipelineState = this.createInitialState();
        this.executionLog = [];
        this.stepCounter = 0;
    }
    /**
     * Create initial pipeline state
     */
    createInitialState() {
        return {
            status: 'idle',
            pages: {},
            expectedPages: new Set(),
            receivedPages: new Set()
        };
    }
    /**
     * Agent startup
     */
    async onStart() {
        this.log('Event-driven orchestrator initialized');
        this.log('Waiting for pipeline start command...');
    }
    /**
     * Agent shutdown
     */
    async onStop() {
        this.log('Orchestrator shutting down');
    }
    /**
     * AUTONOMOUS MESSAGE HANDLER
     * This is where the orchestrator tracks progress from other agents
     */
    async onMessage(message) {
        switch (message.type) {
            case MessageBus_1.MessageType.PRODUCT_MODEL_READY:
                await this.handleProductModelReady(message);
                break;
            case MessageBus_1.MessageType.QUESTIONS_GENERATED:
                await this.handleQuestionsGenerated(message);
                break;
            case MessageBus_1.MessageType.CONTENT_BLOCKS_READY:
                await this.handleContentBlocksReady(message);
                break;
            case MessageBus_1.MessageType.PAGE_ASSEMBLED:
                await this.handlePageAssembled(message);
                break;
            case MessageBus_1.MessageType.AGENT_ERROR:
                await this.handleAgentError(message);
                break;
            default:
                this.log(`Received message: ${message.type}`);
        }
    }
    /**
     * Process tasks (for direct task assignment)
     */
    async processTask(taskType, payload, _metadata) {
        switch (taskType) {
            case 'run-pipeline':
                const { rawData, pagesToGenerate } = payload;
                return this.runPipeline(rawData, pagesToGenerate);
            default:
                throw new Error(`Unknown task type: ${taskType}`);
        }
    }
    /**
     * START THE EVENT-DRIVEN PIPELINE
     * This is the main entry point - it kicks off the pipeline by publishing an event
     * and then returns a promise that resolves when all pages are assembled
     */
    async runPipeline(rawData, pagesToGenerate = ['faq', 'product', 'comparison']) {
        return new Promise((resolve, reject) => {
            this.resolveCompletion = resolve;
            this.rejectCompletion = reject;
            // Reset state
            this.pipelineState = this.createInitialState();
            this.executionLog = [];
            this.stepCounter = 0;
            // Set up expected pages
            this.pipelineState.status = 'running';
            this.pipelineState.startedAt = new Date();
            this.pipelineState.rawData = rawData;
            pagesToGenerate.forEach(p => this.pipelineState.expectedPages.add(p));
            this.logEvent('pipeline-start', this.id, 'triggered', 'Pipeline started');
            // CRITICAL: We don't call other agents directly!
            // Instead, we publish a PIPELINE_START event and then RAW_DATA_RECEIVED
            // The DataIngestionAgent will autonomously react to this
            this.log('Publishing PIPELINE_START event...');
            this.publish(MessageBus_1.MessageType.PIPELINE_START, {
                pagesToGenerate,
                timestamp: new Date().toISOString()
            });
            // Publish raw data - DataIngestionAgent will react
            this.log('Publishing RAW_DATA_RECEIVED event...');
            this.publish(MessageBus_1.MessageType.RAW_DATA_RECEIVED, rawData);
            this.logEvent('raw-data-published', this.id, 'completed', 'Raw data published to message bus');
        });
    }
    /**
     * EVENT HANDLER: Product model ready
     * DataIngestionAgent has finished processing
     */
    async handleProductModelReady(message) {
        const { product } = message.payload;
        this.pipelineState.product = product;
        this.logEvent('product-model-ready', message.source, 'completed', `Product normalized: ${product.name}`);
        this.log(`Product model ready from ${message.source}`);
        // The QuestionGenerationAgent and ContentLogicAgent will automatically
        // react to this event - we don't need to call them!
        // This is TRUE agent autonomy
    }
    /**
     * EVENT HANDLER: Questions generated
     * QuestionGenerationAgent has finished
     */
    async handleQuestionsGenerated(message) {
        const { questionSet } = message.payload;
        this.pipelineState.questionSet = questionSet;
        this.logEvent('questions-generated', message.source, 'completed', `Generated ${questionSet.totalCount} questions`);
        this.log(`Questions generated by ${message.source}: ${questionSet.totalCount} questions`);
    }
    /**
     * EVENT HANDLER: Content blocks ready
     * ContentLogicAgent has finished
     */
    async handleContentBlocksReady(message) {
        const { blocks } = message.payload;
        this.pipelineState.contentBlocks = blocks;
        this.logEvent('content-blocks-ready', message.source, 'completed', 'Content blocks generated');
        this.log(`Content blocks ready from ${message.source}`);
    }
    /**
     * EVENT HANDLER: Page assembled
     * PageAssemblyAgent has finished a page
     */
    async handlePageAssembled(message) {
        const { pageType, page } = message.payload;
        // Store the assembled page
        switch (pageType) {
            case 'faq':
                this.pipelineState.pages.faq = page;
                break;
            case 'product':
                this.pipelineState.pages.product = page;
                break;
            case 'comparison':
                this.pipelineState.pages.comparison = page;
                break;
        }
        this.pipelineState.receivedPages.add(pageType);
        this.logEvent('page-assembled', message.source, 'completed', `${pageType} page assembled`);
        this.log(`Page assembled by ${message.source}: ${pageType}`);
        // Check if all expected pages are received
        await this.checkPipelineCompletion();
    }
    /**
     * EVENT HANDLER: Agent error
     */
    async handleAgentError(message) {
        const { agentId, error } = message.payload;
        this.logEvent('agent-error', agentId, 'failed', error);
        this.log(`Error from ${agentId}: ${error}`);
        // For critical errors, fail the pipeline
        if (this.pipelineState.status === 'running') {
            this.pipelineState.status = 'failed';
            if (this.rejectCompletion) {
                this.rejectCompletion(new Error(`Pipeline failed: ${error}`));
            }
        }
    }
    /**
     * Check if pipeline is complete
     */
    async checkPipelineCompletion() {
        const expected = this.pipelineState.expectedPages;
        const received = this.pipelineState.receivedPages;
        // Check if all expected pages are received
        const allReceived = Array.from(expected).every(p => received.has(p));
        if (allReceived && this.pipelineState.status === 'running') {
            this.pipelineState.status = 'completed';
            this.pipelineState.completedAt = new Date();
            const output = this.createOutput();
            this.logEvent('pipeline-complete', this.id, 'completed', `All ${expected.size} pages generated`);
            this.log('Pipeline complete! All pages assembled.');
            // Publish completion event
            this.publish(MessageBus_1.MessageType.PIPELINE_COMPLETE, {
                pages: this.pipelineState.pages,
                summary: output.summary
            });
            // Resolve the promise
            if (this.resolveCompletion) {
                this.resolveCompletion(output);
            }
        }
    }
    /**
     * Create final output
     */
    createOutput() {
        const startedAt = this.pipelineState.startedAt;
        const completedAt = this.pipelineState.completedAt || new Date();
        const durationMs = completedAt.getTime() - startedAt.getTime();
        return {
            pages: this.pipelineState.pages,
            executionLog: this.executionLog,
            summary: {
                totalEvents: this.executionLog.length,
                startedAt: startedAt.toISOString(),
                completedAt: completedAt.toISOString(),
                durationMs,
                pagesGenerated: Array.from(this.pipelineState.receivedPages)
            }
        };
    }
    /**
     * Log execution event
     */
    logEvent(event, agentId, status, message) {
        this.stepCounter++;
        this.executionLog.push({
            step: this.stepCounter,
            event,
            agentId,
            status,
            timestamp: new Date().toISOString(),
            message
        });
    }
    /**
     * Get current pipeline state (for debugging/monitoring)
     */
    getPipelineState() {
        return { ...this.pipelineState };
    }
    /**
     * Get execution log
     */
    getExecutionLog() {
        return [...this.executionLog];
    }
}
exports.OrchestratorAgent = OrchestratorAgent;
exports.default = OrchestratorAgent;
//# sourceMappingURL=OrchestratorAgent.js.map