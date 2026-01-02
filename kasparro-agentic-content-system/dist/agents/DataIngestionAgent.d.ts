/**
 * DataIngestionAgent.ts
 * AUTONOMOUS AGENT for parsing and normalizing product data
 * Listens for raw data messages and publishes normalized ProductModel
 *
 * BEHAVIOR:
 * - Subscribes to RAW_DATA_RECEIVED and PIPELINE_START messages
 * - Autonomously processes incoming data
 * - Publishes PRODUCT_MODEL_READY when processing completes
 */
import { AutonomousAgent } from './AutonomousAgent';
import { AgentMessage } from '../core/MessageBus';
/**
 * DataIngestionAgent - AUTONOMOUS data processing agent
 *
 * Autonomous Behavior:
 * 1. Listens for RAW_DATA_RECEIVED messages on the message bus
 * 2. Autonomously validates and normalizes data
 * 3. Publishes PRODUCT_MODEL_READY with normalized model
 * 4. Does NOT require direct invocation - reacts to messages
 */
export declare class DataIngestionAgent extends AutonomousAgent {
    constructor(id?: string);
    /**
     * Agent startup - autonomous initialization
     */
    protected onStart(): Promise<void>;
    /**
     * Agent shutdown - cleanup
     */
    protected onStop(): Promise<void>;
    /**
     * AUTONOMOUS MESSAGE HANDLER
     * This is the core of agent autonomy - reacts to messages without direct invocation
     */
    protected onMessage(message: AgentMessage): Promise<void>;
    /**
     * Process assigned tasks from TaskQueue
     */
    protected processTask(taskType: string, payload: unknown, _metadata: Record<string, unknown>): Promise<unknown>;
    /**
     * AUTONOMOUS: Handle raw data received message
     * Triggered by message bus, not direct invocation
     */
    private handleRawDataReceived;
    /**
     * Validate raw product data
     */
    private validateRawData;
    /**
     * Normalize raw product data to internal ProductModel
     */
    private normalizeProduct;
    /**
     * Normalize ingredients to IngredientInfo array
     */
    private normalizeIngredients;
    /**
     * Normalize benefits to BenefitInfo array
     */
    private normalizeBenefits;
    /**
     * Normalize usage instructions to UsageInfo
     */
    private normalizeUsage;
    /**
     * Normalize safety information
     */
    private normalizeSafety;
    /**
     * Normalize pricing information
     */
    private normalizePricing;
    /**
     * Generate product metadata
     */
    private generateMetadata;
    /**
     * Generate unique product ID from name
     */
    private generateProductId;
    /**
     * Validate normalized product
     */
    private validateProduct;
}
//# sourceMappingURL=DataIngestionAgent.d.ts.map