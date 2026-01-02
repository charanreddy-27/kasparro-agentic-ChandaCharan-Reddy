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

import { AutonomousAgent, AgentConfig } from './AutonomousAgent';
import { MessageType, AgentMessage } from '../core/MessageBus';
import { 
  RawProductData, 
  ProductModel, 
  IngredientInfo, 
  BenefitInfo,
  UsageInfo,
  SafetyInfo,
  PricingInfo,
  ProductMetadata
} from '../models/ProductModel';
import { categorizeBenefit } from '../logic/benefits.logic';
import { parseSideEffects, determineSuitability } from '../logic/safety.logic';
import { formatPrice } from '../logic/price.logic';
import * as crypto from 'crypto';

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
  MessageType.RAW_DATA_RECEIVED,
  MessageType.PIPELINE_START
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
export class DataIngestionAgent extends AutonomousAgent {
  constructor(id: string = 'data-ingestion-agent') {
    const config: AgentConfig = {
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
  protected async onStart(): Promise<void> {
    this.log('Autonomous data ingestion agent initialized and listening');
  }

  /**
   * Agent shutdown - cleanup
   */
  protected async onStop(): Promise<void> {
    this.log('Data ingestion agent shutting down');
  }

  /**
   * AUTONOMOUS MESSAGE HANDLER
   * This is the core of agent autonomy - reacts to messages without direct invocation
   */
  protected async onMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case MessageType.RAW_DATA_RECEIVED:
        await this.handleRawDataReceived(message);
        break;
      case MessageType.PIPELINE_START:
        this.log('Pipeline started - ready to process raw data');
        break;
      default:
        this.log(`Received unhandled message type: ${message.type}`);
    }
  }

  /**
   * Process assigned tasks from TaskQueue
   */
  protected async processTask(
    taskType: string,
    payload: unknown,
    _metadata: Record<string, unknown>
  ): Promise<unknown> {
    switch (taskType) {
      case 'ingest-data':
        return this.normalizeProduct(payload as RawProductData);
      case 'validate-data':
        return this.validateRawData(payload as RawProductData);
      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  /**
   * AUTONOMOUS: Handle raw data received message
   * Triggered by message bus, not direct invocation
   */
  private async handleRawDataReceived(message: AgentMessage): Promise<void> {
    const rawData = message.payload as RawProductData;
    
    this.log('Autonomously processing raw product data...');

    // Validate
    const validation = this.validateRawData(rawData);
    if (!validation.valid) {
      this.publish(MessageType.AGENT_ERROR, {
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
    this.publish(MessageType.PRODUCT_MODEL_READY, {
      product,
      validation: { valid: true, warnings: validation.warnings }
    }, { correlationId: message.correlationId });

    this.log(`Product normalized and published: ${product.name}`);
  }

  /**
   * Validate raw product data
   */
  private validateRawData(rawData: RawProductData): { 
    valid: boolean; 
    errors: string[]; 
    warnings: string[] 
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

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
  private normalizeProduct(raw: RawProductData): ProductModel {
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
  private normalizeIngredients(rawIngredients: string[]): IngredientInfo[] {
    return rawIngredients.map((name, index) => ({
      name,
      isPrimary: index < 2 // First two ingredients are considered primary
    }));
  }

  /**
   * Normalize benefits to BenefitInfo array
   */
  private normalizeBenefits(rawBenefits: string[]): BenefitInfo[] {
    return rawBenefits.map(description => ({
      description,
      category: categorizeBenefit(description)
    }));
  }

  /**
   * Normalize usage instructions to UsageInfo
   */
  private normalizeUsage(howToUse: string): UsageInfo {
    // Parse timing from instructions
    let timing = 'morning or evening';
    if (howToUse.toLowerCase().includes('morning')) {
      timing = 'morning';
    } else if (howToUse.toLowerCase().includes('evening') || howToUse.toLowerCase().includes('night')) {
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
  private normalizeSafety(sideEffects: string, skinTypes: string[]): SafetyInfo {
    const parsedEffects = parseSideEffects(sideEffects);
    const suitableFor = determineSuitability(skinTypes, sideEffects);

    return {
      sideEffects: parsedEffects,
      warnings: [],  // Will be populated by safety logic block
      suitableFor
    };
  }

  /**
   * Normalize pricing information
   */
  private normalizePricing(price: number): PricingInfo {
    return {
      basePrice: price,
      currency: 'INR',
      formattedPrice: formatPrice(price, 'INR')
    };
  }

  /**
   * Generate product metadata
   */
  private generateMetadata(raw: RawProductData): ProductMetadata {
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
  private generateProductId(name: string): string {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `prod_${slug}_${Date.now()}`;
  }

  /**
   * Validate normalized product
   */
  private validateProduct(product: ProductModel): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

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
