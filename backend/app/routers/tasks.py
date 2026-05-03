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
      
      assigned_to_id = None
      if task.assigned_to_email:
            assignee = db.query(models.User).filter_by(email=task.assigned_to_email).first()
            if not assignee:
                  raise HTTPException(status_code=400, detail="User with this email does not exist")
            assigned_to_id = assignee.id

            existing_member = db.query(models.ProjectMember).filter_by(user_id=assigned_to_id, project_id=task.project_id).first()
            if not existing_member:
                new_member = models.ProjectMember(user_id=assigned_to_id, project_id=task.project_id, role="Member")
                db.add(new_member)

      due_date_parsed = datetime.strptime(task.due_date, "%Y-%m-%d")
      if due_date_parsed.date() < datetime.today().date():
            raise HTTPException(status_code=400, detail="Due date cannot be in the past")

      new_task = models.Task(
            title = task.title,
            description = task.description,
            due_date = due_date_parsed,
            priority = task.priority,
            status = "To do",
            assigned_to = assigned_to_id,
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

    has_task = db.query(models.Task).filter_by(
        assigned_to=user.id,
        project_id=project_id
    ).first()

    if not membership and not has_task:
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
    
    is_admin = membership and membership.role == "Admin"
    is_assignee = task.assigned_to == user.id

    if not is_admin and not is_assignee:
        raise HTTPException(status_code=403, detail="Not allowed")

    if data.status is not None:
        def norm(s): return s.lower().replace(" ", "_").replace("-", "_") if s else ""
        if norm(task.status) == "done" and norm(data.status) != "done":
            raise HTTPException(status_code=400, detail="Cannot revert a completed task")
        task.status = data.status
    if data.title is not None:
        task.title = data.title
    if data.description is not None:
        task.description = data.description
    if data.due_date is not None:
        due_date_parsed = datetime.strptime(data.due_date, "%Y-%m-%d")
        if due_date_parsed.date() < datetime.today().date() and due_date_parsed.date() != task.due_date:
            raise HTTPException(status_code=400, detail="Due date cannot be in the past")
        task.due_date = due_date_parsed
    if data.priority is not None:
        task.priority = data.priority
    if data.assigned_to_email is not None:
        if data.assigned_to_email == "":
            task.assigned_to = None
        else:
            assignee = db.query(models.User).filter_by(email=data.assigned_to_email).first()
            if not assignee:
                raise HTTPException(status_code=400, detail="User with this email does not exist")
            task.assigned_to = assignee.id

            existing_member = db.query(models.ProjectMember).filter_by(user_id=assignee.id, project_id=task.project_id).first()
            if not existing_member:
                new_member = models.ProjectMember(user_id=assignee.id, project_id=task.project_id, role="Member")
                db.add(new_member)

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