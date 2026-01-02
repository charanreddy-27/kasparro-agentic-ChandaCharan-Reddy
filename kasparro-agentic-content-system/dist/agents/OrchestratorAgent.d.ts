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
import { AutonomousAgent } from './AutonomousAgent';
import { AgentMessage } from '../core/MessageBus';
import { RawProductData, ProductModel } from '../models/ProductModel';
import { ProductPage, ComparisonPage, FAQPageOutput } from '../models/PageModel';
import { QuestionSet } from '../models/QuestionModel';
import { GeneratedBlocks } from './ContentLogicAgent';
/**
 * Execution log entry
 */
export interface ExecutionLogEntry {
    step: number;
    event: string;
    agentId: string;
    status: 'triggered' | 'completed' | 'failed';
    timestamp: string;
    message?: string;
}
/**
 * Pipeline state tracking
 */
interface PipelineState {
    status: 'idle' | 'running' | 'completed' | 'failed';
    startedAt?: Date;
    completedAt?: Date;
    rawData?: RawProductData;
    product?: ProductModel;
    questionSet?: QuestionSet;
    contentBlocks?: GeneratedBlocks;
    pages: {
        faq?: FAQPageOutput;
        product?: ProductPage;
        comparison?: ComparisonPage;
    };
    expectedPages: Set<string>;
    receivedPages: Set<string>;
}
/**
 * Final output structure
 */
export interface OrchestratorOutput {
    pages: {
        faq?: FAQPageOutput;
        product?: ProductPage;
        comparison?: ComparisonPage;
    };
    executionLog: ExecutionLogEntry[];
    summary: {
        totalEvents: number;
        startedAt: string;
        completedAt: string;
        durationMs: number;
        pagesGenerated: string[];
    };
}
/**
 * OrchestratorAgent - EVENT-DRIVEN pipeline coordinator
 *
 * KEY DIFFERENCE FROM TRADITIONAL ORCHESTRATORS:
 * - Does NOT call other agents directly
 * - Publishes events and lets autonomous agents react
 * - Tracks progress through message subscriptions
 * - Coordinates through the message bus, not direct invocation
 */
export declare class OrchestratorAgent extends AutonomousAgent {
    private pipelineState;
    private executionLog;
    private stepCounter;
    private resolveCompletion?;
    private rejectCompletion?;
    constructor(id?: string);
    /**
     * Create initial pipeline state
     */
    private createInitialState;
    /**
     * Agent startup
     */
    protected onStart(): Promise<void>;
    /**
     * Agent shutdown
     */
    protected onStop(): Promise<void>;
    /**
     * AUTONOMOUS MESSAGE HANDLER
     * This is where the orchestrator tracks progress from other agents
     */
    protected onMessage(message: AgentMessage): Promise<void>;
    /**
     * Process tasks (for direct task assignment)
     */
    protected processTask(taskType: string, payload: unknown, _metadata: Record<string, unknown>): Promise<unknown>;
    /**
     * START THE EVENT-DRIVEN PIPELINE
     * This is the main entry point - it kicks off the pipeline by publishing an event
     * and then returns a promise that resolves when all pages are assembled
     */
    runPipeline(rawData: RawProductData, pagesToGenerate?: string[]): Promise<OrchestratorOutput>;
    /**
     * EVENT HANDLER: Product model ready
     * DataIngestionAgent has finished processing
     */
    private handleProductModelReady;
    /**
     * EVENT HANDLER: Questions generated
     * QuestionGenerationAgent has finished
     */
    private handleQuestionsGenerated;
    /**
     * EVENT HANDLER: Content blocks ready
     * ContentLogicAgent has finished
     */
    private handleContentBlocksReady;
    /**
     * EVENT HANDLER: Page assembled
     * PageAssemblyAgent has finished a page
     */
    private handlePageAssembled;
    /**
     * EVENT HANDLER: Agent error
     */
    private handleAgentError;
    /**
     * Check if pipeline is complete
     */
    private checkPipelineCompletion;
    /**
     * Create final output
     */
    private createOutput;
    /**
     * Log execution event
     */
    private logEvent;
    /**
     * Get current pipeline state (for debugging/monitoring)
     */
    getPipelineState(): PipelineState;
    /**
     * Get execution log
     */
    getExecutionLog(): ExecutionLogEntry[];
}
export default OrchestratorAgent;
//# sourceMappingURL=OrchestratorAgent.d.ts.map