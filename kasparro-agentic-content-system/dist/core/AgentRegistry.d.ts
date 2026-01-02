/**
 * AgentRegistry.ts
 * Dynamic agent registration and discovery system
 * Enables runtime agent coordination without hard-coded dependencies
 */
/**
 * Agent capability descriptor
 */
export interface AgentCapability {
    name: string;
    description: string;
    inputTypes: string[];
    outputTypes: string[];
}
/**
 * Agent registration record
 */
export interface AgentRecord {
    id: string;
    type: string;
    capabilities: AgentCapability[];
    status: AgentStatus;
    registeredAt: Date;
    lastHeartbeat: Date;
    metadata: Record<string, unknown>;
}
/**
 * Agent status enum
 */
export declare enum AgentStatus {
    INITIALIZING = "initializing",
    READY = "ready",
    BUSY = "busy",
    ERROR = "error",
    OFFLINE = "offline"
}
/**
 * AgentRegistry - Dynamic agent discovery and coordination
 *
 * Features:
 * - Dynamic agent registration at runtime
 * - Capability-based agent discovery
 * - Health monitoring via heartbeats
 * - Load balancing support
 */
export declare class AgentRegistry {
    private static instance;
    private agents;
    private capabilityIndex;
    private messageBus;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): AgentRegistry;
    /**
     * Reset registry (for testing)
     */
    static reset(): void;
    /**
     * Register a new agent
     */
    register(id: string, type: string, capabilities: AgentCapability[], metadata?: Record<string, unknown>): AgentRecord;
    /**
     * Unregister an agent
     */
    unregister(id: string): boolean;
    /**
     * Update agent status
     */
    updateStatus(id: string, status: AgentStatus): void;
    /**
     * Record heartbeat from agent
     */
    heartbeat(id: string): void;
    /**
     * Get agent by ID
     */
    getAgent(id: string): AgentRecord | undefined;
    /**
     * Get all agents of a specific type
     */
    getAgentsByType(type: string): AgentRecord[];
    /**
     * Find agents with a specific capability
     */
    findByCapability(capabilityName: string): AgentRecord[];
    /**
     * Find ready agents with a specific capability
     */
    findReadyByCapability(capabilityName: string): AgentRecord[];
    /**
     * Get all registered agents
     */
    getAllAgents(): AgentRecord[];
    /**
     * Get all ready agents
     */
    getReadyAgents(): AgentRecord[];
    /**
     * Check if capability is available
     */
    hasCapability(capabilityName: string): boolean;
    /**
     * Get registry statistics
     */
    getStats(): {
        totalAgents: number;
        readyAgents: number;
        busyAgents: number;
        capabilities: string[];
    };
}
export default AgentRegistry;
//# sourceMappingURL=AgentRegistry.d.ts.map