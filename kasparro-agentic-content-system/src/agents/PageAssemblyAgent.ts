/**
 * PageAssemblyAgent.ts
 * AUTONOMOUS AGENT that combines ProductModel + Logic Blocks + Templates to produce final JSON pages
 * 
 * AUTONOMOUS BEHAVIOR:
 * - Subscribes to PAGE_ASSEMBLY_REQUESTED and data-ready messages
 * - Assembles pages when all required data is available
 * - Publishes PAGE_ASSEMBLED when complete
 */

import { AutonomousAgent, AgentConfig } from './AutonomousAgent';
import { MessageType, AgentMessage } from '../core/MessageBus';
import { ProductModel, ComparisonProduct } from '../models/ProductModel';
import { QuestionSet, QuestionCategory, FAQItem } from '../models/QuestionModel';
import { 
  ProductPage, 
  ComparisonPage,
  FAQPageOutput
} from '../models/PageModel';
import { GeneratedBlocks } from './ContentLogicAgent';
import { FAQTemplateSchema } from '../templates/faq.template';
import { ProductTemplateSchema } from '../templates/product.template';
import { ComparisonTemplateSchema, FICTIONAL_PRODUCT_B } from '../templates/comparison.template';
import { generateComparisonBlock } from '../logic/comparison.logic';

/**
 * Assembly metadata
 */
export interface AssemblyMetadata {
  assembledAt: string;
  sectionsIncluded: string[];
  templateVersion: string;
}

/**
 * Assembly output structure
 */
export interface PageAssemblyOutput {
  page: ProductPage | ComparisonPage | FAQPageOutput;
  pageType: string;
  assemblyMetadata: AssemblyMetadata;
}

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
  MessageType.PAGE_ASSEMBLY_REQUESTED,
  MessageType.PRODUCT_MODEL_READY,
  MessageType.QUESTIONS_GENERATED,
  MessageType.CONTENT_BLOCKS_READY
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
export class PageAssemblyAgent extends AutonomousAgent {
  constructor(id: string = 'page-assembly-agent') {
    const config: AgentConfig = {
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
  protected async onStart(): Promise<void> {
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
  protected async onStop(): Promise<void> {
    this.log('Page assembly agent shutting down');
  }

  /**
   * AUTONOMOUS MESSAGE HANDLER
   */
  protected async onMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case MessageType.PAGE_ASSEMBLY_REQUESTED:
        await this.handlePageAssemblyRequested(message);
        break;
      case MessageType.PRODUCT_MODEL_READY:
        await this.handleProductModelReady(message);
        break;
      case MessageType.QUESTIONS_GENERATED:
        await this.handleQuestionsGenerated(message);
        break;
      case MessageType.CONTENT_BLOCKS_READY:
        await this.handleContentBlocksReady(message);
        break;
      default:
        this.log(`Received unhandled message type: ${message.type}`);
    }
  }

  /**
   * Process assigned tasks
   */
  protected async processTask(
    taskType: string,
    payload: unknown,
    _metadata: Record<string, unknown>
  ): Promise<unknown> {
    switch (taskType) {
      case 'assemble-faq':
        return this.assembleFAQPage(payload as { product: ProductModel; questionSet: QuestionSet });
      case 'assemble-product':
        return this.assembleProductPage(payload as { product: ProductModel; blocks: GeneratedBlocks });
      case 'assemble-comparison':
        return this.assembleComparisonPage(payload as { 
          product: ProductModel; 
          blocks: GeneratedBlocks;
          comparisonProduct: ComparisonProduct;
        });
      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  /**
   * AUTONOMOUS: Handle explicit page assembly request
   */
  private async handlePageAssemblyRequested(message: AgentMessage): Promise<void> {
    const { pageType, product, blocks, questionSet, comparisonProduct } = message.payload as {
      pageType: 'faq' | 'product' | 'comparison';
      product: ProductModel;
      blocks?: GeneratedBlocks;
      questionSet?: QuestionSet;
      comparisonProduct?: ComparisonProduct;
    };

    this.log(`Page assembly requested: ${pageType}`);

    let output: PageAssemblyOutput;

    switch (pageType) {
      case 'faq':
        if (!questionSet) throw new Error('Question set required for FAQ');
        output = this.assembleFAQPage({ product, questionSet });
        break;
      case 'product':
        if (!blocks) throw new Error('Blocks required for product page');
        output = this.assembleProductPage({ product, blocks });
        break;
      case 'comparison':
        const compProduct = comparisonProduct || FICTIONAL_PRODUCT_B;
        output = this.assembleComparisonPage({ 
          product, 
          blocks: blocks || {}, 
          comparisonProduct: compProduct 
        });
        break;
      default:
        throw new Error(`Unknown page type: ${pageType}`);
    }

    this.publish(MessageType.PAGE_ASSEMBLED, {
      ...output,
      productId: product.id
    }, { correlationId: message.correlationId });

    this.log(`${pageType} page assembled and published`);
  }

  /**
   * AUTONOMOUS: Track product model and trigger assembly if ready
   */
  private async handleProductModelReady(message: AgentMessage): Promise<void> {
    const { product } = message.payload as { product: ProductModel };

    this.log(`Product model received: ${product.name}`);
    this.setState('currentProduct', product);
    
    const dataAvailable = this.getState<Record<string, boolean>>('dataAvailable') || {};
    dataAvailable.product = true;
    this.setState('dataAvailable', dataAvailable);

    // Check if we can assemble pages
    await this.checkAndAssemble();
  }

  /**
   * AUTONOMOUS: Track questions and trigger assembly if ready
   */
  private async handleQuestionsGenerated(message: AgentMessage): Promise<void> {
    const { questionSet, productId } = message.payload as { 
      questionSet: QuestionSet; 
      productId: string;
    };

    this.log('Questions received, storing for assembly');
    this.setState('questionSet', questionSet);
    
    const dataAvailable = this.getState<Record<string, boolean>>('dataAvailable') || {};
    dataAvailable.questions = true;
    this.setState('dataAvailable', dataAvailable);

    // Check if we can assemble FAQ page
    await this.checkAndAssemble();
  }

  /**
   * AUTONOMOUS: Track content blocks and trigger assembly if ready
   */
  private async handleContentBlocksReady(message: AgentMessage): Promise<void> {
    const { blocks, productId } = message.payload as { 
      blocks: GeneratedBlocks; 
      productId: string;
    };

    this.log('Content blocks received, storing for assembly');
    this.setState('contentBlocks', blocks);
    
    const dataAvailable = this.getState<Record<string, boolean>>('dataAvailable') || {};
    dataAvailable.contentBlocks = true;
    this.setState('dataAvailable', dataAvailable);

    // Check if we can assemble pages
    await this.checkAndAssemble();
  }

  /**
   * AUTONOMOUS: Check if all data is available and assemble pages
   */
  private async checkAndAssemble(): Promise<void> {
    const dataAvailable = this.getState<Record<string, boolean>>('dataAvailable') || {};
    const product = this.getState<ProductModel>('currentProduct');
    
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

    const questionSet = this.getState<QuestionSet>('questionSet')!;
    const blocks = this.getState<GeneratedBlocks>('contentBlocks')!;

    // Assemble all three page types
    const faqOutput = this.assembleFAQPage({ product, questionSet });
    const productOutput = this.assembleProductPage({ product, blocks });
    const comparisonOutput = this.assembleComparisonPage({ 
      product, 
      blocks, 
      comparisonProduct: FICTIONAL_PRODUCT_B 
    });

    // Publish all pages
    this.publish(MessageType.PAGE_ASSEMBLED, {
      ...faqOutput,
      pageType: 'faq',
      productId: product.id
    });

    this.publish(MessageType.PAGE_ASSEMBLED, {
      ...productOutput,
      pageType: 'product',
      productId: product.id
    });

    this.publish(MessageType.PAGE_ASSEMBLED, {
      ...comparisonOutput,
      pageType: 'comparison',
      productId: product.id
    });

    this.log('All pages assembled and published');
  }

  /**
   * Assemble FAQ page
   */
  private assembleFAQPage(input: { product: ProductModel; questionSet: QuestionSet }): PageAssemblyOutput {
    const { product, questionSet } = input;

    // Group questions by category
    const categorizedItems = this.groupQuestionsByCategory(questionSet);

    const categories = ['informational', 'safety', 'usage', 'purchase', 'comparison'] as QuestionCategory[];

    const page: FAQPageOutput = {
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
  private assembleProductPage(input: { product: ProductModel; blocks: GeneratedBlocks }): PageAssemblyOutput {
    const { product, blocks } = input;

    const page: ProductPage = {
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
  private assembleComparisonPage(input: { 
    product: ProductModel; 
    blocks: GeneratedBlocks;
    comparisonProduct: ComparisonProduct;
  }): PageAssemblyOutput {
    const { product, blocks, comparisonProduct } = input;

    // Generate comparison if not in blocks
    const comparison = blocks.comparison || generateComparisonBlock({ 
      productA: product, 
      productB: comparisonProduct 
    });

    const page: ComparisonPage = {
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
  private groupQuestionsByCategory(questionSet: QuestionSet): Record<QuestionCategory, FAQItem[]> {
    const grouped: Record<QuestionCategory, FAQItem[]> = {
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
  setProduct(product: ProductModel): void {
    this.setState('currentProduct', product);
    const dataAvailable = this.getState<Record<string, boolean>>('dataAvailable') || {};
    dataAvailable.product = true;
    this.setState('dataAvailable', dataAvailable);
  }
}
