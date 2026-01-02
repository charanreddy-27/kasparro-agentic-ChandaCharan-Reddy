"use strict";
/**
 * AgentRegistry.ts
 * Dynamic agent registration and discovery system
 * Enables runtime agent coordination without hard-coded dependencies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistry = exports.AgentStatus = void 0;
const MessageBus_1 = require("./MessageBus");
/**
 * Agent status enum
 */
var AgentStatus;
(function (AgentStatus) {
    AgentStatus["INITIALIZING"] = "initializing";
    AgentStatus["READY"] = "ready";
    AgentStatus["BUSY"] = "busy";
    AgentStatus["ERROR"] = "error";
    AgentStatus["OFFLINE"] = "offline";
})(AgentStatus || (exports.AgentStatus = AgentStatus = {}));
/**
 * AgentRegistry - Dynamic agent discovery and coordination
 *
 * Features:
 * - Dynamic agent registration at runtime
 * - Capability-based agent discovery
 * - Health monitoring via heartbeats
 * - Load balancing support
 */
class AgentRegistry {
    constructor() {
        this.agents = new Map();
        this.capabilityIndex = new Map();
        this.messageBus = MessageBus_1.MessageBus.getInstance();
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!AgentRegistry.instance) {
            AgentRegistry.instance = new AgentRegistry();
        }
        return AgentRegistry.instance;
    }
    /**
     * Reset registry (for testing)
     */
    static reset() {
        if (AgentRegistry.instance) {
            AgentRegistry.instance.agents.clear();
            AgentRegistry.instance.capabilityIndex.clear();
        }
        AgentRegistry.instance = new AgentRegistry();
    }
    /**
     * Register a new agent
     */
    register(id, type, capabilities, metadata = {}) {
        const record = {
            id,
            type,
            capabilities,
            status: AgentStatus.INITIALIZING,
            registeredAt: new Date(),
            lastHeartbeat: new Date(),
            metadata
        };
        this.agents.set(id, record);
        // Index capabilities for fast lookup
        for (const capability of capabilities) {
            if (!this.capabilityIndex.has(capability.name)) {
                this.capabilityIndex.set(capability.name, new Set());
            }
            this.capabilityIndex.get(capability.name).add(id);
        }
        // Announce registration
        this.messageBus.publish('registry', MessageBus_1.MessageType.AGENT_REGISTERED, {
            agentId: id,
            agentType: type,
            capabilities: capabilities.map(c => c.name)
        });
        return record;
    }
    /**
     * Unregister an agent
     */
    unregister(id) {
        const record = this.agents.get(id);
        if (!record)
            return false;
        // Remove from capability index
        for (const capability of record.capabilities) {
            const agentSet = this.capabilityIndex.get(capability.name);
            if (agentSet) {
                agentSet.delete(id);
            }
        }
        this.agents.delete(id);
        return true;
    }
    /**
     * Update agent status
     */
    updateStatus(id, status) {
        const record = this.agents.get(id);
        if (record) {
            record.status = status;
            record.lastHeartbeat = new Date();
            if (status === AgentStatus.READY) {
                this.messageBus.publish('registry', MessageBus_1.MessageType.AGENT_READY, {
                    agentId: id,
                    agentType: record.type
                });
            }
        }
    }
    /**
     * Record heartbeat from agent
     */
    heartbeat(id) {
        const record = this.agents.get(id);
        if (record) {
            record.lastHeartbeat = new Date();
        }
    }
    /**
     * Get agent by ID
     */
    getAgent(id) {
        return this.agents.get(id);
    }
    /**
     * Get all agents of a specific type
     */
    getAgentsByType(type) {
        return Array.from(this.agents.values()).filter(a => a.type === type);
    }
    /**
     * Find agents with a specific capability
     */
    findByCapability(capabilityName) {
        const agentIds = this.capabilityIndex.get(capabilityName);
        if (!agentIds)
            return [];
        return Array.from(agentIds)
            .map(id => this.agents.get(id))
            .filter((a) => a !== undefined);
    }
    /**
     * Find ready agents with a specific capability
     */
    findReadyByCapability(capabilityName) {
        return this.findByCapability(capabilityName)
            .filter(a => a.status === AgentStatus.READY);
    }
    /**
     * Get all registered agents
     */
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    /**
     * Get all ready agents
     */
    getReadyAgents() {
        return this.getAllAgents().filter(a => a.status === AgentStatus.READY);
    }
    /**
     * Check if capability is available
     */
    hasCapability(capabilityName) {
        const agents = this.findReadyByCapability(capabilityName);
        return agents.length > 0;
    }
    /**
     * Get registry statistics
     */
    getStats() {
        const agents = this.getAllAgents();
        return {
            totalAgents: agents.length,
            readyAgents: agents.filter(a => a.status === AgentStatus.READY).length,
            busyAgents: agents.filter(a => a.status === AgentStatus.BUSY).length,
            capabilities: Array.from(this.capabilityIndex.keys())
        };
    }
}
exports.AgentRegistry = AgentRegistry;
exports.default = AgentRegistry;
//# sourceMappingURL=AgentRegistry.js.map