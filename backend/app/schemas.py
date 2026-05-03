from pydantic import BaseModel

class UserCreate(BaseModel):
      name: str
      email: str
      password: str

class Login(BaseModel):
      email: str
      password: str

class ProjectCreate(BaseModel):
      name: str

class TaskCreate(BaseModel):
      title: str
      description: str
      due_date: str
      priority: str
      project_id: str

class AddMember(BaseModel):
      user_id: int
      role: str

class TaskCreate(BaseModel):
      title: str
      description: str
      due_date: str
      priority: str
      project_id: int
      assigned_to: int

class TaskUpdate(BaseModel):
      status: str