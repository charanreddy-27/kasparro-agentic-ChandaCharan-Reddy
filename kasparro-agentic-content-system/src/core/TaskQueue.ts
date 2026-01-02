/**
 * TaskQueue.ts
 * Distributed task queue for agent work coordination
 * Enables dynamic task assignment and load balancing
 */

import { MessageBus, MessageType } from './MessageBus';
import { AgentRegistry, AgentStatus } from './AgentRegistry';

/**
 * Task priority levels
 */
export enum TaskPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

/**
 * Task status enum
 */
export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
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
  dependencies: string[]; // Task IDs that must complete first
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
export class TaskQueue {
  private static instance: TaskQueue;
  private tasks: Map<string, Task>;
  private pendingQueue: string[]; // Task IDs ordered by priority
  private messageBus: MessageBus;
  private registry: AgentRegistry;
  private taskIdCounter: number;

  private constructor() {
    this.tasks = new Map();
    this.pendingQueue = [];
    this.messageBus = MessageBus.getInstance();
    this.registry = AgentRegistry.getInstance();
    this.taskIdCounter = 0;
    
    this.setupMessageHandlers();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): TaskQueue {
    if (!TaskQueue.instance) {
      TaskQueue.instance = new TaskQueue();
    }
    return TaskQueue.instance;
  }

  /**
   * Reset queue (for testing)
   */
  static reset(): void {
    if (TaskQueue.instance) {
      TaskQueue.instance.tasks.clear();
      TaskQueue.instance.pendingQueue = [];
    }
    TaskQueue.instance = new TaskQueue();
  }

  /**
   * Setup message handlers for task completion
   */
  private setupMessageHandlers(): void {
    this.messageBus.subscribe('task-queue', MessageType.TASK_COMPLETED, (message) => {
      const { taskId, result } = message.payload as { taskId: string; result: TaskResult };
      this.handleTaskCompletion(taskId, result);
    });
  }

  /**
   * Submit a new task to the queue
   */
  submit<T>(
    type: string,
    requiredCapability: string,
    payload: T,
    options?: {
      priority?: TaskPriority;
      dependencies?: string[];
      maxRetries?: number;
      metadata?: Record<string, unknown>;
    }
  ): Task<T> {
    const task: Task<T> = {
      id: this.generateTaskId(),
      type,
      requiredCapability,
      payload,
      priority: options?.priority ?? TaskPriority.NORMAL,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: options?.maxRetries ?? 3,
      dependencies: options?.dependencies ?? [],
      metadata: options?.metadata ?? {}
    };

    this.tasks.set(task.id, task as Task);
    this.enqueue(task.id);

    return task;
  }

  /**
   * Add task to priority queue
   */
  private enqueue(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    // Insert based on priority (higher priority first)
    let inserted = false;
    for (let i = 0; i < this.pendingQueue.length; i++) {
      const existingTask = this.tasks.get(this.pendingQueue[i]);
      if (existingTask && task.priority > existingTask.priority) {
        this.pendingQueue.splice(i, 0, taskId);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.pendingQueue.push(taskId);
    }
  }

  /**
   * Process the queue - assign tasks to available agents
   */
  async processQueue(): Promise<void> {
    const assignedTasks: string[] = [];

    for (const taskId of this.pendingQueue) {
      const task = this.tasks.get(taskId);
      if (!task || task.status !== TaskStatus.PENDING) continue;

      // Check dependencies
      if (!this.areDependenciesMet(task)) continue;

      // Find available agent with required capability
      const agents = this.registry.findReadyByCapability(task.requiredCapability);
      if (agents.length === 0) continue;

      // Simple round-robin assignment (first available)
      const agent = agents[0];
      
      // Assign task
      task.status = TaskStatus.ASSIGNED;
      task.assignedTo = agent.id;
      
      // Update agent status
      this.registry.updateStatus(agent.id, AgentStatus.BUSY);
      
      // Notify agent via message bus
      this.messageBus.publish('task-queue', MessageType.TASK_ASSIGNED, {
        taskId: task.id,
        taskType: task.type,
        payload: task.payload,
        metadata: task.metadata
      }, { target: agent.id });

      assignedTasks.push(taskId);
    }

    // Remove assigned tasks from pending queue
    this.pendingQueue = this.pendingQueue.filter(id => !assignedTasks.includes(id));
  }

  /**
   * Check if all task dependencies are completed
   */
  private areDependenciesMet(task: Task): boolean {
    for (const depId of task.dependencies) {
      const depTask = this.tasks.get(depId);
      if (!depTask || depTask.status !== TaskStatus.COMPLETED) {
        return false;
      }
    }
    return true;
  }

  /**
   * Handle task completion
   */
  private handleTaskCompletion(taskId: string, result: TaskResult): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    if (result.success) {
      task.status = TaskStatus.COMPLETED;
      task.result = result.data;
      task.completedAt = new Date();
    } else {
      task.retryCount++;
      if (task.retryCount < task.maxRetries) {
        // Retry
        task.status = TaskStatus.PENDING;
        task.assignedTo = undefined;
        this.enqueue(taskId);
      } else {
        task.status = TaskStatus.FAILED;
        task.error = result.error;
        task.completedAt = new Date();
      }
    }

    // Update agent status back to ready
    if (task.assignedTo) {
      this.registry.updateStatus(task.assignedTo, AgentStatus.READY);
    }

    // Process queue for any waiting tasks
    this.processQueue();
  }

  /**
   * Mark task as started
   */
  startTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.status === TaskStatus.ASSIGNED) {
      task.status = TaskStatus.IN_PROGRESS;
      task.startedAt = new Date();
    }
  }

  /**
   * Complete a task
   */
  completeTask<T>(taskId: string, result: T): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const taskResult: TaskResult<T> = {
      taskId,
      success: true,
      data: result,
      executionTimeMs: task.startedAt 
        ? Date.now() - task.startedAt.getTime() 
        : 0
    };

    this.messageBus.publish(task.assignedTo || 'unknown', MessageType.TASK_COMPLETED, {
      taskId,
      result: taskResult
    });
  }

  /**
   * Fail a task
   */
  failTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const taskResult: TaskResult = {
      taskId,
      success: false,
      error,
      executionTimeMs: task.startedAt 
        ? Date.now() - task.startedAt.getTime() 
        : 0
    };

    this.messageBus.publish(task.assignedTo || 'unknown', MessageType.TASK_COMPLETED, {
      taskId,
      result: taskResult
    });
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get task result
   */
  getTaskResult<T>(taskId: string): T | undefined {
    const task = this.tasks.get(taskId);
    return task?.result as T | undefined;
  }

  /**
   * Wait for task completion
   */
  async waitForTask<T>(taskId: string, timeoutMs: number = 30000): Promise<T> {
    return new Promise((resolve, reject) => {
      const checkInterval = 50;
      let elapsed = 0;

      const check = () => {
        const task = this.tasks.get(taskId);
        if (!task) {
          reject(new Error(`Task ${taskId} not found`));
          return;
        }

        if (task.status === TaskStatus.COMPLETED) {
          resolve(task.result as T);
          return;
        }

        if (task.status === TaskStatus.FAILED) {
          reject(new Error(task.error || 'Task failed'));
          return;
        }

        elapsed += checkInterval;
        if (elapsed >= timeoutMs) {
          reject(new Error(`Task ${taskId} timeout`));
          return;
        }

        setTimeout(check, checkInterval);
      };

      check();
    });
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    totalTasks: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
  } {
    const tasks = Array.from(this.tasks.values());
    return {
      totalTasks: tasks.length,
      pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
      inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      failed: tasks.filter(t => t.status === TaskStatus.FAILED).length
    };
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    this.taskIdCounter++;
    return `task_${Date.now()}_${this.taskIdCounter}`;
  }
}

export default TaskQueue;
