/**
 * Agents index - exports all autonomous agents
 * 
 * All agents now extend AutonomousAgent and communicate via MessageBus
 */

// Core agent base class
export * from './AutonomousAgent';

// Legacy base (kept for reference)
export * from './BaseAgent';

// Autonomous agents
export * from './DataIngestionAgent';
export * from './QuestionGenerationAgent';
export * from './ContentLogicAgent';
export * from './TemplateAgent';
export * from './PageAssemblyAgent';
export * from './OrchestratorAgent';
