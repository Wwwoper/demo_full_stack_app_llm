"""Tool-friendly router for AI agent interaction."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Status
from backend.schemas import TaskCreate, ToolTaskSummary, TaskStats
from backend.services import task_service

router = APIRouter(prefix="/tools", tags=["Agent Tools"])


@router.post("/create_task")
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task (tool-friendly endpoint)."""
    task = task_service.create_task(db, task_data)
    return {
        "action": "task_created",
        "task": {
            "id": task.id,
            "title": task.title,
            "status": task.status.value,
            "priority": task.priority.value,
            "deadline": str(task.deadline) if task.deadline else None
        }
    }


@router.get("/list_tasks")
def list_tasks(db: Session = Depends(get_db)):
    """Get list of tasks with brief summary (tool-friendly)."""
    tasks = task_service.get_tasks(db)
    return {
        "tasks": [
            ToolTaskSummary(
                id=t.id,
                title=t.title,
                status=t.status.value,
                priority=t.priority.value,
                deadline=str(t.deadline) if t.deadline else None
            ) for t in tasks
        ]
    }


@router.post("/update_task_status")
def update_task_status(task_id: int, status: Status, db: Session = Depends(get_db)):
    """Update task status (tool-friendly endpoint)."""
    task = task_service.update_task_status(db, task_id, status)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {
        "action": "status_updated",
        "task_id": task_id,
        "new_status": status.value
    }


@router.post("/delete_task")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task (tool-friendly endpoint)."""
    success = task_service.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {
        "action": "task_deleted",
        "task_id": task_id
    }


@router.get("/stats", response_model=TaskStats)
def get_stats(db: Session = Depends(get_db)):
    """Get task statistics (tool-friendly endpoint)."""
    return task_service.get_stats(db)
