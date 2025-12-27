"""
Base Agent
Abstract base class for all agents in the system.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional, Generic, TypeVar
from enum import Enum
from datetime import datetime
import uuid


class AgentStatus(Enum):
    """Status of an agent execution."""
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class AgentMessage:
    """
    Message passed between agents.
    Enables communication in the agent pipeline.
    """
    message_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    sender: str = ""
    receiver: str = ""
    message_type: str = "data"
    payload: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "message_id": self.message_id,
            "sender": self.sender,
            "receiver": self.receiver,
            "message_type": self.message_type,
            "payload": self.payload,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }


@dataclass
class AgentContext:
    """
    Shared context available to all agents.
    Contains data accumulated through the pipeline.
    """
    data: Dict[str, Any] = field(default_factory=dict)
    messages: List[AgentMessage] = field(default_factory=list)
    execution_log: List[Dict[str, Any]] = field(default_factory=list)
    
    def set(self, key: str, value: Any) -> None:
        """Set a value in context."""
        self.data[key] = value
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get a value from context."""
        return self.data.get(key, default)
    
    def has(self, key: str) -> bool:
        """Check if key exists in context."""
        return key in self.data
    
    def add_message(self, message: AgentMessage) -> None:
        """Add a message to the context."""
        self.messages.append(message)
    
    def log(self, agent_id: str, action: str, details: Dict[str, Any] = None) -> None:
        """Log an agent action."""
        self.execution_log.append({
            "agent_id": agent_id,
            "action": action,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        })


# Type variable for agent input/output
TInput = TypeVar('TInput')
TOutput = TypeVar('TOutput')


class BaseAgent(ABC, Generic[TInput, TOutput]):
    """
    Abstract base class for all agents.
    
    Each agent has:
    - A single responsibility
    - Defined input/output types
    - No hidden global state
    - Clear execution lifecycle
    """
    
    def __init__(self, agent_id: str, agent_name: str):
        self.agent_id = agent_id
        self.agent_name = agent_name
        self.status = AgentStatus.IDLE
        self._dependencies: List[str] = []
    
    @property
    def dependencies(self) -> List[str]:
        """List of agent IDs this agent depends on."""
        return self._dependencies
    
    @abstractmethod
    def execute(self, input_data: TInput, context: AgentContext) -> TOutput:
        """
        Execute the agent's main task.
        
        Args:
            input_data: Input data for this agent
            context: Shared agent context
            
        Returns:
            Output data from this agent
        """
        pass
    
    @abstractmethod
    def validate_input(self, input_data: TInput) -> bool:
        """Validate that input data is acceptable."""
        pass
    
    def pre_execute(self, context: AgentContext) -> None:
        """Hook called before execution."""
        self.status = AgentStatus.RUNNING
        context.log(self.agent_id, "pre_execute", {"status": "starting"})
    
    def post_execute(self, context: AgentContext, success: bool) -> None:
        """Hook called after execution."""
        self.status = AgentStatus.COMPLETED if success else AgentStatus.FAILED
        context.log(self.agent_id, "post_execute", {"status": self.status.value})
    
    def run(self, input_data: TInput, context: AgentContext) -> TOutput:
        """
        Run the agent with full lifecycle.
        
        This method handles the complete execution lifecycle:
        1. Pre-execution hook
        2. Input validation
        3. Main execution
        4. Post-execution hook
        """
        self.pre_execute(context)
        
        try:
            if not self.validate_input(input_data):
                raise ValueError(f"Invalid input for agent {self.agent_id}")
            
            result = self.execute(input_data, context)
            self.post_execute(context, success=True)
            
            return result
            
        except Exception as e:
            self.post_execute(context, success=False)
            context.log(self.agent_id, "error", {"error": str(e)})
            raise
    
    def send_message(self, context: AgentContext, receiver: str, 
                     payload: Dict[str, Any], message_type: str = "data") -> None:
        """Send a message to another agent via context."""
        message = AgentMessage(
            sender=self.agent_id,
            receiver=receiver,
            message_type=message_type,
            payload=payload
        )
        context.add_message(message)
    
    def receive_messages(self, context: AgentContext) -> List[AgentMessage]:
        """Get all messages addressed to this agent."""
        return [m for m in context.messages if m.receiver == self.agent_id]
