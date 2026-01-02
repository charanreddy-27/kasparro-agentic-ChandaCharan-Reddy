/**
 * QuestionGenerationAgent.ts
 * AUTONOMOUS AGENT for generating categorized questions from product data
 *
 * AUTONOMOUS BEHAVIOR:
 * - Subscribes to PRODUCT_MODEL_READY messages
 * - Automatically generates questions when product data is available
 * - Publishes QUESTIONS_GENERATED when complete
 */
import { AutonomousAgent } from './AutonomousAgent';
import { AgentMessage } from '../core/MessageBus';
/**
 * QuestionGenerationAgent - AUTONOMOUS question generation agent
 *
 * Autonomous Behavior:
 * 1. Listens for PRODUCT_MODEL_READY messages
 * 2. Automatically generates 15+ categorized questions
 * 3. Publishes QUESTIONS_GENERATED for other agents to consume
 */
export declare class QuestionGenerationAgent extends AutonomousAgent {
    private questionTemplates;
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
     * Handle explicit questions request (for re-generation scenarios)
     */
    private handleQuestionsRequested;
    /**
     * Generate complete question set
     */
    private generateQuestionSet;
    /**
     * Initialize question templates
     */
    private initializeTemplates;
    /**
     * Generate questions from templates
     */
    private generateQuestions;
    /**
     * Generate single question from template
     */
    private generateQuestionFromTemplate;
    /**
     * Check if product has a specific field with value
     */
    private hasField;
    /**
     * Generate answer based on template and product
     */
    private generateAnswer;
    /**
     * Generate informational answer
     */
    private generateInformationalAnswer;
    /**
     * Generate safety answer
     */
    private generateSafetyAnswer;
    /**
     * Generate usage answer
     */
    private generateUsageAnswer;
    /**
     * Generate purchase answer
     */
    private generatePurchaseAnswer;
    /**
     * Generate comparison answer
     */
    private generateComparisonAnswer;
    /**
     * Generate additional questions if minimum not met
     */
    private generateAdditionalQuestions;
    /**
     * Create question set from generated questions
     */
    private createQuestionSet;
}
//# sourceMappingURL=QuestionGenerationAgent.d.ts.map