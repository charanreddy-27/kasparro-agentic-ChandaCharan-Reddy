"use strict";
/**
 * PageAssemblyAgent.ts
 * AUTONOMOUS AGENT that combines ProductModel + Logic Blocks + Templates to produce final JSON pages
 *
 * AUTONOMOUS BEHAVIOR:
 * - Subscribes to PAGE_ASSEMBLY_REQUESTED and data-ready messages
 * - Assembles pages when all required data is available
 * - Publishes PAGE_ASSEMBLED when complete
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageAssemblyAgent = void 0;
const AutonomousAgent_1 = require("./AutonomousAgent");
const MessageBus_1 = require("../core/MessageBus");
const comparison_template_1 = require("../templates/comparison.template");
const comparison_logic_1 = require("../logic/comparison.logic");
/**
 * Capabilities provided by this autonomous agent
 */
const CAPABILITIES = [
    {
        name: 'page-assembly',
        description: 'Assemble final JSON pages from components',
        inputTypes: ['ProductModel', 'GeneratedBlocks', 'QuestionSet', 'Template'],
        outputTypes: ['ProductPage', 'ComparisonPage', 'FAQPageOutput']
    },
    {
        name: 'faq-assembly',
        description: 'Assemble FAQ page',
        inputTypes: ['ProductModel', 'QuestionSet'],
        outputTypes: ['FAQPageOutput']
    },
    {
        name: 'product-assembly',
        description: 'Assemble product page',
        inputTypes: ['ProductModel', 'GeneratedBlocks'],
        outputTypes: ['ProductPage']
    },
    {
        name: 'comparison-assembly',
        description: 'Assemble comparison page',
        inputTypes: ['ProductModel', 'ComparisonProduct', 'GeneratedBlocks'],
        outputTypes: ['ComparisonPage']
    }
];
/**
 * Message types this agent subscribes to
 */
const SUBSCRIPTIONS = [
    MessageBus_1.MessageType.PAGE_ASSEMBLY_REQUESTED,
    MessageBus_1.MessageType.PRODUCT_MODEL_READY,
    MessageBus_1.MessageType.QUESTIONS_GENERATED,
    MessageBus_1.MessageType.CONTENT_BLOCKS_READY
];
/**
 * PageAssemblyAgent - AUTONOMOUS page assembly agent
 *
 * Autonomous Behavior:
 * 1. Listens for data-ready messages (product, questions, content blocks)
 * 2. Tracks what data is available
 * 3. Assembles pages when all required data is available
 * 4. Publishes PAGE_ASSEMBLED for final output
 */
class PageAssemblyAgent extends AutonomousAgent_1.AutonomousAgent {
    constructor(id = 'page-assembly-agent') {
        const config = {
            id,
            type: 'PageAssemblyAgent',
            capabilities: CAPABILITIES,
            subscriptions: SUBSCRIPTIONS
        };
        super(config);
    }
    /**
     * Agent startup
     */
    async onStart() {
        this.log('Autonomous page assembly agent initialized');
        // Initialize tracking state
        this.setState('dataAvailable', {
            product: false,
            questions: false,
            contentBlocks: false
        });
    }
    /**
     * Agent shutdown
     */
    async onStop() {
        this.log('Page assembly agent shutting down');
    }
    /**
     * AUTONOMOUS MESSAGE HANDLER
     */
    async onMessage(message) {
        switch (message.type) {
            case MessageBus_1.MessageType.PAGE_ASSEMBLY_REQUESTED:
                await this.handlePageAssemblyRequested(message);
                break;
            case MessageBus_1.MessageType.PRODUCT_MODEL_READY:
                await this.handleProductModelReady(message);
                break;
            case MessageBus_1.MessageType.QUESTIONS_GENERATED:
                await this.handleQuestionsGenerated(message);
                break;
            case MessageBus_1.MessageType.CONTENT_BLOCKS_READY:
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
            case 'assemble-faq':
                return this.assembleFAQPage(payload);
            case 'assemble-product':
                return this.assembleProductPage(payload);
            case 'assemble-comparison':
                return this.assembleComparisonPage(payload);
            default:
                throw new Error(`Unknown task type: ${taskType}`);
        }
    }
    /**
     * AUTONOMOUS: Handle explicit page assembly request
     */
    async handlePageAssemblyRequested(message) {
        const { pageType, product, blocks, questionSet, comparisonProduct } = message.payload;
        this.log(`Page assembly requested: ${pageType}`);
        let output;
        switch (pageType) {
            case 'faq':
                if (!questionSet)
                    throw new Error('Question set required for FAQ');
                output = this.assembleFAQPage({ product, questionSet });
                break;
            case 'product':
                if (!blocks)
                    throw new Error('Blocks required for product page');
                output = this.assembleProductPage({ product, blocks });
                break;
            case 'comparison':
                const compProduct = comparisonProduct || comparison_template_1.FICTIONAL_PRODUCT_B;
                output = this.assembleComparisonPage({
                    product,
                    blocks: blocks || {},
                    comparisonProduct: compProduct
                });
                break;
            default:
                throw new Error(`Unknown page type: ${pageType}`);
        }
        this.publish(MessageBus_1.MessageType.PAGE_ASSEMBLED, {
            ...output,
            productId: product.id
        }, { correlationId: message.correlationId });
        this.log(`${pageType} page assembled and published`);
    }
    /**
     * AUTONOMOUS: Track product model and trigger assembly if ready
     */
    async handleProductModelReady(message) {
        const { product } = message.payload;
        this.log(`Product model received: ${product.name}`);
        this.setState('currentProduct', product);
        const dataAvailable = this.getState('dataAvailable') || {};
        dataAvailable.product = true;
        this.setState('dataAvailable', dataAvailable);
        // Check if we can assemble pages
        await this.checkAndAssemble();
    }
    /**
     * AUTONOMOUS: Track questions and trigger assembly if ready
     */
    async handleQuestionsGenerated(message) {
        const { questionSet, productId } = message.payload;
        this.log('Questions received, storing for assembly');
        this.setState('questionSet', questionSet);
        const dataAvailable = this.getState('dataAvailable') || {};
        dataAvailable.questions = true;
        this.setState('dataAvailable', dataAvailable);
        // Check if we can assemble FAQ page
        await this.checkAndAssemble();
    }
    /**
     * AUTONOMOUS: Track content blocks and trigger assembly if ready
     */
    async handleContentBlocksReady(message) {
        const { blocks, productId } = message.payload;
        this.log('Content blocks received, storing for assembly');
        this.setState('contentBlocks', blocks);
        const dataAvailable = this.getState('dataAvailable') || {};
        dataAvailable.contentBlocks = true;
        this.setState('dataAvailable', dataAvailable);
        // Check if we can assemble pages
        await this.checkAndAssemble();
    }
    /**
     * AUTONOMOUS: Check if all data is available and assemble pages
     */
    async checkAndAssemble() {
        const dataAvailable = this.getState('dataAvailable') || {};
        const product = this.getState('currentProduct');
        // We need product, questions, and content blocks
        if (!dataAvailable.product || !dataAvailable.questions || !dataAvailable.contentBlocks) {
            this.log('Waiting for more data before assembly...');
            return;
        }
        if (!product) {
            this.log('No product data available yet');
            return;
        }
        this.log('All data available, autonomously assembling all pages');
        const questionSet = this.getState('questionSet');
        const blocks = this.getState('contentBlocks');
        // Assemble all three page types
        const faqOutput = this.assembleFAQPage({ product, questionSet });
        const productOutput = this.assembleProductPage({ product, blocks });
        const comparisonOutput = this.assembleComparisonPage({
            product,
            blocks,
            comparisonProduct: comparison_template_1.FICTIONAL_PRODUCT_B
        });
        // Publish all pages
        this.publish(MessageBus_1.MessageType.PAGE_ASSEMBLED, {
            ...faqOutput,
            pageType: 'faq',
            productId: product.id
        });
        this.publish(MessageBus_1.MessageType.PAGE_ASSEMBLED, {
            ...productOutput,
            pageType: 'product',
            productId: product.id
        });
        this.publish(MessageBus_1.MessageType.PAGE_ASSEMBLED, {
            ...comparisonOutput,
            pageType: 'comparison',
            productId: product.id
        });
        this.log('All pages assembled and published');
    }
    /**
     * Assemble FAQ page
     */
    assembleFAQPage(input) {
        const { product, questionSet } = input;
        // Group questions by category
        const categorizedItems = this.groupQuestionsByCategory(questionSet);
        const categories = ['informational', 'safety', 'usage', 'purchase', 'comparison'];
        const page = {
            pageType: 'faq',
            productName: product.name,
            categories: categories.map(category => ({
                category,
                items: categorizedItems[category] || []
            })).filter(cat => cat.items.length > 0),
            totalQuestions: questionSet.totalCount,
            generatedAt: new Date().toISOString()
        };
        return {
            page,
            pageType: 'faq',
            assemblyMetadata: {
                assembledAt: new Date().toISOString(),
                sectionsIncluded: page.categories.map(c => c.category),
                templateVersion: '1.0.0'
            }
        };
    }
    /**
     * Assemble product page
     */
    assembleProductPage(input) {
        const { product, blocks } = input;
        const page = {
            pageType: 'product',
            productName: product.name,
            sections: {
                description: blocks.description || {
                    headline: product.name,
                    summary: '',
                    targetAudience: product.skinTypes
                },
                ingredients: blocks.ingredients || {
                    primary: [],
                    all: [],
                    concentration: product.concentration
                },
                benefits: blocks.benefits || {
                    highlights: [],
                    detailed: []
                },
                usage: blocks.usage || {
                    instructions: '',
                    steps: [],
                    timing: '',
                    frequency: ''
                },
                safety: blocks.safety || {
                    sideEffects: [],
                    warnings: [],
                    suitableFor: []
                },
                pricing: blocks.pricing || {
                    price: 0,
                    currency: 'INR',
                    formatted: ''
                }
            },
            generatedAt: new Date().toISOString()
        };
        return {
            page,
            pageType: 'product',
            assemblyMetadata: {
                assembledAt: new Date().toISOString(),
                sectionsIncluded: Object.keys(page.sections),
                templateVersion: '1.0.0'
            }
        };
    }
    /**
     * Assemble comparison page
     */
    assembleComparisonPage(input) {
        const { product, blocks, comparisonProduct } = input;
        // Generate comparison if not in blocks
        const comparison = blocks.comparison || (0, comparison_logic_1.generateComparisonBlock)({
            productA: product,
            productB: comparisonProduct
        });
        const page = {
            pageType: 'comparison',
            title: `${product.name} vs ${comparisonProduct.name}`,
            products: [
                comparison.productEntries.productA,
                comparison.productEntries.productB
            ],
            comparisonMatrix: comparison.matrix,
            summary: comparison.summary,
            generatedAt: new Date().toISOString()
        };
        return {
            page,
            pageType: 'comparison',
            assemblyMetadata: {
                assembledAt: new Date().toISOString(),
                sectionsIncluded: ['products', 'comparisonMatrix', 'summary'],
                templateVersion: '1.0.0'
            }
        };
    }
    /**
     * Group questions by category
     */
    groupQuestionsByCategory(questionSet) {
        const grouped = {
            informational: [],
            safety: [],
            usage: [],
            purchase: [],
            comparison: []
        };
        for (const question of questionSet.questions) {
            grouped[question.category].push({
                question: question.question,
                answer: question.answer,
                category: question.category
            });
        }
        return grouped;
    }
    /**
     * Store product reference
     */
    setProduct(product) {
        this.setState('currentProduct', product);
        const dataAvailable = this.getState('dataAvailable') || {};
        dataAvailable.product = true;
        this.setState('dataAvailable', dataAvailable);
    }
}
exports.PageAssemblyAgent = PageAssemblyAgent;
//# sourceMappingURL=PageAssemblyAgent.js.map