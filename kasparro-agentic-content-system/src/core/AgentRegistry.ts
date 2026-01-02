/**
 * AgentRegistry.ts
 * Dynamic agent registration and discovery system
 * Enables runtime agent coordination without hard-coded dependencies
 */

import { MessageBus, MessageType } from './MessageBus';

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
export enum AgentStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  BUSY = 'busy',
  ERROR = 'error',
  OFFLINE = 'offline'
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
export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, AgentRecord>;
  private capabilityIndex: Map<string, Set<string>>; // capability -> agentIds
  private messageBus: MessageBus;

  private constructor() {
    this.agents = new Map();
    this.capabilityIndex = new Map();
    this.messageBus = MessageBus.getInstance();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  /**
   * Reset registry (for testing)
   */
  static reset(): void {
    if (AgentRegistry.instance) {
      AgentRegistry.instance.agents.clear();
      AgentRegistry.instance.capabilityIndex.clear();
    }
    AgentRegistry.instance = new AgentRegistry();
  }

  /**
   * Register a new agent
   */
  register(
    id: string,
    type: string,
    capabilities: AgentCapability[],
    metadata: Record<string, unknown> = {}
  ): AgentRecord {
    const record: AgentRecord = {
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
      this.capabilityIndex.get(capability.name)!.add(id);
    }

    // Announce registration
    this.messageBus.publish('registry', MessageType.AGENT_REGISTERED, {
      agentId: id,
      agentType: type,
      capabilities: capabilities.map(c => c.name)
    });

    return record;
  }

  /**
   * Unregister an agent
   */
  unregister(id: string): boolean {
    const record = this.agents.get(id);
    if (!record) return false;

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
  updateStatus(id: string, status: AgentStatus): void {
    const record = this.agents.get(id);
    if (record) {
      record.status = status;
      record.lastHeartbeat = new Date();

      if (status === AgentStatus.READY) {
        this.messageBus.publish('registry', MessageType.AGENT_READY, {
          agentId: id,
          agentType: record.type
        });
      }
    }
  }

  /**
   * Record heartbeat from agent
   */
  heartbeat(id: string): void {
    const record = this.agents.get(id);
    if (record) {
      record.lastHeartbeat = new Date();
    }
  }

  /**
   * Get agent by ID
   */
  getAgent(id: string): AgentRecord | undefined {
    return this.agents.get(id);
  }

  /**
   * Get all agents of a specific type
   */
  getAgentsByType(type: string): AgentRecord[] {
    return Array.from(this.agents.values()).filter(a => a.type === type);
  }

  /**
   * Find agents with a specific capability
   */
  findByCapability(capabilityName: string): AgentRecord[] {
    const agentIds = this.capabilityIndex.get(capabilityName);
    if (!agentIds) return [];

    return Array.from(agentIds)
      .map(id => this.agents.get(id))
      .filter((a): a is AgentRecord => a !== undefined);
  }

  /**
   * Find ready agents with a specific capability
   */
  findReadyByCapability(capabilityName: string): AgentRecord[] {
    return this.findByCapability(capabilityName)
      .filter(a => a.status === AgentStatus.READY);
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): AgentRecord[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get all ready agents
   */
  getReadyAgents(): AgentRecord[] {
    return this.getAllAgents().filter(a => a.status === AgentStatus.READY);
  }

  /**
   * Check if capability is available
   */
  hasCapability(capabilityName: string): boolean {
    const agents = this.findReadyByCapability(capabilityName);
    return agents.length > 0;
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalAgents: number;
    readyAgents: number;
    busyAgents: number;
    capabilities: string[];
  } {
    const agents = this.getAllAgents();
    return {
      totalAgents: agents.length,
      readyAgents: agents.filter(a => a.status === AgentStatus.READY).length,
      busyAgents: agents.filter(a => a.status === AgentStatus.BUSY).length,
      capabilities: Array.from(this.capabilityIndex.keys())
    };
  }
}

export default AgentRegistry;
