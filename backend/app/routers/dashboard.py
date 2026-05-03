from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from sqlalchemy import func
from .. import models
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/user/me")
def get_user_dashboard(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Projects created by the user
    created_projects = db.query(models.Project).filter(models.Project.created_by == user.id).all()
    
    # Projects assigned to the user (member of, but did not create)
    assigned_projects = db.query(models.Project).join(
        models.ProjectMember, models.Project.id == models.ProjectMember.project_id
    ).filter(
        models.ProjectMember.user_id == user.id,
        models.Project.created_by != user.id
    ).all()

    # Tasks assigned to the user
    tasks = db.query(models.Task, models.Project.name.label("project_name")).join(
        models.Project, models.Task.project_id == models.Project.id
    ).filter(models.Task.assigned_to == user.id).all()

    tasks_data = [
        {
            "id": t.Task.id,
            "title": t.Task.title,
            "description": t.Task.description,
            "due_date": t.Task.due_date,
            "priority": t.Task.priority,
            "status": t.Task.status,
            "project_id": t.Task.project_id,
            "project_name": t.project_name
        } for t in tasks
    ]

    return {
        "created_projects": created_projects,
        "assigned_projects": assigned_projects,
        "tasks": tasks_data
    }


@router.get("/{project_id}")
def get_dashboard(
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
    total_tasks = len(tasks)
    
    todo = 0
    in_progress = 0
    done = 0
    overdue = 0

    for t in tasks:
        s = (t.status or "").lower().replace(" ", "_").replace("-", "_")
        if s in ["in_progress", "inprogress"]:
            in_progress += 1
        elif s in ["done", "completed"]:
            done += 1
        else:
            todo += 1
            
        if t.due_date and t.due_date < date.today() and s not in ["done", "completed"]:
            overdue += 1

    tasks_per_user = db.query(
        models.Task.assigned_to,
        func.count(models.Task.id)
    ).filter_by(project_id=project_id).group_by(models.Task.assigned_to).all()

    result = {
        "total_tasks": total_tasks,
        "todo": todo,
        "in_progress": in_progress,
        "done": done,
        "overdue": overdue,
        "tasks_per_user": [
            {"user_id": user_id, "count": count}
            for user_id, count in tasks_per_user
        ]
    }

    return result