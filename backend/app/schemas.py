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


class AddMember(BaseModel):
      email: str
      role: str

class TaskCreate(BaseModel):
      title: str
      description: str
      due_date: str
      priority: str
      project_id: int
      assigned_to_email: str = None

class TaskUpdate(BaseModel):
      status: str = None
      title: str = None
      description: str = None
      due_date: str = None
      priority: str = None
      assigned_to_email: str = None