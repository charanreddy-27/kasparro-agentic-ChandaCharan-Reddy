/**
 * TaskQueue.ts
 * Distributed task queue for agent work coordination
 * Enables dynamic task assignment and load balancing
 */
/**
 * Task priority levels
 */
export declare enum TaskPriority {
    LOW = 0,
    NORMAL = 1,
    HIGH = 2,
    CRITICAL = 3
}
/**
 * Task status enum
 */
export declare enum TaskStatus {
    PENDING = "pending",
    ASSIGNED = "assigned",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
/**
 * Task definition
 */
export interface Task<T = unknown> {
    id: string;
    type: string;
    requiredCapability: string;
    payload: T;
    priority: TaskPriority;
    status: TaskStatus;
    assignedTo?: string;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    result?: unknown;
    error?: string;
    retryCount: number;
    maxRetries: number;
    dependencies: string[];
    metadata: Record<string, unknown>;
}
/**
 * Task result
 */
export interface TaskResult<T = unknown> {
    taskId: string;
    success: boolean;
    data?: T;
    error?: string;
    executionTimeMs: number;
}
/**
 * TaskQueue - Distributed work coordination
 *
 * Features:
 * - Priority-based task scheduling
 * - Capability-based task assignment
 * - Dependency management
 * - Retry mechanism
 * - Load balancing
 */
export declare class TaskQueue {
    private static instance;
    private tasks;
    private pendingQueue;
    private messageBus;
    private registry;
    private taskIdCounter;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): TaskQueue;
    /**
     * Reset queue (for testing)
     */
    static reset(): void;
    /**
     * Setup message handlers for task completion
     */
    private setupMessageHandlers;
    /**
     * Submit a new task to the queue
     */
    submit<T>(type: string, requiredCapability: string, payload: T, options?: {
        priority?: TaskPriority;
        dependencies?: string[];
        maxRetries?: number;
        metadata?: Record<string, unknown>;
    }): Task<T>;
    /**
     * Add task to priority queue
     */
    private enqueue;
    /**
     * Process the queue - assign tasks to available agents
     */
    processQueue(): Promise<void>;
    /**
     * Check if all task dependencies are completed
     */
    private areDependenciesMet;
    /**
     * Handle task completion
     */
    private handleTaskCompletion;
    /**
     * Mark task as started
     */
    startTask(taskId: string): void;
    /**
     * Complete a task
     */
    completeTask<T>(taskId: string, result: T): void;
    /**
     * Fail a task
     */
    failTask(taskId: string, error: string): void;
    /**
     * Get task by ID
     */
    getTask(taskId: string): Task | undefined;
    /**
     * Get task result
     */
    getTaskResult<T>(taskId: string): T | undefined;
    /**
     * Wait for task completion
     */
    waitForTask<T>(taskId: string, timeoutMs?: number): Promise<T>;
    /**
     * Get queue statistics
     */
    getStats(): {
        totalTasks: number;
        pending: number;
        inProgress: number;
        completed: number;
        failed: number;
    };
    /**
     * Generate unique task ID
     */
    private generateTaskId;
}
export default TaskQueue;
//# sourceMappingURL=TaskQueue.d.ts.map