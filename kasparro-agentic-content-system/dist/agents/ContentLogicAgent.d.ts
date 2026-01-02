/**
 * ContentLogicAgent.ts
 * AUTONOMOUS AGENT that owns and exposes reusable logic blocks
 *
 * AUTONOMOUS BEHAVIOR:
 * - Subscribes to PRODUCT_MODEL_READY and CONTENT_BLOCKS_REQUESTED messages
 * - Automatically generates content blocks when product data is available
 * - Publishes CONTENT_BLOCKS_READY when complete
 */
import { AutonomousAgent } from './AutonomousAgent';
import { AgentMessage } from '../core/MessageBus';
import { BenefitsSection, UsageSection, SafetySection, PricingSection, IngredientsSection, DescriptionSection } from '../models/PageModel';
import { ComparisonBlockOutput } from '../logic/comparison.logic';
/**
 * Types of blocks that can be generated
 */
export type BlockType = 'benefits' | 'usage' | 'safety' | 'pricing' | 'ingredients' | 'description' | 'comparison';
/**
 * Generated blocks container
 */
export interface GeneratedBlocks {
    benefits?: BenefitsSection;
    usage?: UsageSection;
    safety?: SafetySection;
    pricing?: PricingSection;
    ingredients?: IngredientsSection;
    description?: DescriptionSection;
    comparison?: ComparisonBlockOutput;
}
/**
 * ContentLogicAgent - AUTONOMOUS content logic generation agent
 *
 * Autonomous Behavior:
 * 1. Listens for PRODUCT_MODEL_READY messages
 * 2. Automatically generates all content blocks
 * 3. Publishes CONTENT_BLOCKS_READY for template/assembly agents
 */
export declare class ContentLogicAgent extends AutonomousAgent {
    constructor(id?: string);
    /**
     * Agent startup - autonomous initialization
     */
    protected onStart(): Promise<void>;
    /**
     * Agent shutdown
     */
    protected onStop(): Promise<void>;
    /**
     * AUTONOMOUS MESSAGE HANDLER
     * Reacts to messages without direct invocation
     */
    protected onMessage(message: AgentMessage): Promise<void>;
    /**
     * Process assigned tasks from TaskQueue
     */
    protected processTask(taskType: string, payload: unknown, _metadata: Record<string, unknown>): Promise<unknown>;
    /**
     * AUTONOMOUS: Handle product model ready message
     * Triggered when DataIngestionAgent publishes normalized product
     */
    private handleProductModelReady;
    /**
     * Handle explicit content blocks request
     */
    private handleContentBlocksRequested;
    /**
     * Generate all requested blocks
     */
    private generateRequestedBlocks;
    /**
     * Generate benefits block
     */
    private generateBenefits;
    /**
     * Generate usage block
     */
    private generateUsage;
    /**
     * Generate safety block
     */
    private generateSafety;
    /**
     * Generate pricing block
     */
    private generatePricing;
    /**
     * Generate ingredients block
     */
    private generateIngredients;
    /**
     * Generate description block
     */
    private generateDescription;
    /**
     * Generate comparison block
     */
    private generateComparison;
    /**
     * Create product summary
     */
    private createProductSummary;
}
//# sourceMappingURL=ContentLogicAgent.d.ts.map