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
export declare abstract class BaseAgent<TInput, TOutput> {
    protected readonly agentId: string;
    protected readonly agentType: string;
    constructor(agentId: string, agentType: string);
    /**
     * Execute the agent's primary task
     * Must be implemented by all concrete agents
     */
    abstract execute(input: TInput): Promise<AgentResult<TOutput>>;
    /**
     * Validate input before execution
     */
    protected abstract validateInput(input: TInput): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Create success result
     */
    protected createSuccessResult(data: TOutput, startTime: number): AgentResult<TOutput>;
    /**
     * Create error result
     */
    protected createErrorResult(error: string, startTime: number): AgentResult<TOutput>;
    /**
     * Create execution metadata
     */
    private createMetadata;
    /**
     * Get agent identifier
     */
    getId(): string;
    /**
     * Get agent type
     */
    getType(): string;
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
export declare function createAgentMessage<T>(fromAgent: string, toAgent: string, messageType: 'request' | 'response' | 'event', payload: T): AgentMessage<T>;
//# sourceMappingURL=BaseAgent.d.ts.map