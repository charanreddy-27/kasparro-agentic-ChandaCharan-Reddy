"use strict";
/**
 * AutonomousAgent.ts
 * Base class for autonomous agents with message-driven behavior
 * Agents react to messages and publish results independently
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutonomousAgent = void 0;
const MessageBus_1 = require("../core/MessageBus");
const AgentRegistry_1 = require("../core/AgentRegistry");
const TaskQueue_1 = require("../core/TaskQueue");
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
class AutonomousAgent {
    constructor(config) {
        this.id = config.id;
        this.type = config.type;
        this.capabilities = config.capabilities;
        this.messageBus = MessageBus_1.MessageBus.getInstance();
        this.registry = AgentRegistry_1.AgentRegistry.getInstance();
        this.taskQueue = TaskQueue_1.TaskQueue.getInstance();
        this.state = {};
        this.isRunning = false;
        // Register with registry
        this.registry.register(this.id, this.type, this.capabilities, config.metadata || {});
        // Subscribe to message types
        for (const messageType of config.subscriptions) {
            this.subscribe(messageType);
        }
        // Subscribe to task assignments
        this.messageBus.subscribe(this.id, MessageBus_1.MessageType.TASK_ASSIGNED, (message) => {
            this.handleTaskAssignment(message);
        });
    }
    /**
     * Start the agent - makes it ready to process messages
     */
    async start() {
        this.isRunning = true;
        await this.onStart();
        this.registry.updateStatus(this.id, AgentRegistry_1.AgentStatus.READY);
        this.log('Agent started and ready');
    }
    /**
     * Stop the agent
     */
    async stop() {
        this.isRunning = false;
        await this.onStop();
        this.registry.updateStatus(this.id, AgentRegistry_1.AgentStatus.OFFLINE);
        this.log('Agent stopped');
    }
    /**
     * Subscribe to a message type
     */
    subscribe(messageType, handler) {
        const wrappedHandler = async (message) => {
            if (!this.isRunning)
                return;
            try {
                if (handler) {
                    await handler(message);
                }
                else {
                    await this.onMessage(message);
                }
            }
            catch (error) {
                this.handleError(error, message);
            }
        };
        this.messageBus.subscribe(this.id, messageType, wrappedHandler);
    }
    /**
     * Publish a message to the bus
     */
    publish(type, payload, options) {
        return this.messageBus.publish(this.id, type, payload, options);
    }
    /**
     * Handle incoming task assignment
     */
    async handleTaskAssignment(message) {
        const { taskId, taskType, payload, metadata } = message.payload;
        this.log(`Received task: ${taskId} (${taskType})`);
        this.registry.updateStatus(this.id, AgentRegistry_1.AgentStatus.BUSY);
        this.taskQueue.startTask(taskId);
        try {
            const result = await this.processTask(taskType, payload, metadata);
            this.taskQueue.completeTask(taskId, result);
            this.log(`Task completed: ${taskId}`);
        }
        catch (error) {
            this.taskQueue.failTask(taskId, error.message);
            this.log(`Task failed: ${taskId} - ${error.message}`);
        }
        this.registry.updateStatus(this.id, AgentRegistry_1.AgentStatus.READY);
    }
    /**
     * Handle errors
     */
    handleError(error, message) {
        this.log(`Error: ${error.message}`);
        this.publish(MessageBus_1.MessageType.AGENT_ERROR, {
            agentId: this.id,
            error: error.message,
            message: message?.id
        });
    }
    /**
     * Log message with agent prefix
     */
    log(message) {
        console.log(`[${this.type}:${this.id}] ${message}`);
    }
    /**
     * Get agent context for handlers
     */
    getContext() {
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
    setState(key, value) {
        this.state[key] = value;
    }
    /**
     * Get internal state
     */
    getState(key) {
        return this.state[key];
    }
    /**
     * Check if agent has a specific capability
     */
    hasCapability(name) {
        return this.capabilities.some(c => c.name === name);
    }
    /**
     * Get agent ID
     */
    getId() {
        return this.id;
    }
    /**
     * Get agent type
     */
    getType() {
        return this.type;
    }
}
exports.AutonomousAgent = AutonomousAgent;
exports.default = AutonomousAgent;
//# sourceMappingURL=AutonomousAgent.js.map