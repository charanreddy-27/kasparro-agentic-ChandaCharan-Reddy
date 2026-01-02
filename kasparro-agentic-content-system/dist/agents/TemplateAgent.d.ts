/**
 * TemplateAgent.ts
 * AUTONOMOUS AGENT that owns and manages structured templates for page generation
 *
 * AUTONOMOUS BEHAVIOR:
 * - Subscribes to TEMPLATE_REQUESTED messages
 * - Provides template schemas and validation rules on demand
 * - Publishes TEMPLATE_READY when template is prepared
 */
import { AutonomousAgent } from './AutonomousAgent';
import { AgentMessage } from '../core/MessageBus';
import { FAQTemplateSchema } from '../templates/faq.template';
import { ProductTemplateSchema } from '../templates/product.template';
import { ComparisonTemplateSchema } from '../templates/comparison.template';
import { ComparisonProduct } from '../models/ProductModel';
/**
 * Template output structure
 */
export interface TemplateOutput {
    template: FAQTemplateSchema | ProductTemplateSchema | ComparisonTemplateSchema;
    templateType: string;
    requiredBlocks: string[];
    validationRules: ValidationRule[];
    fictionalProduct?: ComparisonProduct;
}
/**
 * Validation rule structure
 */
export interface ValidationRule {
    field: string;
    rule: string;
    required: boolean;
}
/**
 * TemplateAgent - AUTONOMOUS template management agent
 *
 * Autonomous Behavior:
 * 1. Listens for TEMPLATE_REQUESTED messages
 * 2. Prepares appropriate template schema
 * 3. Publishes TEMPLATE_READY with template and validation rules
 */
export declare class TemplateAgent extends AutonomousAgent {
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
     * AUTONOMOUS: Handle template request
     */
    private handleTemplateRequested;
    /**
     * AUTONOMOUS: React to questions being generated
     * Proactively prepares FAQ template
     */
    private handleQuestionsGenerated;
    /**
     * AUTONOMOUS: React to content blocks being ready
     * Proactively prepares product and comparison templates
     */
    private handleContentBlocksReady;
    /**
     * Prepare template based on type
     */
    private prepareTemplate;
    /**
     * Prepare FAQ template
     */
    private prepareFAQTemplate;
    /**
     * Prepare product template
     */
    private prepareProductTemplate;
    /**
     * Prepare comparison template
     */
    private prepareComparisonTemplate;
    /**
     * Validate content against template
     */
    private validateContent;
    getFAQTemplate(): FAQTemplateSchema;
    getProductTemplate(): ProductTemplateSchema;
    getComparisonTemplate(): ComparisonTemplateSchema;
    getFictionalProduct(): ComparisonProduct;
}
//# sourceMappingURL=TemplateAgent.d.ts.map