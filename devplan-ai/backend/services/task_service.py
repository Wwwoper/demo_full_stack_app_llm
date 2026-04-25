"""Task service - business logic for task operations."""

from datetime import date, datetime
from typing import Optional
from sqlalchemy.orm import Session
from backend.models import Task, Priority, Status
from backend.schemas import TaskCreate, TaskUpdate


def get_tasks(
    db: Session,
    status: Optional[Status] = None,
    priority: Optional[Priority] = None,
    deadline_before: Optional[date] = None
) -> list[Task]:
    """Get all tasks with optional filters."""
    query = db.query(Task)
    
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if deadline_before:
        query = query.filter(Task.deadline < deadline_before)
    
    return query.order_by(Task.created_at.desc()).all()


def get_task(db: Session, task_id: int) -> Optional[Task]:
    """Get a single task by ID."""
    return db.query(Task).filter(Task.id == task_id).first()


def create_task(db: Session, task_data: TaskCreate) -> Task:
    """Create a new task."""
    task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        deadline=task_data.deadline,
        status=Status.TODO,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task_id: int, task_data: TaskUpdate) -> Optional[Task]:
    """Update an existing task."""
    task = get_task(db, task_id)
    if not task:
        return None
    
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int) -> bool:
    """Delete a task. Returns True if deleted, False if not found."""
    task = get_task(db, task_id)
    if not task:
        return False
    
    db.delete(task)
    db.commit()
    return True


def get_stats(db: Session) -> dict:
    """Get task statistics."""
    all_tasks = db.query(Task).all()
    today = date.today()
    
    by_status = {
        "todo": 0,
        "in_progress": 0,
        "done": 0
    }
    by_priority = {
        "low": 0,
        "medium": 0,
        "high": 0
    }
    overdue = 0
    
    for task in all_tasks:
        by_status[task.status.value] += 1
        by_priority[task.priority.value] += 1
        if task.deadline and task.deadline < today and task.status != Status.DONE:
            overdue += 1
    
    return {
        "total": len(all_tasks),
        "by_status": by_status,
        "by_priority": by_priority,
        "overdue": overdue
    }


def update_task_status(db: Session, task_id: int, status: Status) -> Optional[Task]:
    """Update only the status of a task."""
    task = get_task(db, task_id)
    if not task:
        return None
    
    task.status = status
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task
