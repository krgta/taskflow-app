from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

pwd_context = CryptContext(schemes=["argon2"])

def hash_password(password):
      return pwd_context.hash(password)

def verify_password(plain, hashed):
      return pwd_context.verify(plain, hashed)

def create_token(data: dict):
       to_encode = data.copy()
       to_encode["exp"] = datetime.utcnow() + timedelta(days=7)
       return jwt.encode(to_encode, SECRET_KEY, algorithm= ALGORITHM)