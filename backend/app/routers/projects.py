from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..dependencies import get_current_user, get_db

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/")
def create_project(
      project: schemas.ProjectCreate,
      db: Session = Depends(get_db),
      user = Depends(get_current_user)
):
      new_project = models.Project(
            name = project.name,
            created_by = user.id
      )
      db.add(new_project)
      db.commit()
      db.refresh(new_project)

      #Add  creator as Admin
      member = models.ProjectMember(
            user_id = user.id,
            project_id = new_project.id,
            role = "Admin"
      )
      db.add(member)
      db.commit()

      return {"message" : "Project created", "project_id" : new_project.id}

@router.get("/")
def get_projects(
      db: Session = Depends(get_db),
      user = Depends(get_current_user)
):
      projects = db.query(models.Project).join(models.ProjectMember).filter(models.ProjectMember.user_id == user.id).all()

      return projects

@router.post("/{project_id}/add-member")
def add_member(
      project_id: int,
      data: schemas.AddMember,
      db: Session = Depends(get_db),
      user = Depends(get_current_user)
):
      membership = db.query(models.ProjectMember).filter_by(user_id = user.id, project_id = project_id).first()

      if not membership or membership.role != "Admin":
            raise HTTPException(status_code=403, detail= "Only Admin can add members")
      
      new_member = models.ProjectMember(
            user_id = data.user_id,
            project_id = project_id,
            role = data.role
      )
      db.add(new_member)
      db.commit()

      return {"message" : "Member added"}

@router.delete("/{project_id}/remove-member/{user_id}")
def remove_member(
      project_id: int,
      user_id: int,
      db: Session = Depends(get_db),
      user = Depends(get_current_user)
):
      membership = db.query(models.ProjectMember).filter_by(user_id = user.id, project_id = project_id).first()

      if not membership or membership.role != "Admin":
            raise HTTPException(status_code=403, detail= "Only admin can remove members")
      
      db.query(models.ProjectMember).filter_by(user_id = user.id, project_id = project_id).delete()
      db.commit()

      return {"message" : "Member removed"}