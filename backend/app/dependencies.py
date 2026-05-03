from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from .database import SessionLocal
from .models import User
import os
from dotenv import load_dotenv
load_dotenv()

security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

def get_db():
      db = SessionLocal()
      try:
            yield db
      finally:
            db.close()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db = Depends(get_db)):
      token = credentials.credentials

      try:
            payload = jwt.decode(token, SECRET_KEY, algorithms= [ALGORITHM])
            user_id = payload.get("user_id")
      except:
            raise HTTPException(status_code= 401, detail= "Invalid token")
      
      user = db.query(User).filter(User.id == user_id).first()

      if not user:
            raise HTTPException(status_code=404, detail= "User not found")
      return user