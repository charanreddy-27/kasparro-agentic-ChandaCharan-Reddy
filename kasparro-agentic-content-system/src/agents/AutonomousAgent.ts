/**
 * AutonomousAgent.ts
 * Base class for autonomous agents with message-driven behavior
 * Agents react to messages and publish results independently
 */

import { MessageBus, MessageType, AgentMessage } from '../core/MessageBus';
import { AgentRegistry, AgentCapability, AgentStatus } from '../core/AgentRegistry';
import { TaskQueue } from '../core/TaskQueue';

/**
 * Agent execution context - passed to handlers
 */
export interface AgentContext {
  agentId: string;
  messageBus: MessageBus;
  registry: AgentRegistry;
  taskQueue: TaskQueue;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  id: string;
  type: string;
  capabilities: AgentCapability[];
  subscriptions: MessageType[];
  metadata?: Record<string, unknown>;
}

/**
 * Agent state store for internal state management
 */
export interface AgentState {
  [key: string]: unknown;
}

/**
 * AutonomousAgent - Base class for all autonomous agents
 * 
 * Features:
 * - Self-registration with registry
 * - Message subscription and handling
 * - Autonomous decision making
 * - State management
 * - Task processing
 */
export abstract class AutonomousAgent {
  protected readonly id: string;
  protected readonly type: string;
  protected readonly capabilities: AgentCapability[];
  protected readonly messageBus: MessageBus;
  protected readonly registry: AgentRegistry;
  protected readonly taskQueue: TaskQueue;
  protected state: AgentState;
  protected isRunning: boolean;

  constructor(config: AgentConfig) {
    this.id = config.id;
    this.type = config.type;
    this.capabilities = config.capabilities;
    this.messageBus = MessageBus.getInstance();
    this.registry = AgentRegistry.getInstance();
    this.taskQueue = TaskQueue.getInstance();
    this.state = {};
    this.isRunning = false;

    // Register with registry
    this.registry.register(
      this.id,
      this.type,
      this.capabilities,
      config.metadata || {}
    );

    // Subscribe to message types
    for (const messageType of config.subscriptions) {
      this.subscribe(messageType);
    }

    // Subscribe to task assignments
    this.messageBus.subscribe(this.id, MessageType.TASK_ASSIGNED, (message) => {
      this.handleTaskAssignment(message);
    });
  }

  /**
   * Start the agent - makes it ready to process messages
   */
  async start(): Promise<void> {
    this.isRunning = true;
    await this.onStart();
    this.registry.updateStatus(this.id, AgentStatus.READY);
    this.log('Agent started and ready');
  }

  /**
   * Stop the agent
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    await this.onStop();
    this.registry.updateStatus(this.id, AgentStatus.OFFLINE);
    this.log('Agent stopped');
  }

  /**
   * Subscribe to a message type
   */
  protected subscribe<T = unknown>(
    messageType: MessageType,
    handler?: (message: AgentMessage<T>) => void | Promise<void>
  ): void {
    const wrappedHandler = async (message: AgentMessage<T>) => {
      if (!this.isRunning) return;
      
      try {
        if (handler) {
          await handler(message);
        } else {
          await this.onMessage(message as AgentMessage);
        }
      } catch (error) {
        this.handleError(error as Error, message as AgentMessage);
      }
    };

    this.messageBus.subscribe(this.id, messageType, wrappedHandler);
  }

  /**
   * Publish a message to the bus
   */
  protected publish<T>(
    type: MessageType,
    payload: T,
    options?: { target?: string; correlationId?: string }
  ): AgentMessage<T> {
    return this.messageBus.publish(this.id, type, payload, options);
  }

  /**
   * Handle incoming task assignment
   */
  private async handleTaskAssignment(message: AgentMessage): Promise<void> {
    const { taskId, taskType, payload, metadata } = message.payload as {
      taskId: string;
      taskType: string;
      payload: unknown;
      metadata: Record<string, unknown>;
    };

    this.log(`Received task: ${taskId} (${taskType})`);
    this.registry.updateStatus(this.id, AgentStatus.BUSY);
    this.taskQueue.startTask(taskId);

    try {
      const result = await this.processTask(taskType, payload, metadata);
      this.taskQueue.completeTask(taskId, result);
      this.log(`Task completed: ${taskId}`);
    } catch (error) {
      this.taskQueue.failTask(taskId, (error as Error).message);
      this.log(`Task failed: ${taskId} - ${(error as Error).message}`);
    }

    this.registry.updateStatus(this.id, AgentStatus.READY);
  }

  /**
   * Handle errors
   */
  protected handleError(error: Error, message?: AgentMessage): void {
    this.log(`Error: ${error.message}`);
    this.publish(MessageType.AGENT_ERROR, {
      agentId: this.id,
      error: error.message,
      message: message?.id
    });
  }

  /**
   * Log message with agent prefix
   */
  protected log(message: string): void {
    console.log(`[${this.type}:${this.id}] ${message}`);
  }

  /**
   * Get agent context for handlers
   */
  protected getContext(): AgentContext {
    return {
      agentId: this.id,
      messageBus: this.messageBus,
      registry: this.registry,
      taskQueue: this.taskQueue
    };
  }

  /**
   * Update internal state
   */
  protected setState(key: string, value: unknown): void {
    this.state[key] = value;
  }

  /**
   * Get internal state
   */
  protected getState<T>(key: string): T | undefined {
    return this.state[key] as T | undefined;
  }

  /**
   * Check if agent has a specific capability
   */
  hasCapability(name: string): boolean {
    return this.capabilities.some(c => c.name === name);
  }

  /**
   * Get agent ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get agent type
   */
  getType(): string {
    return this.type;
  }

  // ============================================
  // ABSTRACT METHODS - Must be implemented by subclasses
  // ============================================

  /**
   * Called when agent starts
   */
  protected abstract onStart(): Promise<void>;

  /**
   * Called when agent stops
   */
  protected abstract onStop(): Promise<void>;

  /**
   * Handle incoming message - agent's autonomous behavior
   */
  protected abstract onMessage(message: AgentMessage): Promise<void>;

  /**
   * Process assigned task
   */
  protected abstract processTask(
    taskType: string,
    payload: unknown,
    metadata: Record<string, unknown>
  ): Promise<unknown>;
}

export default AutonomousAgent;
