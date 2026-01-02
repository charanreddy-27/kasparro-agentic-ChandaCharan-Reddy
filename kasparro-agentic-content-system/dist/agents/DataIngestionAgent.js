"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataIngestionAgent = void 0;
const AutonomousAgent_1 = require("./AutonomousAgent");
const MessageBus_1 = require("../core/MessageBus");
const benefits_logic_1 = require("../logic/benefits.logic");
const safety_logic_1 = require("../logic/safety.logic");
const price_logic_1 = require("../logic/price.logic");
const crypto = __importStar(require("crypto"));
/**
 * Capabilities provided by this autonomous agent
 */
const CAPABILITIES = [
    {
        name: 'data-ingestion',
        description: 'Parse and normalize raw product data',
        inputTypes: ['RawProductData'],
        outputTypes: ['ProductModel']
    },
    {
        name: 'data-validation',
        description: 'Validate product data structure',
        inputTypes: ['RawProductData'],
        outputTypes: ['ValidationResult']
    }
];
/**
 * Message types this agent subscribes to (autonomous behavior triggers)
 */
const SUBSCRIPTIONS = [
    MessageBus_1.MessageType.RAW_DATA_RECEIVED,
    MessageBus_1.MessageType.PIPELINE_START
];
/**
 * DataIngestionAgent - AUTONOMOUS data processing agent
 *
 * Autonomous Behavior:
 * 1. Listens for RAW_DATA_RECEIVED messages on the message bus
 * 2. Autonomously validates and normalizes data
 * 3. Publishes PRODUCT_MODEL_READY with normalized model
 * 4. Does NOT require direct invocation - reacts to messages
 */
class DataIngestionAgent extends AutonomousAgent_1.AutonomousAgent {
    constructor(id = 'data-ingestion-agent') {
        const config = {
            id,
            type: 'DataIngestionAgent',
            capabilities: CAPABILITIES,
            subscriptions: SUBSCRIPTIONS
        };
        super(config);
    }
    /**
     * Agent startup - autonomous initialization
     */
    async onStart() {
        this.log('Autonomous data ingestion agent initialized and listening');
    }
    /**
     * Agent shutdown - cleanup
     */
    async onStop() {
        this.log('Data ingestion agent shutting down');
    }
    /**
     * AUTONOMOUS MESSAGE HANDLER
     * This is the core of agent autonomy - reacts to messages without direct invocation
     */
    async onMessage(message) {
        switch (message.type) {
            case MessageBus_1.MessageType.RAW_DATA_RECEIVED:
                await this.handleRawDataReceived(message);
                break;
            case MessageBus_1.MessageType.PIPELINE_START:
                this.log('Pipeline started - ready to process raw data');
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
            case 'ingest-data':
                return this.normalizeProduct(payload);
            case 'validate-data':
                return this.validateRawData(payload);
            default:
                throw new Error(`Unknown task type: ${taskType}`);
        }
    }
    /**
     * AUTONOMOUS: Handle raw data received message
     * Triggered by message bus, not direct invocation
     */
    async handleRawDataReceived(message) {
        const rawData = message.payload;
        this.log('Autonomously processing raw product data...');
        // Validate
        const validation = this.validateRawData(rawData);
        if (!validation.valid) {
            this.publish(MessageBus_1.MessageType.AGENT_ERROR, {
                agentId: this.id,
                error: `Validation failed: ${validation.errors.join(', ')}`
            });
            return;
        }
        // Normalize
        const product = this.normalizeProduct(rawData);
        // Store in internal state
        this.setState('currentProduct', product);
        // AUTONOMOUS: Publish result - other agents will react to this
        this.publish(MessageBus_1.MessageType.PRODUCT_MODEL_READY, {
            product,
            validation: { valid: true, warnings: validation.warnings }
        }, { correlationId: message.correlationId });
        this.log(`Product normalized and published: ${product.name}`);
    }
    /**
     * Validate raw product data
     */
    validateRawData(rawData) {
        const errors = [];
        const warnings = [];
        if (!rawData) {
            errors.push('Raw data is required');
            return { valid: false, errors, warnings };
        }
        if (!rawData.product_name || rawData.product_name.trim() === '') {
            errors.push('Product name is required');
        }
        if (!rawData.price || rawData.price <= 0) {
            errors.push('Valid price is required');
        }
        if (!rawData.key_ingredients || rawData.key_ingredients.length === 0) {
            errors.push('At least one key ingredient is required');
        }
        if (!rawData.benefits || rawData.benefits.length === 0) {
            errors.push('At least one benefit is required');
        }
        // Warnings (non-fatal)
        if (!rawData.concentration) {
            warnings.push('Product concentration not specified');
        }
        if (!rawData.skin_type || rawData.skin_type.length === 0) {
            warnings.push('No skin types specified');
        }
        return { valid: errors.length === 0, errors, warnings };
    }
    /**
     * Normalize raw product data to internal ProductModel
     */
    normalizeProduct(raw) {
        const id = this.generateProductId(raw.product_name);
        const ingredients = this.normalizeIngredients(raw.key_ingredients);
        const benefits = this.normalizeBenefits(raw.benefits);
        const usage = this.normalizeUsage(raw.how_to_use);
        const safety = this.normalizeSafety(raw.side_effects, raw.skin_type);
        const pricing = this.normalizePricing(raw.price);
        const metadata = this.generateMetadata(raw);
        return {
            id,
            name: raw.product_name,
            concentration: raw.concentration || '',
            skinTypes: raw.skin_type || [],
            ingredients,
            benefits,
            usage,
            safety,
            pricing,
            metadata
        };
    }
    /**
     * Normalize ingredients to IngredientInfo array
     */
    normalizeIngredients(rawIngredients) {
        return rawIngredients.map((name, index) => ({
            name,
            isPrimary: index < 2 // First two ingredients are considered primary
        }));
    }
    /**
     * Normalize benefits to BenefitInfo array
     */
    normalizeBenefits(rawBenefits) {
        return rawBenefits.map(description => ({
            description,
            category: (0, benefits_logic_1.categorizeBenefit)(description)
        }));
    }
    /**
     * Normalize usage instructions to UsageInfo
     */
    normalizeUsage(howToUse) {
        // Parse timing from instructions
        let timing = 'morning or evening';
        if (howToUse.toLowerCase().includes('morning')) {
            timing = 'morning';
        }
        else if (howToUse.toLowerCase().includes('evening') || howToUse.toLowerCase().includes('night')) {
            timing = 'evening';
        }
        // Parse amount
        let amount = '2-3 drops';
        const amountMatch = howToUse.match(/(\d+[-–]\d+\s*drops?|\d+\s*drops?)/i);
        if (amountMatch) {
            amount = amountMatch[1];
        }
        return {
            instructions: howToUse,
            frequency: 'daily',
            timing,
            amount
        };
    }
    /**
     * Normalize safety information
     */
    normalizeSafety(sideEffects, skinTypes) {
        const parsedEffects = (0, safety_logic_1.parseSideEffects)(sideEffects);
        const suitableFor = (0, safety_logic_1.determineSuitability)(skinTypes, sideEffects);
        return {
            sideEffects: parsedEffects,
            warnings: [], // Will be populated by safety logic block
            suitableFor
        };
    }
    /**
     * Normalize pricing information
     */
    normalizePricing(price) {
        return {
            basePrice: price,
            currency: 'INR',
            formattedPrice: (0, price_logic_1.formatPrice)(price, 'INR')
        };
    }
    /**
     * Generate product metadata
     */
    generateMetadata(raw) {
        const sourceHash = crypto
            .createHash('md5')
            .update(JSON.stringify(raw))
            .digest('hex');
        return {
            createdAt: new Date().toISOString(),
            version: '1.0.0',
            sourceHash
        };
    }
    /**
     * Generate unique product ID from name
     */
    generateProductId(name) {
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        return `prod_${slug}_${Date.now()}`;
    }
    /**
     * Validate normalized product
     */
    validateProduct(product) {
        const warnings = [];
        if (product.ingredients.length < 2) {
            warnings.push('Product has fewer than 2 ingredients');
        }
        if (product.benefits.length < 2) {
            warnings.push('Product has fewer than 2 benefits');
        }
        if (!product.concentration) {
            warnings.push('Product concentration not specified');
        }
        if (product.skinTypes.length === 0) {
            warnings.push('No skin types specified');
        }
        return {
            valid: true, // Warnings don't fail validation
            warnings
        };
    }
}
exports.DataIngestionAgent = DataIngestionAgent;
//# sourceMappingURL=DataIngestionAgent.js.map