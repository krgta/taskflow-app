from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from .. import models, schemas
from ..dependencies import get_current_user, get_db

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/")
def create_task(
      task: schemas.TaskCreate,
      db: Session = Depends(get_db),
      user = Depends(get_current_user)      
):
      membership = db.query(models.ProjectMember).filter_by(user_id = user.id, project_id = task.project_id).first()

      if not membership or membership.role != "Admin":
            raise HTTPException(status_code=403, detail= "Only admin can create tasks")
      
      new_task = models.Task(
            title = task.title,
            description = task.description,
            due_date = datetime.strptime(task.due_date, "%Y-%m-%d"),
            priority = task.priority,
            status = "To do",
            assigned_to = task.assigned_to,
            project_id = task.project_id
      )
      db.add(new_task)
      db.commit()

      return {"message" : "Task created"}

@router.get("/{project_id}")
def get_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    membership = db.query(models.ProjectMember).filter_by(
        user_id=user.id,
        project_id=project_id
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not part of project")

    tasks = db.query(models.Task).filter_by(project_id=project_id).all()

    return tasks

@router.put("/{task_id}")
def update_task(
    task_id: int,
    data: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    task = db.query(models.Task).filter_by(id=task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Only assigned user OR admin can update
    membership = db.query(models.ProjectMember).filter_by(
        user_id=user.id,
        project_id=task.project_id
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not allowed")

    if user.id != task.assigned_to and membership.role != "Admin":
        raise HTTPException(status_code=403, detail="Not allowed")

    task.status = data.status
    db.commit()

    return {"message": "Task updated"}

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    task = db.query(models.Task).filter_by(id=task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    membership = db.query(models.ProjectMember).filter_by(
        user_id=user.id,
        project_id=task.project_id
    ).first()

    if not membership or membership.role != "Admin":
        raise HTTPException(status_code=403, detail="Only Admin can delete")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted"}