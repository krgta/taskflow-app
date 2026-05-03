from fastapi import FastAPI
from .database import engine
from .routers import auth, projects, tasks, dashboard
from fastapi.middleware.cors import CORSMiddleware
from . import models
from dotenv import load_dotenv
load_dotenv()

models.Base.metadata.create_all(bind = engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
      return {"message" : "API running"}