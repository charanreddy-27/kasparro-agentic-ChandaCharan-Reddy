/**
 * PageAssemblyAgent.ts
 * AUTONOMOUS AGENT that combines ProductModel + Logic Blocks + Templates to produce final JSON pages
 *
 * AUTONOMOUS BEHAVIOR:
 * - Subscribes to PAGE_ASSEMBLY_REQUESTED and data-ready messages
 * - Assembles pages when all required data is available
 * - Publishes PAGE_ASSEMBLED when complete
 */
import { AutonomousAgent } from './AutonomousAgent';
import { AgentMessage } from '../core/MessageBus';
import { ProductModel } from '../models/ProductModel';
import { ProductPage, ComparisonPage, FAQPageOutput } from '../models/PageModel';
/**
 * Assembly metadata
 */
export interface AssemblyMetadata {
    assembledAt: string;
    sectionsIncluded: string[];
    templateVersion: string;
}
/**
 * Assembly output structure
 */
export interface PageAssemblyOutput {
    page: ProductPage | ComparisonPage | FAQPageOutput;
    pageType: string;
    assemblyMetadata: AssemblyMetadata;
}
/**
 * PageAssemblyAgent - AUTONOMOUS page assembly agent
 *
 * Autonomous Behavior:
 * 1. Listens for data-ready messages (product, questions, content blocks)
 * 2. Tracks what data is available
 * 3. Assembles pages when all required data is available
 * 4. Publishes PAGE_ASSEMBLED for final output
 */
export declare class PageAssemblyAgent extends AutonomousAgent {
    constructor(id?: string);
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
     */
    protected onMessage(message: AgentMessage): Promise<void>;
    /**
     * Process assigned tasks
     */
    protected processTask(taskType: string, payload: unknown, _metadata: Record<string, unknown>): Promise<unknown>;
    /**
     * AUTONOMOUS: Handle explicit page assembly request
     */
    private handlePageAssemblyRequested;
    /**
     * AUTONOMOUS: Track product model and trigger assembly if ready
     */
    private handleProductModelReady;
    /**
     * AUTONOMOUS: Track questions and trigger assembly if ready
     */
    private handleQuestionsGenerated;
    /**
     * AUTONOMOUS: Track content blocks and trigger assembly if ready
     */
    private handleContentBlocksReady;
    /**
     * AUTONOMOUS: Check if all data is available and assemble pages
     */
    private checkAndAssemble;
    /**
     * Assemble FAQ page
     */
    private assembleFAQPage;
    /**
     * Assemble product page
     */
    private assembleProductPage;
    /**
     * Assemble comparison page
     */
    private assembleComparisonPage;
    /**
     * Group questions by category
     */
    private groupQuestionsByCategory;
    /**
     * Store product reference
     */
    setProduct(product: ProductModel): void;
}
//# sourceMappingURL=PageAssemblyAgent.d.ts.map