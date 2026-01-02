"use strict";
/**
 * BaseAgent.ts
 * Abstract base class for all agents in the system
 * Defines the contract for agent input/output
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
exports.createAgentMessage = createAgentMessage;
/**
 * Abstract base agent class
 * All agents must extend this class and implement the execute method
 */
class BaseAgent {
    constructor(agentId, agentType) {
        this.agentId = agentId;
        this.agentType = agentType;
    }
    /**
     * Create success result
     */
    createSuccessResult(data, startTime) {
        return {
            success: true,
            data,
            metadata: this.createMetadata(startTime)
        };
    }
    /**
     * Create error result
     */
    createErrorResult(error, startTime) {
        return {
            success: false,
            data: null,
            error,
            metadata: this.createMetadata(startTime)
        };
    }
    /**
     * Create execution metadata
     */
    createMetadata(startTime) {
        return {
            agentId: this.agentId,
            agentType: this.agentType,
            executedAt: new Date().toISOString(),
            executionTimeMs: Date.now() - startTime
        };
    }
    /**
     * Get agent identifier
     */
    getId() {
        return this.agentId;
    }
    /**
     * Get agent type
     */
    getType() {
        return this.agentType;
    }
}
exports.BaseAgent = BaseAgent;
/**
 * Creates a new agent message
 */
function createAgentMessage(fromAgent, toAgent, messageType, payload) {
    return {
        fromAgent,
        toAgent,
        messageType,
        payload,
        timestamp: new Date().toISOString(),
        correlationId: generateCorrelationId()
    };
}
/**
 * Generates a unique correlation ID for message tracking
 */
function generateCorrelationId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
//# sourceMappingURL=BaseAgent.js.map