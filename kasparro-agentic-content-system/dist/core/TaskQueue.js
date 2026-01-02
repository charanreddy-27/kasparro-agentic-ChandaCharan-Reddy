"use strict";
/**
 * TaskQueue.ts
 * Distributed task queue for agent work coordination
 * Enables dynamic task assignment and load balancing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskQueue = exports.TaskStatus = exports.TaskPriority = void 0;
const MessageBus_1 = require("./MessageBus");
const AgentRegistry_1 = require("./AgentRegistry");
/**
 * Task priority levels
 */
var TaskPriority;
(function (TaskPriority) {
    TaskPriority[TaskPriority["LOW"] = 0] = "LOW";
    TaskPriority[TaskPriority["NORMAL"] = 1] = "NORMAL";
    TaskPriority[TaskPriority["HIGH"] = 2] = "HIGH";
    TaskPriority[TaskPriority["CRITICAL"] = 3] = "CRITICAL";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
/**
 * Task status enum
 */
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["ASSIGNED"] = "assigned";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["FAILED"] = "failed";
    TaskStatus["CANCELLED"] = "cancelled";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
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
class TaskQueue {
    constructor() {
        this.tasks = new Map();
        this.pendingQueue = [];
        this.messageBus = MessageBus_1.MessageBus.getInstance();
        this.registry = AgentRegistry_1.AgentRegistry.getInstance();
        this.taskIdCounter = 0;
        this.setupMessageHandlers();
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!TaskQueue.instance) {
            TaskQueue.instance = new TaskQueue();
        }
        return TaskQueue.instance;
    }
    /**
     * Reset queue (for testing)
     */
    static reset() {
        if (TaskQueue.instance) {
            TaskQueue.instance.tasks.clear();
            TaskQueue.instance.pendingQueue = [];
        }
        TaskQueue.instance = new TaskQueue();
    }
    /**
     * Setup message handlers for task completion
     */
    setupMessageHandlers() {
        this.messageBus.subscribe('task-queue', MessageBus_1.MessageType.TASK_COMPLETED, (message) => {
            const { taskId, result } = message.payload;
            this.handleTaskCompletion(taskId, result);
        });
    }
    /**
     * Submit a new task to the queue
     */
    submit(type, requiredCapability, payload, options) {
        const task = {
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
        this.tasks.set(task.id, task);
        this.enqueue(task.id);
        return task;
    }
    /**
     * Add task to priority queue
     */
    enqueue(taskId) {
        const task = this.tasks.get(taskId);
        if (!task)
            return;
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
    async processQueue() {
        const assignedTasks = [];
        for (const taskId of this.pendingQueue) {
            const task = this.tasks.get(taskId);
            if (!task || task.status !== TaskStatus.PENDING)
                continue;
            // Check dependencies
            if (!this.areDependenciesMet(task))
                continue;
            // Find available agent with required capability
            const agents = this.registry.findReadyByCapability(task.requiredCapability);
            if (agents.length === 0)
                continue;
            // Simple round-robin assignment (first available)
            const agent = agents[0];
            // Assign task
            task.status = TaskStatus.ASSIGNED;
            task.assignedTo = agent.id;
            // Update agent status
            this.registry.updateStatus(agent.id, AgentRegistry_1.AgentStatus.BUSY);
            // Notify agent via message bus
            this.messageBus.publish('task-queue', MessageBus_1.MessageType.TASK_ASSIGNED, {
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
    areDependenciesMet(task) {
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
    handleTaskCompletion(taskId, result) {
        const task = this.tasks.get(taskId);
        if (!task)
            return;
        if (result.success) {
            task.status = TaskStatus.COMPLETED;
            task.result = result.data;
            task.completedAt = new Date();
        }
        else {
            task.retryCount++;
            if (task.retryCount < task.maxRetries) {
                // Retry
                task.status = TaskStatus.PENDING;
                task.assignedTo = undefined;
                this.enqueue(taskId);
            }
            else {
                task.status = TaskStatus.FAILED;
                task.error = result.error;
                task.completedAt = new Date();
            }
        }
        // Update agent status back to ready
        if (task.assignedTo) {
            this.registry.updateStatus(task.assignedTo, AgentRegistry_1.AgentStatus.READY);
        }
        // Process queue for any waiting tasks
        this.processQueue();
    }
    /**
     * Mark task as started
     */
    startTask(taskId) {
        const task = this.tasks.get(taskId);
        if (task && task.status === TaskStatus.ASSIGNED) {
            task.status = TaskStatus.IN_PROGRESS;
            task.startedAt = new Date();
        }
    }
    /**
     * Complete a task
     */
    completeTask(taskId, result) {
        const task = this.tasks.get(taskId);
        if (!task)
            return;
        const taskResult = {
            taskId,
            success: true,
            data: result,
            executionTimeMs: task.startedAt
                ? Date.now() - task.startedAt.getTime()
                : 0
        };
        this.messageBus.publish(task.assignedTo || 'unknown', MessageBus_1.MessageType.TASK_COMPLETED, {
            taskId,
            result: taskResult
        });
    }
    /**
     * Fail a task
     */
    failTask(taskId, error) {
        const task = this.tasks.get(taskId);
        if (!task)
            return;
        const taskResult = {
            taskId,
            success: false,
            error,
            executionTimeMs: task.startedAt
                ? Date.now() - task.startedAt.getTime()
                : 0
        };
        this.messageBus.publish(task.assignedTo || 'unknown', MessageBus_1.MessageType.TASK_COMPLETED, {
            taskId,
            result: taskResult
        });
    }
    /**
     * Get task by ID
     */
    getTask(taskId) {
        return this.tasks.get(taskId);
    }
    /**
     * Get task result
     */
    getTaskResult(taskId) {
        const task = this.tasks.get(taskId);
        return task?.result;
    }
    /**
     * Wait for task completion
     */
    async waitForTask(taskId, timeoutMs = 30000) {
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
                    resolve(task.result);
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
    getStats() {
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
    generateTaskId() {
        this.taskIdCounter++;
        return `task_${Date.now()}_${this.taskIdCounter}`;
    }
}
exports.TaskQueue = TaskQueue;
exports.default = TaskQueue;
//# sourceMappingURL=TaskQueue.js.map