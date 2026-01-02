/**
 * main.ts
 * Entry point for the TRUE Multi-Agent Content Generation System
 *
 * ARCHITECTURE OVERVIEW:
 * This system uses TRUE agent autonomy with message-passing architecture:
 *
 * 1. AUTONOMOUS AGENTS: Each agent extends AutonomousAgent base class
 *    - Self-registers with AgentRegistry
 *    - Subscribes to relevant message types
 *    - Reacts to messages autonomously (no direct invocation)
 *
 * 2. MESSAGE BUS: Central communication system
 *    - Publish/Subscribe pattern
 *    - Decoupled agent communication
 *    - No hard-coded dependencies between agents
 *
 * 3. EVENT-DRIVEN ORCHESTRATION:
 *    - Orchestrator publishes events, does NOT call agents directly
 *    - Agents react to events and publish their results
 *    - Pipeline completes when all expected pages are assembled
 *
 * 4. DYNAMIC COORDINATION:
 *    - Agents can be added/removed at runtime
 *    - AgentRegistry tracks capabilities and status
 *    - TaskQueue enables distributed task assignment
 */
export {};
//# sourceMappingURL=main.d.ts.map