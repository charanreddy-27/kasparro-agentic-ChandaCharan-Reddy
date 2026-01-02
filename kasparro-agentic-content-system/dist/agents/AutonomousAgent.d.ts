/**
 * AutonomousAgent.ts
 * Base class for autonomous agents with message-driven behavior
 * Agents react to messages and publish results independently
 */
import { MessageBus, MessageType, AgentMessage } from '../core/MessageBus';
import { AgentRegistry, AgentCapability } from '../core/AgentRegistry';
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
export declare abstract class AutonomousAgent {
    protected readonly id: string;
    protected readonly type: string;
    protected readonly capabilities: AgentCapability[];
    protected readonly messageBus: MessageBus;
    protected readonly registry: AgentRegistry;
    protected readonly taskQueue: TaskQueue;
    protected state: AgentState;
    protected isRunning: boolean;
    constructor(config: AgentConfig);
    /**
     * Start the agent - makes it ready to process messages
     */
    start(): Promise<void>;
    /**
     * Stop the agent
     */
    stop(): Promise<void>;
    /**
     * Subscribe to a message type
     */
    protected subscribe<T = unknown>(messageType: MessageType, handler?: (message: AgentMessage<T>) => void | Promise<void>): void;
    /**
     * Publish a message to the bus
     */
    protected publish<T>(type: MessageType, payload: T, options?: {
        target?: string;
        correlationId?: string;
    }): AgentMessage<T>;
    /**
     * Handle incoming task assignment
     */
    private handleTaskAssignment;
    /**
     * Handle errors
     */
    protected handleError(error: Error, message?: AgentMessage): void;
    /**
     * Log message with agent prefix
     */
    protected log(message: string): void;
    /**
     * Get agent context for handlers
     */
    protected getContext(): AgentContext;
    /**
     * Update internal state
     */
    protected setState(key: string, value: unknown): void;
    /**
     * Get internal state
     */
    protected getState<T>(key: string): T | undefined;
    /**
     * Check if agent has a specific capability
     */
    hasCapability(name: string): boolean;
    /**
     * Get agent ID
     */
    getId(): string;
    /**
     * Get agent type
     */
    getType(): string;
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
    protected abstract processTask(taskType: string, payload: unknown, metadata: Record<string, unknown>): Promise<unknown>;
}
export default AutonomousAgent;
//# sourceMappingURL=AutonomousAgent.d.ts.map