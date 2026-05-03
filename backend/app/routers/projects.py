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
      projects = db.query(models.Project, models.ProjectMember.role).join(
          models.ProjectMember, models.Project.id == models.ProjectMember.project_id
      ).filter(models.ProjectMember.user_id == user.id).all()

      return [
            {
                  "id": p.Project.id,
                  "name": p.Project.name,
                  "created_by": p.Project.created_by,
                  "role": p.role
            } for p in projects
      ]

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
      
      target_user = db.query(models.User).filter_by(email=data.email).first()
      if not target_user:
            raise HTTPException(status_code=404, detail="User with this email not found")

      existing_membership = db.query(models.ProjectMember).filter_by(user_id=target_user.id, project_id=project_id).first()
      if existing_membership:
            raise HTTPException(status_code=400, detail="User is already a member")

      new_member = models.ProjectMember(
            user_id = target_user.id,
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

@router.get("/{project_id}/members")
def get_project_members(
      project_id: int,
      db: Session = Depends(get_db),
      user = Depends(get_current_user)
):
      membership = db.query(models.ProjectMember).filter_by(user_id=user.id, project_id=project_id).first()
      if not membership or membership.role != "Admin":
            raise HTTPException(status_code=403, detail="Only Admin can view members list")
      
      members = db.query(models.User.id, models.User.name, models.User.email, models.ProjectMember.role)\
            .join(models.ProjectMember, models.User.id == models.ProjectMember.user_id)\
            .filter(models.ProjectMember.project_id == project_id).all()
      
      return [{"id": m.id, "name": m.name, "email": m.email, "role": m.role} for m in members]