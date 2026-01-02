/**
 * TemplateAgent.ts
 * AUTONOMOUS AGENT that owns and manages structured templates for page generation
 * 
 * AUTONOMOUS BEHAVIOR:
 * - Subscribes to TEMPLATE_REQUESTED messages
 * - Provides template schemas and validation rules on demand
 * - Publishes TEMPLATE_READY when template is prepared
 */

import { AutonomousAgent, AgentConfig } from './AutonomousAgent';
import { MessageType, AgentMessage } from '../core/MessageBus';
import { ProductModel } from '../models/ProductModel';
import { QuestionSet, QuestionCategory } from '../models/QuestionModel';
import { 
  FAQ_TEMPLATE, 
  FAQTemplateSchema, 
  validateFAQAgainstTemplate 
} from '../templates/faq.template';
import { 
  PRODUCT_TEMPLATE, 
  ProductTemplateSchema, 
  validateProductAgainstTemplate,
  getOrderedSections 
} from '../templates/product.template';
import { 
  COMPARISON_TEMPLATE, 
  ComparisonTemplateSchema,
  validateComparisonAgainstTemplate,
  FICTIONAL_PRODUCT_B
} from '../templates/comparison.template';
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
  MessageType.TEMPLATE_REQUESTED,
  MessageType.QUESTIONS_GENERATED,
  MessageType.CONTENT_BLOCKS_READY
];

/**
 * TemplateAgent - AUTONOMOUS template management agent
 * 
 * Autonomous Behavior:
 * 1. Listens for TEMPLATE_REQUESTED messages
 * 2. Prepares appropriate template schema
 * 3. Publishes TEMPLATE_READY with template and validation rules
 */
export class TemplateAgent extends AutonomousAgent {
  constructor(id: string = 'template-agent') {
    const config: AgentConfig = {
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
  protected async onStart(): Promise<void> {
    this.log('Autonomous template agent initialized');
  }

  /**
   * Agent shutdown
   */
  protected async onStop(): Promise<void> {
    this.log('Template agent shutting down');
  }

  /**
   * AUTONOMOUS MESSAGE HANDLER
   */
  protected async onMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case MessageType.TEMPLATE_REQUESTED:
        await this.handleTemplateRequested(message);
        break;
      case MessageType.QUESTIONS_GENERATED:
        // Questions ready - could trigger FAQ template preparation
        await this.handleQuestionsGenerated(message);
        break;
      case MessageType.CONTENT_BLOCKS_READY:
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
  protected async processTask(
    taskType: string,
    payload: unknown,
    _metadata: Record<string, unknown>
  ): Promise<unknown> {
    switch (taskType) {
      case 'get-template': {
        const { templateType } = payload as { templateType: 'faq' | 'product' | 'comparison' };
        return this.prepareTemplate(templateType);
      }
      case 'validate-content': {
        const { templateType, content } = payload as { 
          templateType: 'faq' | 'product' | 'comparison'; 
          content: Record<string, unknown>;
        };
        return this.validateContent(templateType, content);
      }
      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  /**
   * AUTONOMOUS: Handle template request
   */
  private async handleTemplateRequested(message: AgentMessage): Promise<void> {
    const { templateType } = message.payload as { templateType: 'faq' | 'product' | 'comparison' };
    
    this.log(`Template requested: ${templateType}`);
    
    const output = this.prepareTemplate(templateType);
    
    this.publish(MessageType.TEMPLATE_READY, {
      ...output,
      requestedBy: message.source
    }, { correlationId: message.correlationId });

    this.log(`Template ${templateType} published`);
  }

  /**
   * AUTONOMOUS: React to questions being generated
   * Proactively prepares FAQ template
   */
  private async handleQuestionsGenerated(message: AgentMessage): Promise<void> {
    this.log('Questions generated - FAQ template ready if needed');
    
    // Store that questions are available
    this.setState('questionsAvailable', true);
    this.setState('questionSet', (message.payload as { questionSet: QuestionSet }).questionSet);
    
    // Proactively prepare FAQ template
    const faqTemplate = this.prepareTemplate('faq');
    this.setState('faqTemplate', faqTemplate);
  }

  /**
   * AUTONOMOUS: React to content blocks being ready
   * Proactively prepares product and comparison templates
   */
  private async handleContentBlocksReady(message: AgentMessage): Promise<void> {
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
  private prepareTemplate(templateType: 'faq' | 'product' | 'comparison'): TemplateOutput {
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
  private prepareFAQTemplate(): TemplateOutput {
    const requiredBlocks = FAQ_TEMPLATE.sections.map(s => s.source);
    
    const validationRules: ValidationRule[] = FAQ_TEMPLATE.sections.map(section => ({
      field: section.id,
      rule: `Minimum ${section.minQuestions} questions, maximum ${section.maxQuestions}`,
      required: section.minQuestions > 0
    }));

    validationRules.push({
      field: 'total',
      rule: `Minimum ${FAQ_TEMPLATE.metadata.totalMinQuestions} total questions`,
      required: true
    });

    return {
      template: FAQ_TEMPLATE,
      templateType: 'faq',
      requiredBlocks,
      validationRules
    };
  }

  /**
   * Prepare product template
   */
  private prepareProductTemplate(): TemplateOutput {
    const orderedSections = getOrderedSections(PRODUCT_TEMPLATE);
    const requiredBlocks = orderedSections.map(s => s.source);
    
    const validationRules: ValidationRule[] = orderedSections.flatMap(section => 
      section.fields.map(field => ({
        field: `${section.id}.${field.name}`,
        rule: `Type: ${field.type}`,
        required: field.required
      }))
    );

    return {
      template: PRODUCT_TEMPLATE,
      templateType: 'product',
      requiredBlocks,
      validationRules
    };
  }

  /**
   * Prepare comparison template
   */
  private prepareComparisonTemplate(): TemplateOutput {
    const requiredBlocks = COMPARISON_TEMPLATE.sections.map(s => s.source);
    
    const validationRules: ValidationRule[] = [
      {
        field: 'products',
        rule: `Exactly ${COMPARISON_TEMPLATE.metadata.productCount} products required`,
        required: true
      },
      ...COMPARISON_TEMPLATE.metadata.fictionalProductSchema.requiredFields.map(field => ({
        field: `fictionalProduct.${field}`,
        rule: 'Required field for fictional product',
        required: true
      }))
    ];

    return {
      template: COMPARISON_TEMPLATE,
      templateType: 'comparison',
      requiredBlocks,
      validationRules,
      fictionalProduct: FICTIONAL_PRODUCT_B
    };
  }

  /**
   * Validate content against template
   */
  private validateContent(
    templateType: 'faq' | 'product' | 'comparison', 
    content: Record<string, unknown>
  ): { valid: boolean; errors: string[] } {
    switch (templateType) {
      case 'faq':
        return validateFAQAgainstTemplate(
          content as Record<QuestionCategory, number>, 
          FAQ_TEMPLATE
        );
      case 'product':
        return validateProductAgainstTemplate(content, PRODUCT_TEMPLATE);
      case 'comparison':
        return validateComparisonAgainstTemplate(content, COMPARISON_TEMPLATE);
      default:
        return { valid: false, errors: [`Unknown template type: ${templateType}`] };
    }
  }

  // ============================================
  // PUBLIC TEMPLATE METHODS (for direct access)
  // ============================================

  getFAQTemplate(): FAQTemplateSchema { return FAQ_TEMPLATE; }
  getProductTemplate(): ProductTemplateSchema { return PRODUCT_TEMPLATE; }
  getComparisonTemplate(): ComparisonTemplateSchema { return COMPARISON_TEMPLATE; }
  getFictionalProduct(): ComparisonProduct { return FICTIONAL_PRODUCT_B; }
}
