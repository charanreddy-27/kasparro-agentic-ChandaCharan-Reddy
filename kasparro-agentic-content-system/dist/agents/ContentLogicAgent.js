"use strict";
/**
 * ContentLogicAgent.ts
 * AUTONOMOUS AGENT that owns and exposes reusable logic blocks
 *
 * AUTONOMOUS BEHAVIOR:
 * - Subscribes to PRODUCT_MODEL_READY and CONTENT_BLOCKS_REQUESTED messages
 * - Automatically generates content blocks when product data is available
 * - Publishes CONTENT_BLOCKS_READY when complete
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentLogicAgent = void 0;
const AutonomousAgent_1 = require("./AutonomousAgent");
const MessageBus_1 = require("../core/MessageBus");
const benefits_logic_1 = require("../logic/benefits.logic");
const usage_logic_1 = require("../logic/usage.logic");
const safety_logic_1 = require("../logic/safety.logic");
const price_logic_1 = require("../logic/price.logic");
const ingredients_logic_1 = require("../logic/ingredients.logic");
const comparison_logic_1 = require("../logic/comparison.logic");
/**
 * Capabilities provided by this autonomous agent
 */
const CAPABILITIES = [
    {
        name: 'content-logic',
        description: 'Generate content logic blocks from product data',
        inputTypes: ['ProductModel'],
        outputTypes: ['GeneratedBlocks']
    },
    {
        name: 'benefits-generation',
        description: 'Generate benefits section',
        inputTypes: ['ProductModel'],
        outputTypes: ['BenefitsSection']
    },
    {
        name: 'safety-generation',
        description: 'Generate safety information',
        inputTypes: ['ProductModel'],
        outputTypes: ['SafetySection']
    },
    {
        name: 'comparison-generation',
        description: 'Generate product comparison',
        inputTypes: ['ProductModel', 'ComparisonProduct'],
        outputTypes: ['ComparisonBlockOutput']
    }
];
/**
 * Message types this agent subscribes to
 */
const SUBSCRIPTIONS = [
    MessageBus_1.MessageType.PRODUCT_MODEL_READY,
    MessageBus_1.MessageType.CONTENT_BLOCKS_REQUESTED
];
/**
 * ContentLogicAgent - AUTONOMOUS content logic generation agent
 *
 * Autonomous Behavior:
 * 1. Listens for PRODUCT_MODEL_READY messages
 * 2. Automatically generates all content blocks
 * 3. Publishes CONTENT_BLOCKS_READY for template/assembly agents
 */
class ContentLogicAgent extends AutonomousAgent_1.AutonomousAgent {
    constructor(id = 'content-logic-agent') {
        const config = {
            id,
            type: 'ContentLogicAgent',
            capabilities: CAPABILITIES,
            subscriptions: SUBSCRIPTIONS
        };
        super(config);
    }
    /**
     * Agent startup - autonomous initialization
     */
    async onStart() {
        this.log('Autonomous content logic agent initialized');
    }
    /**
     * Agent shutdown
     */
    async onStop() {
        this.log('Content logic agent shutting down');
    }
    /**
     * AUTONOMOUS MESSAGE HANDLER
     * Reacts to messages without direct invocation
     */
    async onMessage(message) {
        switch (message.type) {
            case MessageBus_1.MessageType.PRODUCT_MODEL_READY:
                await this.handleProductModelReady(message);
                break;
            case MessageBus_1.MessageType.CONTENT_BLOCKS_REQUESTED:
                await this.handleContentBlocksRequested(message);
                break;
            default:
                this.log(`Received unhandled message type: ${message.type}`);
        }
    }
    /**
     * Process assigned tasks from TaskQueue
     */
    async processTask(taskType, payload, _metadata) {
        switch (taskType) {
            case 'generate-blocks': {
                const { product, blockTypes, comparisonProduct } = payload;
                return this.generateRequestedBlocks(product, blockTypes, comparisonProduct);
            }
            default:
                throw new Error(`Unknown task type: ${taskType}`);
        }
    }
    /**
     * AUTONOMOUS: Handle product model ready message
     * Triggered when DataIngestionAgent publishes normalized product
     */
    async handleProductModelReady(message) {
        const { product } = message.payload;
        this.log(`Product received, autonomously generating content blocks for: ${product.name}`);
        // Store product
        this.setState('currentProduct', product);
        // Generate all standard blocks
        const blockTypes = ['benefits', 'usage', 'safety', 'pricing', 'ingredients', 'description'];
        const blocks = this.generateRequestedBlocks(product, blockTypes);
        // Store in state
        this.setState('contentBlocks', blocks);
        // AUTONOMOUS: Publish result - other agents will react
        this.publish(MessageBus_1.MessageType.CONTENT_BLOCKS_READY, {
            blocks,
            productId: product.id
        }, { correlationId: message.correlationId });
        this.log(`Generated ${blockTypes.length} content blocks and published`);
    }
    /**
     * Handle explicit content blocks request
     */
    async handleContentBlocksRequested(message) {
        const { product, blockTypes, comparisonProduct } = message.payload;
        this.log(`Content blocks requested: ${blockTypes.join(', ')}`);
        const blocks = this.generateRequestedBlocks(product, blockTypes, comparisonProduct);
        this.publish(MessageBus_1.MessageType.CONTENT_BLOCKS_READY, {
            blocks,
            productId: product.id
        }, { correlationId: message.correlationId });
    }
    /**
     * Generate all requested blocks
     */
    generateRequestedBlocks(product, requestedBlocks, comparisonProduct) {
        const blocks = {};
        for (const blockType of requestedBlocks) {
            switch (blockType) {
                case 'benefits':
                    blocks.benefits = this.generateBenefits(product);
                    break;
                case 'usage':
                    blocks.usage = this.generateUsage(product);
                    break;
                case 'safety':
                    blocks.safety = this.generateSafety(product);
                    break;
                case 'pricing':
                    blocks.pricing = this.generatePricing(product);
                    break;
                case 'ingredients':
                    blocks.ingredients = this.generateIngredients(product);
                    break;
                case 'description':
                    blocks.description = this.generateDescription(product);
                    break;
                case 'comparison':
                    if (comparisonProduct) {
                        blocks.comparison = this.generateComparison(product, comparisonProduct);
                    }
                    break;
            }
        }
        return blocks;
    }
    // ============================================
    // LOGIC BLOCK GENERATION METHODS
    // ============================================
    /**
     * Generate benefits block
     */
    generateBenefits(product) {
        const result = (0, benefits_logic_1.generateBenefitsBlock)({ product });
        return result.section;
    }
    /**
     * Generate usage block
     */
    generateUsage(product) {
        return (0, usage_logic_1.extractUsageBlock)(product);
    }
    /**
     * Generate safety block
     */
    generateSafety(product) {
        return (0, safety_logic_1.safetyNotesBlock)(product);
    }
    /**
     * Generate pricing block
     */
    generatePricing(product) {
        return (0, price_logic_1.priceBlock)(product);
    }
    /**
     * Generate ingredients block
     */
    generateIngredients(product) {
        const result = (0, ingredients_logic_1.generateIngredientsBlock)({ product });
        return result.section;
    }
    /**
     * Generate description block
     */
    generateDescription(product) {
        const summary = this.createProductSummary(product);
        return {
            headline: product.name,
            summary,
            targetAudience: product.skinTypes
        };
    }
    /**
     * Generate comparison block
     */
    generateComparison(productA, productB) {
        return (0, comparison_logic_1.generateComparisonBlock)({ productA, productB });
    }
    /**
     * Create product summary
     */
    createProductSummary(product) {
        const primaryIngredients = product.ingredients
            .filter(i => i.isPrimary)
            .map(i => i.name)
            .join(' and ');
        const benefits = product.benefits
            .map(b => b.description.toLowerCase())
            .join(' and ');
        return `${product.name} is a ${product.concentration} serum featuring ${primaryIngredients}. Designed for ${product.skinTypes.join(' and ')} skin types, it delivers ${benefits}.`;
    }
}
exports.ContentLogicAgent = ContentLogicAgent;
//# sourceMappingURL=ContentLogicAgent.js.map