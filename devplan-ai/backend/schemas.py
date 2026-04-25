"""Pydantic schemas for DevPlan AI."""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from backend.models import Priority, Status


class TaskBase(BaseModel):
    """Base schema for Task."""
    
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    deadline: Optional[date] = None


class TaskCreate(TaskBase):
    """Schema for creating a task."""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating a task (all fields optional)."""
    
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    deadline: Optional[date] = None


class TaskResponse(TaskBase):
    """Schema for task response."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    status: Status
    created_at: datetime
    updated_at: datetime


class TaskListParams(BaseModel):
    """Parameters for filtering task list."""
    
    status: Optional[Status] = None
    priority: Optional[Priority] = None
    deadline_before: Optional[date] = None


class TaskStats(BaseModel):
    """Schema for task statistics."""
    
    total: int
    by_status: dict[str, int]
    by_priority: dict[str, int]
    overdue: int


class ToolTaskSummary(BaseModel):
    """Brief task summary for tool API."""
    
    id: int
    title: str
    status: str
    priority: str
    deadline: Optional[str] = None
