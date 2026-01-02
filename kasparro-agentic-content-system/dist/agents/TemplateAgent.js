"use strict";
/**
 * TemplateAgent.ts
 * AUTONOMOUS AGENT that owns and manages structured templates for page generation
 *
 * AUTONOMOUS BEHAVIOR:
 * - Subscribes to TEMPLATE_REQUESTED messages
 * - Provides template schemas and validation rules on demand
 * - Publishes TEMPLATE_READY when template is prepared
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateAgent = void 0;
const AutonomousAgent_1 = require("./AutonomousAgent");
const MessageBus_1 = require("../core/MessageBus");
const faq_template_1 = require("../templates/faq.template");
const product_template_1 = require("../templates/product.template");
const comparison_template_1 = require("../templates/comparison.template");
/**
 * Capabilities provided by this autonomous agent
 */
const CAPABILITIES = [
    {
        name: 'template-management',
        description: 'Provide and validate page templates',
        inputTypes: ['TemplateRequest'],
        outputTypes: ['TemplateOutput']
    },
    {
        name: 'faq-template',
        description: 'Provide FAQ page template',
        inputTypes: [],
        outputTypes: ['FAQTemplateSchema']
    },
    {
        name: 'product-template',
        description: 'Provide product page template',
        inputTypes: [],
        outputTypes: ['ProductTemplateSchema']
    },
    {
        name: 'comparison-template',
        description: 'Provide comparison page template',
        inputTypes: [],
        outputTypes: ['ComparisonTemplateSchema']
    }
];
/**
 * Message types this agent subscribes to
 */
const SUBSCRIPTIONS = [
    MessageBus_1.MessageType.TEMPLATE_REQUESTED,
    MessageBus_1.MessageType.QUESTIONS_GENERATED,
    MessageBus_1.MessageType.CONTENT_BLOCKS_READY
];
/**
 * TemplateAgent - AUTONOMOUS template management agent
 *
 * Autonomous Behavior:
 * 1. Listens for TEMPLATE_REQUESTED messages
 * 2. Prepares appropriate template schema
 * 3. Publishes TEMPLATE_READY with template and validation rules
 */
class TemplateAgent extends AutonomousAgent_1.AutonomousAgent {
    constructor(id = 'template-agent') {
        const config = {
            id,
            type: 'TemplateAgent',
            capabilities: CAPABILITIES,
            subscriptions: SUBSCRIPTIONS
        };
        super(config);
    }
    /**
     * Agent startup
     */
    async onStart() {
        this.log('Autonomous template agent initialized');
    }
    /**
     * Agent shutdown
     */
    async onStop() {
        this.log('Template agent shutting down');
    }
    /**
     * AUTONOMOUS MESSAGE HANDLER
     */
    async onMessage(message) {
        switch (message.type) {
            case MessageBus_1.MessageType.TEMPLATE_REQUESTED:
                await this.handleTemplateRequested(message);
                break;
            case MessageBus_1.MessageType.QUESTIONS_GENERATED:
                // Questions ready - could trigger FAQ template preparation
                await this.handleQuestionsGenerated(message);
                break;
            case MessageBus_1.MessageType.CONTENT_BLOCKS_READY:
                // Content ready - could trigger product template preparation
                await this.handleContentBlocksReady(message);
                break;
            default:
                this.log(`Received unhandled message type: ${message.type}`);
        }
    }
    /**
     * Process assigned tasks
     */
    async processTask(taskType, payload, _metadata) {
        switch (taskType) {
            case 'get-template': {
                const { templateType } = payload;
                return this.prepareTemplate(templateType);
            }
            case 'validate-content': {
                const { templateType, content } = payload;
                return this.validateContent(templateType, content);
            }
            default:
                throw new Error(`Unknown task type: ${taskType}`);
        }
    }
    /**
     * AUTONOMOUS: Handle template request
     */
    async handleTemplateRequested(message) {
        const { templateType } = message.payload;
        this.log(`Template requested: ${templateType}`);
        const output = this.prepareTemplate(templateType);
        this.publish(MessageBus_1.MessageType.TEMPLATE_READY, {
            ...output,
            requestedBy: message.source
        }, { correlationId: message.correlationId });
        this.log(`Template ${templateType} published`);
    }
    /**
     * AUTONOMOUS: React to questions being generated
     * Proactively prepares FAQ template
     */
    async handleQuestionsGenerated(message) {
        this.log('Questions generated - FAQ template ready if needed');
        // Store that questions are available
        this.setState('questionsAvailable', true);
        this.setState('questionSet', message.payload.questionSet);
        // Proactively prepare FAQ template
        const faqTemplate = this.prepareTemplate('faq');
        this.setState('faqTemplate', faqTemplate);
    }
    /**
     * AUTONOMOUS: React to content blocks being ready
     * Proactively prepares product and comparison templates
     */
    async handleContentBlocksReady(message) {
        this.log('Content blocks ready - templates prepared');
        // Store that content is available
        this.setState('contentAvailable', true);
        // Proactively prepare product and comparison templates
        const productTemplate = this.prepareTemplate('product');
        const comparisonTemplate = this.prepareTemplate('comparison');
        this.setState('productTemplate', productTemplate);
        this.setState('comparisonTemplate', comparisonTemplate);
    }
    /**
     * Prepare template based on type
     */
    prepareTemplate(templateType) {
        switch (templateType) {
            case 'faq':
                return this.prepareFAQTemplate();
            case 'product':
                return this.prepareProductTemplate();
            case 'comparison':
                return this.prepareComparisonTemplate();
            default:
                throw new Error(`Unknown template type: ${templateType}`);
        }
    }
    /**
     * Prepare FAQ template
     */
    prepareFAQTemplate() {
        const requiredBlocks = faq_template_1.FAQ_TEMPLATE.sections.map(s => s.source);
        const validationRules = faq_template_1.FAQ_TEMPLATE.sections.map(section => ({
            field: section.id,
            rule: `Minimum ${section.minQuestions} questions, maximum ${section.maxQuestions}`,
            required: section.minQuestions > 0
        }));
        validationRules.push({
            field: 'total',
            rule: `Minimum ${faq_template_1.FAQ_TEMPLATE.metadata.totalMinQuestions} total questions`,
            required: true
        });
        return {
            template: faq_template_1.FAQ_TEMPLATE,
            templateType: 'faq',
            requiredBlocks,
            validationRules
        };
    }
    /**
     * Prepare product template
     */
    prepareProductTemplate() {
        const orderedSections = (0, product_template_1.getOrderedSections)(product_template_1.PRODUCT_TEMPLATE);
        const requiredBlocks = orderedSections.map(s => s.source);
        const validationRules = orderedSections.flatMap(section => section.fields.map(field => ({
            field: `${section.id}.${field.name}`,
            rule: `Type: ${field.type}`,
            required: field.required
        })));
        return {
            template: product_template_1.PRODUCT_TEMPLATE,
            templateType: 'product',
            requiredBlocks,
            validationRules
        };
    }
    /**
     * Prepare comparison template
     */
    prepareComparisonTemplate() {
        const requiredBlocks = comparison_template_1.COMPARISON_TEMPLATE.sections.map(s => s.source);
        const validationRules = [
            {
                field: 'products',
                rule: `Exactly ${comparison_template_1.COMPARISON_TEMPLATE.metadata.productCount} products required`,
                required: true
            },
            ...comparison_template_1.COMPARISON_TEMPLATE.metadata.fictionalProductSchema.requiredFields.map(field => ({
                field: `fictionalProduct.${field}`,
                rule: 'Required field for fictional product',
                required: true
            }))
        ];
        return {
            template: comparison_template_1.COMPARISON_TEMPLATE,
            templateType: 'comparison',
            requiredBlocks,
            validationRules,
            fictionalProduct: comparison_template_1.FICTIONAL_PRODUCT_B
        };
    }
    /**
     * Validate content against template
     */
    validateContent(templateType, content) {
        switch (templateType) {
            case 'faq':
                return (0, faq_template_1.validateFAQAgainstTemplate)(content, faq_template_1.FAQ_TEMPLATE);
            case 'product':
                return (0, product_template_1.validateProductAgainstTemplate)(content, product_template_1.PRODUCT_TEMPLATE);
            case 'comparison':
                return (0, comparison_template_1.validateComparisonAgainstTemplate)(content, comparison_template_1.COMPARISON_TEMPLATE);
            default:
                return { valid: false, errors: [`Unknown template type: ${templateType}`] };
        }
    }
    // ============================================
    // PUBLIC TEMPLATE METHODS (for direct access)
    // ============================================
    getFAQTemplate() { return faq_template_1.FAQ_TEMPLATE; }
    getProductTemplate() { return product_template_1.PRODUCT_TEMPLATE; }
    getComparisonTemplate() { return comparison_template_1.COMPARISON_TEMPLATE; }
    getFictionalProduct() { return comparison_template_1.FICTIONAL_PRODUCT_B; }
}
exports.TemplateAgent = TemplateAgent;
//# sourceMappingURL=TemplateAgent.js.map