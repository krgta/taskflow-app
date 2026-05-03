from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from sqlalchemy import func
from .. import models
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

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

    if not membership:
        raise HTTPException(status_code=403, detail="Not part of project")

    total_tasks = db.query(models.Task).filter_by(project_id=project_id).count()

    todo = db.query(models.Task).filter_by(project_id=project_id, status="To Do").count()
    in_progress = db.query(models.Task).filter_by(project_id=project_id, status="In Progress").count()
    done = db.query(models.Task).filter_by(project_id=project_id, status="Done").count()

    overdue = db.query(models.Task).filter(
        models.Task.project_id == project_id,
        models.Task.due_date < date.today(),
        models.Task.status != "Done"
    ).count()

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