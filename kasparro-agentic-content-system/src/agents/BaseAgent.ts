/**
 * BaseAgent.ts
 * Abstract base class for all agents in the system
 * Defines the contract for agent input/output
 */

/**
 * Agent execution result
 */
export interface AgentResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
  metadata: AgentMetadata;
}

/**
 * Agent execution metadata
 */
export interface AgentMetadata {
  agentId: string;
  agentType: string;
  executedAt: string;
  executionTimeMs: number;
  inputHash?: string;
  outputHash?: string;
}

/**
 * Abstract base agent class
 * All agents must extend this class and implement the execute method
 */
export abstract class BaseAgent<TInput, TOutput> {
  protected readonly agentId: string;
  protected readonly agentType: string;

  constructor(agentId: string, agentType: string) {
    this.agentId = agentId;
    this.agentType = agentType;
  }

  /**
   * Execute the agent's primary task
   * Must be implemented by all concrete agents
   */
  abstract execute(input: TInput): Promise<AgentResult<TOutput>>;

  /**
   * Validate input before execution
   */
  protected abstract validateInput(input: TInput): { valid: boolean; errors: string[] };

  /**
   * Create success result
   */
  protected createSuccessResult(data: TOutput, startTime: number): AgentResult<TOutput> {
    return {
      success: true,
      data,
      metadata: this.createMetadata(startTime)
    };
  }

  /**
   * Create error result
   */
  protected createErrorResult(error: string, startTime: number): AgentResult<TOutput> {
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
  private createMetadata(startTime: number): AgentMetadata {
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
  getId(): string {
    return this.agentId;
  }

  /**
   * Get agent type
   */
  getType(): string {
    return this.agentType;
  }
}

/**
 * Agent communication message
 * Used for inter-agent communication via orchestrator
 */
export interface AgentMessage<T> {
  fromAgent: string;
  toAgent: string;
  messageType: 'request' | 'response' | 'event';
  payload: T;
  timestamp: string;
  correlationId: string;
}

/**
 * Creates a new agent message
 */
export function createAgentMessage<T>(
  fromAgent: string,
  toAgent: string,
  messageType: 'request' | 'response' | 'event',
  payload: T
): AgentMessage<T> {
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
function generateCorrelationId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
