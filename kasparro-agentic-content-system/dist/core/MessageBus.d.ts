/**
 * MessageBus.ts
 * Central message-passing system for inter-agent communication
 * Enables true agent autonomy through publish/subscribe pattern
 */
/**
 * Message types for agent communication
 */
export declare enum MessageType {
    AGENT_REGISTERED = "agent:registered",
    AGENT_READY = "agent:ready",
    AGENT_ERROR = "agent:error",
    RAW_DATA_RECEIVED = "data:raw_received",
    PRODUCT_MODEL_READY = "data:product_ready",
    QUESTIONS_REQUESTED = "questions:requested",
    QUESTIONS_GENERATED = "questions:generated",
    CONTENT_BLOCKS_REQUESTED = "content:blocks_requested",
    CONTENT_BLOCKS_READY = "content:blocks_ready",
    TEMPLATE_REQUESTED = "template:requested",
    TEMPLATE_READY = "template:ready",
    PAGE_ASSEMBLY_REQUESTED = "page:assembly_requested",
    PAGE_ASSEMBLED = "page:assembled",
    PIPELINE_START = "pipeline:start",
    PIPELINE_COMPLETE = "pipeline:complete",
    PIPELINE_ERROR = "pipeline:error",
    TASK_ASSIGNED = "task:assigned",
    TASK_COMPLETED = "task:completed"
}
/**
 * Message structure for inter-agent communication
 */
export interface AgentMessage<T = unknown> {
    id: string;
    type: MessageType;
    source: string;
    target?: string;
    payload: T;
    timestamp: Date;
    correlationId?: string;
    replyTo?: string;
}
/**
 * Message handler function type
 */
export type MessageHandler<T = unknown> = (message: AgentMessage<T>) => void | Promise<void>;
/**
 * MessageBus - Central nervous system of the multi-agent architecture
 *
 * Features:
 * - Publish/Subscribe pattern for decoupled communication
 * - Message routing to specific agents or broadcast
 * - Message history for debugging and replay
 * - Correlation tracking for request-response patterns
 */
export declare class MessageBus {
    private static instance;
    private emitter;
    private subscriptions;
    private messageHistory;
    private messageIdCounter;
    private constructor();
    /**
     * Get singleton instance of MessageBus
     */
    static getInstance(): MessageBus;
    /**
     * Reset the message bus (useful for testing)
     */
    static reset(): void;
    /**
     * Subscribe an agent to a message type
     */
    subscribe<T = unknown>(agentId: string, messageType: MessageType, handler: MessageHandler<T>): void;
    /**
     * Unsubscribe an agent from a message type
     */
    unsubscribe(agentId: string, messageType: MessageType): void;
    /**
     * Publish a message to the bus
     */
    publish<T = unknown>(source: string, type: MessageType, payload: T, options?: {
        target?: string;
        correlationId?: string;
        replyTo?: string;
    }): AgentMessage<T>;
    /**
     * Request-response pattern helper
     */
    request<TReq, TRes>(source: string, requestType: MessageType, responseType: MessageType, payload: TReq, target?: string, timeoutMs?: number): Promise<AgentMessage<TRes>>;
    /**
     * Get message history
     */
    getHistory(): AgentMessage[];
    /**
     * Get messages by correlation ID
     */
    getCorrelatedMessages(correlationId: string): AgentMessage[];
    /**
     * Get subscribers for a message type
     */
    getSubscribers(messageType: MessageType): string[];
    /**
     * Generate unique message ID
     */
    private generateMessageId;
}
export default MessageBus;
//# sourceMappingURL=MessageBus.d.ts.map