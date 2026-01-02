/**
 * MessageBus.ts
 * Central message-passing system for inter-agent communication
 * Enables true agent autonomy through publish/subscribe pattern
 */

import { EventEmitter } from 'events';

/**
 * Message types for agent communication
 */
export enum MessageType {
  // System messages
  AGENT_REGISTERED = 'agent:registered',
  AGENT_READY = 'agent:ready',
  AGENT_ERROR = 'agent:error',
  
  // Data flow messages
  RAW_DATA_RECEIVED = 'data:raw_received',
  PRODUCT_MODEL_READY = 'data:product_ready',
  
  // Question generation messages
  QUESTIONS_REQUESTED = 'questions:requested',
  QUESTIONS_GENERATED = 'questions:generated',
  
  // Content logic messages
  CONTENT_BLOCKS_REQUESTED = 'content:blocks_requested',
  CONTENT_BLOCKS_READY = 'content:blocks_ready',
  
  // Template messages
  TEMPLATE_REQUESTED = 'template:requested',
  TEMPLATE_READY = 'template:ready',
  
  // Page assembly messages
  PAGE_ASSEMBLY_REQUESTED = 'page:assembly_requested',
  PAGE_ASSEMBLED = 'page:assembled',
  
  // Pipeline messages
  PIPELINE_START = 'pipeline:start',
  PIPELINE_COMPLETE = 'pipeline:complete',
  PIPELINE_ERROR = 'pipeline:error',
  
  // Task messages
  TASK_ASSIGNED = 'task:assigned',
  TASK_COMPLETED = 'task:completed'
}

/**
 * Message structure for inter-agent communication
 */
export interface AgentMessage<T = unknown> {
  id: string;
  type: MessageType;
  source: string;
  target?: string; // Optional - broadcast if not specified
  payload: T;
  timestamp: Date;
  correlationId?: string; // For tracking related messages
  replyTo?: string; // For request-response pattern
}

/**
 * Message handler function type
 */
export type MessageHandler<T = unknown> = (message: AgentMessage<T>) => void | Promise<void>;

/**
 * Subscription record
 */
interface Subscription {
  agentId: string;
  messageType: MessageType;
  handler: MessageHandler;
}

/**
 * MessageBus - Central nervous system of the multi-agent architecture
 * 
 * Features:
 * - Publish/Subscribe pattern for decoupled communication
 * - Message routing to specific agents or broadcast
 * - Message history for debugging and replay
 * - Correlation tracking for request-response patterns
 */
export class MessageBus {
  private static instance: MessageBus;
  private emitter: EventEmitter;
  private subscriptions: Map<MessageType, Subscription[]>;
  private messageHistory: AgentMessage[];
  private messageIdCounter: number;

  private constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100); // Allow many agent subscriptions
    this.subscriptions = new Map();
    this.messageHistory = [];
    this.messageIdCounter = 0;
  }

  /**
   * Get singleton instance of MessageBus
   */
  static getInstance(): MessageBus {
    if (!MessageBus.instance) {
      MessageBus.instance = new MessageBus();
    }
    return MessageBus.instance;
  }

  /**
   * Reset the message bus (useful for testing)
   */
  static reset(): void {
    if (MessageBus.instance) {
      MessageBus.instance.emitter.removeAllListeners();
      MessageBus.instance.subscriptions.clear();
      MessageBus.instance.messageHistory = [];
      MessageBus.instance.messageIdCounter = 0;
    }
    MessageBus.instance = new MessageBus();
  }

  /**
   * Subscribe an agent to a message type
   */
  subscribe<T = unknown>(
    agentId: string,
    messageType: MessageType,
    handler: MessageHandler<T>
  ): void {
    if (!this.subscriptions.has(messageType)) {
      this.subscriptions.set(messageType, []);
    }

    const subscription: Subscription = {
      agentId,
      messageType,
      handler: handler as MessageHandler
    };

    this.subscriptions.get(messageType)!.push(subscription);
    
    // Also register with EventEmitter for async handling
    this.emitter.on(messageType, (message: AgentMessage<T>) => {
      // Only deliver to this agent if it's the target or broadcast
      if (!message.target || message.target === agentId) {
        handler(message);
      }
    });
  }

  /**
   * Unsubscribe an agent from a message type
   */
  unsubscribe(agentId: string, messageType: MessageType): void {
    const subs = this.subscriptions.get(messageType);
    if (subs) {
      const filtered = subs.filter(s => s.agentId !== agentId);
      this.subscriptions.set(messageType, filtered);
    }
  }

  /**
   * Publish a message to the bus
   */
  publish<T = unknown>(
    source: string,
    type: MessageType,
    payload: T,
    options?: {
      target?: string;
      correlationId?: string;
      replyTo?: string;
    }
  ): AgentMessage<T> {
    const message: AgentMessage<T> = {
      id: this.generateMessageId(),
      type,
      source,
      target: options?.target,
      payload,
      timestamp: new Date(),
      correlationId: options?.correlationId,
      replyTo: options?.replyTo
    };

    // Store in history
    this.messageHistory.push(message as AgentMessage);

    // Emit to all subscribers
    this.emitter.emit(type, message);

    return message;
  }

  /**
   * Request-response pattern helper
   */
  async request<TReq, TRes>(
    source: string,
    requestType: MessageType,
    responseType: MessageType,
    payload: TReq,
    target?: string,
    timeoutMs: number = 5000
  ): Promise<AgentMessage<TRes>> {
    return new Promise((resolve, reject) => {
      const correlationId = this.generateMessageId();
      
      const timeout = setTimeout(() => {
        this.emitter.off(responseType, responseHandler);
        reject(new Error(`Request timeout for ${requestType}`));
      }, timeoutMs);

      const responseHandler = (response: AgentMessage<TRes>) => {
        if (response.correlationId === correlationId) {
          clearTimeout(timeout);
          this.emitter.off(responseType, responseHandler);
          resolve(response);
        }
      };

      this.emitter.on(responseType, responseHandler);

      this.publish(source, requestType, payload, {
        target,
        correlationId,
        replyTo: source
      });
    });
  }

  /**
   * Get message history
   */
  getHistory(): AgentMessage[] {
    return [...this.messageHistory];
  }

  /**
   * Get messages by correlation ID
   */
  getCorrelatedMessages(correlationId: string): AgentMessage[] {
    return this.messageHistory.filter(m => m.correlationId === correlationId);
  }

  /**
   * Get subscribers for a message type
   */
  getSubscribers(messageType: MessageType): string[] {
    const subs = this.subscriptions.get(messageType);
    return subs ? subs.map(s => s.agentId) : [];
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    this.messageIdCounter++;
    return `msg_${Date.now()}_${this.messageIdCounter}`;
  }
}

export default MessageBus;
