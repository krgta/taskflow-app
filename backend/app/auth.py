from passlib.context import CryptContext
from jose import jwt
import os
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

pwd_context = CryptContext(schemes=["bcrypt"])

def hash_password(password):
      return pwd_context.hash(password[:72])

def verify_password(plain, hashed):
      return pwd_context.verify(plain, hashed)

def create_token(data: dict):
      return jwt.encode(data, SECRET_KEY, algorithm= ALGORITHM)