/**
 * ContentLogicAgent.ts
 * AUTONOMOUS AGENT that owns and exposes reusable logic blocks
 * 
 * AUTONOMOUS BEHAVIOR:
 * - Subscribes to PRODUCT_MODEL_READY and CONTENT_BLOCKS_REQUESTED messages
 * - Automatically generates content blocks when product data is available
 * - Publishes CONTENT_BLOCKS_READY when complete
 */

import { AutonomousAgent, AgentConfig } from './AutonomousAgent';
import { MessageType, AgentMessage } from '../core/MessageBus';
import { ProductModel, ComparisonProduct } from '../models/ProductModel';
import { 
  BenefitsSection, 
  UsageSection, 
  SafetySection, 
  PricingSection,
  IngredientsSection,
  DescriptionSection
} from '../models/PageModel';
import { generateBenefitsBlock, BenefitsBlockOutput } from '../logic/benefits.logic';
import { generateUsageBlock, extractUsageBlock, UsageBlockOutput } from '../logic/usage.logic';
import { generateSafetyBlock, safetyNotesBlock, SafetyBlockOutput } from '../logic/safety.logic';
import { generatePriceBlock, priceBlock, PriceBlockOutput } from '../logic/price.logic';
import { generateIngredientsBlock, extractIngredientsBlock, IngredientsBlockOutput } from '../logic/ingredients.logic';
import { generateComparisonBlock, ComparisonBlockOutput } from '../logic/comparison.logic';

/**
 * Types of blocks that can be generated
 */
export type BlockType = 
  | 'benefits' 
  | 'usage' 
  | 'safety' 
  | 'pricing' 
  | 'ingredients' 
  | 'description'
  | 'comparison';

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
  MessageType.PRODUCT_MODEL_READY,
  MessageType.CONTENT_BLOCKS_REQUESTED
];

/**
 * ContentLogicAgent - AUTONOMOUS content logic generation agent
 * 
 * Autonomous Behavior:
 * 1. Listens for PRODUCT_MODEL_READY messages
 * 2. Automatically generates all content blocks
 * 3. Publishes CONTENT_BLOCKS_READY for template/assembly agents
 */
export class ContentLogicAgent extends AutonomousAgent {
  constructor(id: string = 'content-logic-agent') {
    const config: AgentConfig = {
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
  protected async onStart(): Promise<void> {
    this.log('Autonomous content logic agent initialized');
  }

  /**
   * Agent shutdown
   */
  protected async onStop(): Promise<void> {
    this.log('Content logic agent shutting down');
  }

  /**
   * AUTONOMOUS MESSAGE HANDLER
   * Reacts to messages without direct invocation
   */
  protected async onMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case MessageType.PRODUCT_MODEL_READY:
        await this.handleProductModelReady(message);
        break;
      case MessageType.CONTENT_BLOCKS_REQUESTED:
        await this.handleContentBlocksRequested(message);
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
      case 'generate-blocks': {
        const { product, blockTypes, comparisonProduct } = payload as { 
          product: ProductModel; 
          blockTypes: BlockType[];
          comparisonProduct?: ComparisonProduct;
        };
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
  private async handleProductModelReady(message: AgentMessage): Promise<void> {
    const { product } = message.payload as { product: ProductModel };
    
    this.log(`Product received, autonomously generating content blocks for: ${product.name}`);
    
    // Store product
    this.setState('currentProduct', product);

    // Generate all standard blocks
    const blockTypes: BlockType[] = ['benefits', 'usage', 'safety', 'pricing', 'ingredients', 'description'];
    const blocks = this.generateRequestedBlocks(product, blockTypes);
    
    // Store in state
    this.setState('contentBlocks', blocks);

    // AUTONOMOUS: Publish result - other agents will react
    this.publish(MessageType.CONTENT_BLOCKS_READY, {
      blocks,
      productId: product.id
    }, { correlationId: message.correlationId });

    this.log(`Generated ${blockTypes.length} content blocks and published`);
  }

  /**
   * Handle explicit content blocks request
   */
  private async handleContentBlocksRequested(message: AgentMessage): Promise<void> {
    const { product, blockTypes, comparisonProduct } = message.payload as { 
      product: ProductModel; 
      blockTypes: BlockType[];
      comparisonProduct?: ComparisonProduct;
    };
    
    this.log(`Content blocks requested: ${blockTypes.join(', ')}`);
    
    const blocks = this.generateRequestedBlocks(product, blockTypes, comparisonProduct);
    
    this.publish(MessageType.CONTENT_BLOCKS_READY, {
      blocks,
      productId: product.id
    }, { correlationId: message.correlationId });
  }

  /**
   * Generate all requested blocks
   */
  private generateRequestedBlocks(
    product: ProductModel, 
    requestedBlocks: BlockType[],
    comparisonProduct?: ComparisonProduct
  ): GeneratedBlocks {
    const blocks: GeneratedBlocks = {};

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
  private generateBenefits(product: ProductModel): BenefitsSection {
    const result: BenefitsBlockOutput = generateBenefitsBlock({ product });
    return result.section;
  }

  /**
   * Generate usage block
   */
  private generateUsage(product: ProductModel): UsageSection {
    return extractUsageBlock(product);
  }

  /**
   * Generate safety block
   */
  private generateSafety(product: ProductModel): SafetySection {
    return safetyNotesBlock(product);
  }

  /**
   * Generate pricing block
   */
  private generatePricing(product: ProductModel): PricingSection {
    return priceBlock(product);
  }

  /**
   * Generate ingredients block
   */
  private generateIngredients(product: ProductModel): IngredientsSection {
    const result: IngredientsBlockOutput = generateIngredientsBlock({ product });
    return result.section;
  }

  /**
   * Generate description block
   */
  private generateDescription(product: ProductModel): DescriptionSection {
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
  private generateComparison(productA: ProductModel, productB: ComparisonProduct): ComparisonBlockOutput {
    return generateComparisonBlock({ productA, productB });
  }

  /**
   * Create product summary
   */
  private createProductSummary(product: ProductModel): string {
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
