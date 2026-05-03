from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models, schemas, auth

router = APIRouter(prefix= "/auth")

def get_db():
      db = SessionLocal()
      try:
            yield db
      finally:
            db.close()

@router.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
      hashed = auth.hash_password(user.password)
      new_user = models.User(
            name = user.name,
            email = user.email,
            password = hashed
      )
      db.add(new_user)
      db.commit()
      return {"message" : "User Created"}

@router.post("/login")
def login(user: schemas.Login, db: Session = Depends(get_db)):
      db_user = db.query(models.User).filter(models.User.email == user.email).first()

      if not db_user or not auth.verify_password(user.password, db_user.password):
            raise HTTPException(status_code= 400, detail= "Invalid credentials")
      
      token = auth.create_token({"user_id" : db_user.id})
      return {
            "access_token" : token,
            "user": {
                  "id": db_user.id,
                  "email": db_user.email,
                  "name": db_user.name
            }
      }