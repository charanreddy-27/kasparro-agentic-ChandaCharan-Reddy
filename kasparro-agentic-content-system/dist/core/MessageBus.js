"use strict";
/**
 * MessageBus.ts
 * Central message-passing system for inter-agent communication
 * Enables true agent autonomy through publish/subscribe pattern
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBus = exports.MessageType = void 0;
const events_1 = require("events");
/**
 * Message types for agent communication
 */
var MessageType;
(function (MessageType) {
    // System messages
    MessageType["AGENT_REGISTERED"] = "agent:registered";
    MessageType["AGENT_READY"] = "agent:ready";
    MessageType["AGENT_ERROR"] = "agent:error";
    // Data flow messages
    MessageType["RAW_DATA_RECEIVED"] = "data:raw_received";
    MessageType["PRODUCT_MODEL_READY"] = "data:product_ready";
    // Question generation messages
    MessageType["QUESTIONS_REQUESTED"] = "questions:requested";
    MessageType["QUESTIONS_GENERATED"] = "questions:generated";
    // Content logic messages
    MessageType["CONTENT_BLOCKS_REQUESTED"] = "content:blocks_requested";
    MessageType["CONTENT_BLOCKS_READY"] = "content:blocks_ready";
    // Template messages
    MessageType["TEMPLATE_REQUESTED"] = "template:requested";
    MessageType["TEMPLATE_READY"] = "template:ready";
    // Page assembly messages
    MessageType["PAGE_ASSEMBLY_REQUESTED"] = "page:assembly_requested";
    MessageType["PAGE_ASSEMBLED"] = "page:assembled";
    // Pipeline messages
    MessageType["PIPELINE_START"] = "pipeline:start";
    MessageType["PIPELINE_COMPLETE"] = "pipeline:complete";
    MessageType["PIPELINE_ERROR"] = "pipeline:error";
    // Task messages
    MessageType["TASK_ASSIGNED"] = "task:assigned";
    MessageType["TASK_COMPLETED"] = "task:completed";
})(MessageType || (exports.MessageType = MessageType = {}));
/**
 * MessageBus - Central nervous system of the multi-agent architecture
 *
 * Features:
 * - Publish/Subscribe pattern for decoupled communication
 * - Message routing to specific agents or broadcast
 * - Message history for debugging and replay
 * - Correlation tracking for request-response patterns
 */
class MessageBus {
    constructor() {
        this.emitter = new events_1.EventEmitter();
        this.emitter.setMaxListeners(100); // Allow many agent subscriptions
        this.subscriptions = new Map();
        this.messageHistory = [];
        this.messageIdCounter = 0;
    }
    /**
     * Get singleton instance of MessageBus
     */
    static getInstance() {
        if (!MessageBus.instance) {
            MessageBus.instance = new MessageBus();
        }
        return MessageBus.instance;
    }
    /**
     * Reset the message bus (useful for testing)
     */
    static reset() {
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
    subscribe(agentId, messageType, handler) {
        if (!this.subscriptions.has(messageType)) {
            this.subscriptions.set(messageType, []);
        }
        const subscription = {
            agentId,
            messageType,
            handler: handler
        };
        this.subscriptions.get(messageType).push(subscription);
        // Also register with EventEmitter for async handling
        this.emitter.on(messageType, (message) => {
            // Only deliver to this agent if it's the target or broadcast
            if (!message.target || message.target === agentId) {
                handler(message);
            }
        });
    }
    /**
     * Unsubscribe an agent from a message type
     */
    unsubscribe(agentId, messageType) {
        const subs = this.subscriptions.get(messageType);
        if (subs) {
            const filtered = subs.filter(s => s.agentId !== agentId);
            this.subscriptions.set(messageType, filtered);
        }
    }
    /**
     * Publish a message to the bus
     */
    publish(source, type, payload, options) {
        const message = {
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
        this.messageHistory.push(message);
        // Emit to all subscribers
        this.emitter.emit(type, message);
        return message;
    }
    /**
     * Request-response pattern helper
     */
    async request(source, requestType, responseType, payload, target, timeoutMs = 5000) {
        return new Promise((resolve, reject) => {
            const correlationId = this.generateMessageId();
            const timeout = setTimeout(() => {
                this.emitter.off(responseType, responseHandler);
                reject(new Error(`Request timeout for ${requestType}`));
            }, timeoutMs);
            const responseHandler = (response) => {
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
    getHistory() {
        return [...this.messageHistory];
    }
    /**
     * Get messages by correlation ID
     */
    getCorrelatedMessages(correlationId) {
        return this.messageHistory.filter(m => m.correlationId === correlationId);
    }
    /**
     * Get subscribers for a message type
     */
    getSubscribers(messageType) {
        const subs = this.subscriptions.get(messageType);
        return subs ? subs.map(s => s.agentId) : [];
    }
    /**
     * Generate unique message ID
     */
    generateMessageId() {
        this.messageIdCounter++;
        return `msg_${Date.now()}_${this.messageIdCounter}`;
    }
}
exports.MessageBus = MessageBus;
exports.default = MessageBus;
//# sourceMappingURL=MessageBus.js.map