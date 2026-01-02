/**
 * QuestionGenerationAgent.ts
 * AUTONOMOUS AGENT for generating categorized questions from product data
 * 
 * AUTONOMOUS BEHAVIOR:
 * - Subscribes to PRODUCT_MODEL_READY messages
 * - Automatically generates questions when product data is available
 * - Publishes QUESTIONS_GENERATED when complete
 */

import { AutonomousAgent, AgentConfig } from './AutonomousAgent';
import { MessageType, AgentMessage } from '../core/MessageBus';
import { ProductModel } from '../models/ProductModel';
import { 
  QuestionCategory, 
  GeneratedQuestion, 
  QuestionSet 
} from '../models/QuestionModel';

/**
 * Question template for generation
 */
interface QuestionTemplate {
  template: string;
  category: QuestionCategory;
  priority: number;
  requiredFields: string[];
}

/**
 * Capabilities provided by this autonomous agent
 */
const CAPABILITIES = [
  {
    name: 'question-generation',
    description: 'Generate categorized questions from product data',
    inputTypes: ['ProductModel'],
    outputTypes: ['QuestionSet']
  }
];

/**
 * Message types this agent subscribes to (autonomous behavior triggers)
 */
const SUBSCRIPTIONS = [
  MessageType.PRODUCT_MODEL_READY,
  MessageType.QUESTIONS_REQUESTED
];

/**
 * QuestionGenerationAgent - AUTONOMOUS question generation agent
 * 
 * Autonomous Behavior:
 * 1. Listens for PRODUCT_MODEL_READY messages
 * 2. Automatically generates 15+ categorized questions
 * 3. Publishes QUESTIONS_GENERATED for other agents to consume
 */
export class QuestionGenerationAgent extends AutonomousAgent {
  private questionTemplates: QuestionTemplate[];

  constructor(id: string = 'question-generation-agent') {
    const config: AgentConfig = {
      id,
      type: 'QuestionGenerationAgent',
      capabilities: CAPABILITIES,
      subscriptions: SUBSCRIPTIONS
    };
    super(config);
    this.questionTemplates = this.initializeTemplates();
  }

  /**
   * Agent startup - autonomous initialization
   */
  protected async onStart(): Promise<void> {
    this.log('Autonomous question generation agent initialized');
  }

  /**
   * Agent shutdown
   */
  protected async onStop(): Promise<void> {
    this.log('Question generation agent shutting down');
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
      case MessageType.QUESTIONS_REQUESTED:
        await this.handleQuestionsRequested(message);
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
      case 'generate-questions':
        const { product, minQuestions } = payload as { product: ProductModel; minQuestions?: number };
        return this.generateQuestionSet(product, minQuestions || 15);
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
    
    this.log(`Product received, autonomously generating questions for: ${product.name}`);
    
    // Store product for reference
    this.setState('currentProduct', product);

    // Generate questions
    const questionSet = this.generateQuestionSet(product, 15);
    
    // Store in state
    this.setState('questionSet', questionSet);

    // AUTONOMOUS: Publish result - other agents will react
    this.publish(MessageType.QUESTIONS_GENERATED, {
      questionSet,
      productId: product.id
    }, { correlationId: message.correlationId });

    this.log(`Generated ${questionSet.totalCount} questions and published`);
  }

  /**
   * Handle explicit questions request (for re-generation scenarios)
   */
  private async handleQuestionsRequested(message: AgentMessage): Promise<void> {
    const { product, minQuestions } = message.payload as { product: ProductModel; minQuestions?: number };
    
    this.log(`Questions requested for: ${product.name}`);
    
    const questionSet = this.generateQuestionSet(product, minQuestions || 15);
    
    this.publish(MessageType.QUESTIONS_GENERATED, {
      questionSet,
      productId: product.id
    }, { correlationId: message.correlationId });
  }

  /**
   * Generate complete question set
   */
  private generateQuestionSet(product: ProductModel, minQuestions: number): QuestionSet {
    // Generate questions from templates
    let questions = this.generateQuestions(product);
    
    // Ensure minimum question count
    if (questions.length < minQuestions) {
      const additionalQuestions = this.generateAdditionalQuestions(
        product, 
        minQuestions - questions.length,
        questions.length + 1
      );
      questions = [...questions, ...additionalQuestions];
    }

    // Create question set
    return this.createQuestionSet(product, questions);
  }

  /**
   * Initialize question templates
   */
  private initializeTemplates(): QuestionTemplate[] {
    return [
      // Informational questions
      {
        template: 'What is {productName}?',
        category: 'informational',
        priority: 1,
        requiredFields: ['name']
      },
      {
        template: 'What are the key ingredients in {productName}?',
        category: 'informational',
        priority: 2,
        requiredFields: ['name', 'ingredients']
      },
      {
        template: 'What concentration of active ingredients does {productName} contain?',
        category: 'informational',
        priority: 3,
        requiredFields: ['name', 'concentration']
      },
      {
        template: 'What skin types is {productName} suitable for?',
        category: 'informational',
        priority: 4,
        requiredFields: ['name', 'skinTypes']
      },
      {
        template: 'What are the main benefits of {productName}?',
        category: 'informational',
        priority: 5,
        requiredFields: ['name', 'benefits']
      },

      // Safety questions
      {
        template: 'Are there any side effects of using {productName}?',
        category: 'safety',
        priority: 1,
        requiredFields: ['name', 'safety']
      },
      {
        template: 'Is {productName} safe for sensitive skin?',
        category: 'safety',
        priority: 2,
        requiredFields: ['name', 'safety']
      },
      {
        template: 'Can I use {productName} if I have allergies?',
        category: 'safety',
        priority: 3,
        requiredFields: ['name']
      },
      {
        template: 'Should I do a patch test before using {productName}?',
        category: 'safety',
        priority: 4,
        requiredFields: ['name']
      },

      // Usage questions
      {
        template: 'How do I use {productName}?',
        category: 'usage',
        priority: 1,
        requiredFields: ['name', 'usage']
      },
      {
        template: 'When is the best time to apply {productName}?',
        category: 'usage',
        priority: 2,
        requiredFields: ['name', 'usage']
      },
      {
        template: 'How much {productName} should I apply?',
        category: 'usage',
        priority: 3,
        requiredFields: ['name', 'usage']
      },
      {
        template: 'Can I use {productName} with other skincare products?',
        category: 'usage',
        priority: 4,
        requiredFields: ['name']
      },

      // Purchase questions
      {
        template: 'What is the price of {productName}?',
        category: 'purchase',
        priority: 1,
        requiredFields: ['name', 'pricing']
      },
      {
        template: 'Is {productName} worth the price?',
        category: 'purchase',
        priority: 2,
        requiredFields: ['name', 'pricing']
      },
      {
        template: 'Where can I buy {productName}?',
        category: 'purchase',
        priority: 3,
        requiredFields: ['name']
      },

      // Comparison questions
      {
        template: 'How does {productName} compare to other vitamin C serums?',
        category: 'comparison',
        priority: 1,
        requiredFields: ['name', 'ingredients']
      },
      {
        template: 'Is {productName} better than other brightening serums?',
        category: 'comparison',
        priority: 2,
        requiredFields: ['name', 'benefits']
      },
      {
        template: 'What makes {productName} different from similar products?',
        category: 'comparison',
        priority: 3,
        requiredFields: ['name']
      }
    ];
  }

  /**
   * Generate questions from templates
   */
  private generateQuestions(product: ProductModel): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    let questionId = 1;

    for (const template of this.questionTemplates) {
      const question = this.generateQuestionFromTemplate(template, product, questionId);
      if (question) {
        questions.push(question);
        questionId++;
      }
    }

    return questions;
  }

  /**
   * Generate single question from template
   */
  private generateQuestionFromTemplate(
    template: QuestionTemplate,
    product: ProductModel,
    id: number
  ): GeneratedQuestion | null {
    // Check if product has required fields
    for (const field of template.requiredFields) {
      if (!this.hasField(product, field)) {
        return null;
      }
    }

    const questionText = template.template.replace('{productName}', product.name);
    const answer = this.generateAnswer(template, product);

    return {
      id: `q_${id}`,
      question: questionText,
      answer,
      category: template.category,
      priority: template.priority
    };
  }

  /**
   * Check if product has a specific field with value
   */
  private hasField(product: ProductModel, field: string): boolean {
    switch (field) {
      case 'name':
        return !!product.name;
      case 'ingredients':
        return product.ingredients.length > 0;
      case 'concentration':
        return !!product.concentration;
      case 'skinTypes':
        return product.skinTypes.length > 0;
      case 'benefits':
        return product.benefits.length > 0;
      case 'safety':
        return product.safety.sideEffects.length > 0 || product.safety.suitableFor.length > 0;
      case 'usage':
        return !!product.usage.instructions;
      case 'pricing':
        return product.pricing.basePrice > 0;
      default:
        return false;
    }
  }

  /**
   * Generate answer based on template and product
   */
  private generateAnswer(template: QuestionTemplate, product: ProductModel): string {
    const { category } = template;

    switch (category) {
      case 'informational':
        return this.generateInformationalAnswer(template.template, product);
      case 'safety':
        return this.generateSafetyAnswer(template.template, product);
      case 'usage':
        return this.generateUsageAnswer(template.template, product);
      case 'purchase':
        return this.generatePurchaseAnswer(template.template, product);
      case 'comparison':
        return this.generateComparisonAnswer(template.template, product);
      default:
        return '';
    }
  }

  /**
   * Generate informational answer
   */
  private generateInformationalAnswer(templateStr: string, product: ProductModel): string {
    if (templateStr.includes('What is')) {
      return `${product.name} is a ${product.concentration} skincare product formulated for ${product.skinTypes.join(' and ')} skin types. It contains ${product.ingredients.map(i => i.name).join(', ')} as key ingredients.`;
    }
    if (templateStr.includes('key ingredients')) {
      return `The key ingredients in ${product.name} are ${product.ingredients.map(i => i.name).join(', ')}. ${product.ingredients[0]?.isPrimary ? `${product.ingredients[0].name} is the primary active ingredient.` : ''}`;
    }
    if (templateStr.includes('concentration')) {
      return `${product.name} contains ${product.concentration}, which is an effective concentration for visible results while being gentle on the skin.`;
    }
    if (templateStr.includes('skin types')) {
      return `${product.name} is specifically formulated for ${product.skinTypes.join(' and ')} skin types. It works well for these skin types due to its carefully balanced formula.`;
    }
    if (templateStr.includes('benefits')) {
      return `The main benefits of ${product.name} include ${product.benefits.map(b => b.description).join(', ')}. These benefits are achieved through the combination of active ingredients in the formula.`;
    }
    return '';
  }

  /**
   * Generate safety answer
   */
  private generateSafetyAnswer(templateStr: string, product: ProductModel): string {
    if (templateStr.includes('side effects')) {
      const effects = product.safety.sideEffects.join(', ') || 'No major side effects reported';
      return `${product.name} may cause: ${effects}. This is generally mild and temporary. Discontinue use if irritation persists.`;
    }
    if (templateStr.includes('sensitive skin')) {
      const isSuitable = product.safety.suitableFor.some(s => s.toLowerCase().includes('sensitive'));
      return isSuitable 
        ? `${product.name} can be used on sensitive skin with caution. Start with a patch test and use every other day initially.`
        : `${product.name} is formulated for ${product.skinTypes.join(' and ')} skin. If you have sensitive skin, please do a patch test first.`;
    }
    if (templateStr.includes('allergies')) {
      return `If you have known allergies to any ingredients, please check the ingredient list carefully. ${product.name} contains ${product.ingredients.map(i => i.name).join(', ')}. Consult a dermatologist if unsure.`;
    }
    if (templateStr.includes('patch test')) {
      return `Yes, it is recommended to do a patch test before using ${product.name}. Apply a small amount to your inner arm and wait 24 hours to check for any reaction.`;
    }
    return '';
  }

  /**
   * Generate usage answer
   */
  private generateUsageAnswer(templateStr: string, product: ProductModel): string {
    if (templateStr.includes('How do I use')) {
      return `${product.usage.instructions}`;
    }
    if (templateStr.includes('best time')) {
      return `The best time to apply ${product.name} is in the ${product.usage.timing}. ${product.usage.timing === 'morning' ? 'Always follow with sunscreen during the day.' : 'Apply as part of your nighttime routine.'}`;
    }
    if (templateStr.includes('How much')) {
      return `Apply ${product.usage.amount} of ${product.name} to your face and neck. This amount is sufficient for full coverage without wasting product.`;
    }
    if (templateStr.includes('other skincare')) {
      return `Yes, ${product.name} can be used with other skincare products. Apply after cleansing and toning, but before heavier creams and sunscreen. Wait 1-2 minutes between layers.`;
    }
    return '';
  }

  /**
   * Generate purchase answer
   */
  private generatePurchaseAnswer(templateStr: string, product: ProductModel): string {
    if (templateStr.includes('price of')) {
      return `${product.name} is priced at ${product.pricing.formattedPrice}.`;
    }
    if (templateStr.includes('worth the price')) {
      return `${product.name} at ${product.pricing.formattedPrice} offers good value considering its ${product.concentration} concentration and quality ingredients like ${product.ingredients[0]?.name}.`;
    }
    if (templateStr.includes('Where can I buy')) {
      return `${product.name} is available through authorized retailers and online stores. Always purchase from trusted sources to ensure product authenticity.`;
    }
    return '';
  }

  /**
   * Generate comparison answer
   */
  private generateComparisonAnswer(templateStr: string, product: ProductModel): string {
    if (templateStr.includes('compare to other')) {
      return `${product.name} stands out with its ${product.concentration} and combination of ${product.ingredients.map(i => i.name).join(' and ')}. This formula is designed specifically for ${product.skinTypes.join(' and ')} skin types.`;
    }
    if (templateStr.includes('better than')) {
      return `${product.name} offers unique benefits including ${product.benefits.map(b => b.description).join(' and ')}. Its effectiveness depends on your specific skin needs and type.`;
    }
    if (templateStr.includes('different from')) {
      return `What makes ${product.name} different is its targeted formulation for ${product.skinTypes.join(' and ')} skin, combined with ${product.concentration} to deliver ${product.benefits[0]?.description || 'optimal results'}.`;
    }
    return '';
  }

  /**
   * Generate additional questions if minimum not met
   */
  private generateAdditionalQuestions(product: ProductModel, count: number, startId: number): GeneratedQuestion[] {
    const additional: GeneratedQuestion[] = [];

    const extraQuestions: Array<{ q: string; a: string; cat: QuestionCategory }> = [
      {
        q: `How long does it take to see results with ${product.name}?`,
        a: `Results with ${product.name} typically become visible within 4-8 weeks of consistent use. Individual results may vary based on skin type and condition.`,
        cat: 'informational'
      },
      {
        q: `Can I use ${product.name} daily?`,
        a: `Yes, ${product.name} can be used ${product.usage.frequency}. Follow the recommended usage: ${product.usage.instructions}`,
        cat: 'usage'
      },
      {
        q: `Does ${product.name} expire?`,
        a: `Like all skincare products, ${product.name} has a shelf life. Check the packaging for the expiration date and store in a cool, dry place away from direct sunlight.`,
        cat: 'informational'
      }
    ];

    for (let i = 0; i < Math.min(count, extraQuestions.length); i++) {
      additional.push({
        id: `q_${startId + i}`,
        question: extraQuestions[i].q,
        answer: extraQuestions[i].a,
        category: extraQuestions[i].cat,
        priority: 10 + i
      });
    }

    return additional;
  }

  /**
   * Create question set from generated questions
   */
  private createQuestionSet(product: ProductModel, questions: GeneratedQuestion[]): QuestionSet {
    const byCategory: Record<QuestionCategory, number> = {
      informational: 0,
      safety: 0,
      usage: 0,
      purchase: 0,
      comparison: 0
    };

    for (const q of questions) {
      byCategory[q.category]++;
    }

    return {
      productId: product.id,
      questions,
      generatedAt: new Date().toISOString(),
      totalCount: questions.length,
      byCategory
    };
  }
}
