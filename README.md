# TaskFlow

TaskFlow is a full-stack **Team Task Management Web Application** that enables users to create projects, assign tasks, and track progress efficiently using a Kanban board.

It is inspired by tools like Trello and designed to demonstrate real-world collaboration features with role-based access control.

---

##  Features

###  Authentication

* User signup and login
* JWT-based authentication
* Secure password handling

###  Project Management

* Create and manage projects
* Add/remove team members
* Role-based access (Admin / Member)

###  Task Management

* Create tasks with:

  * Title
  * Description
  * Due date
  * Priority
* Assign tasks to users
* Update task status:

  * To Do
  * In Progress
  * Done
* Delete tasks (Admin only)

###  Kanban Board

* Drag-and-drop interface
* Visual task tracking
* Real-time status updates

###  Dashboard

* Total tasks
* Tasks by status
* Overdue tasks
* Tasks per user

---

##  Tech Stack

### Frontend

* React (Vite)
* Axios
* React Router
* @dnd-kit (drag and drop)

### Backend

* FastAPI
* SQLAlchemy
* JWT Authentication

### Database

* PostgreSQL

### Deployment

* Backend: Railway
* Frontend: Railway / Vercel

---

##  Project Structure

```
taskflow/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── routers/
│   │   └── database.py
│   │   └── schemas.py
│   │   └── dependencies.py
│   │   └── auth.py
│   │   └── __init__.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/
│   │   └── App.jsx
│   │   └── main.jsx
│   └── index.html
│   └── package.json
```

---

## ⚙️ Setup Instructions

### 🔹 Backend Setup

```bash
cd backend
python -m venv myvenv
myvenv\Scripts\activate   # Windows
pip install -r requirements.txt
```

Create `.env` file:

```
DATABASE_URL=your_postgres_url
SECRET_KEY=your_secret
ALGORITHM=HS256
```

Run server:

```bash
uvicorn app.main:app --reload
```

---

### 🔹 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Update API base URL in:

```js
services/api.js
```

---

##  Deployment

### Backend

* Deployed on Railway
* Uses Railway PostgreSQL

### Frontend

* Deployed on Vercel or Railway

---

##  Role-Based Access

| Role   | Permissions                         |
| ------ | ----------------------------------- |
| Admin  | Create/delete tasks, manage members |
| Member | View and update assigned tasks      |

---

##  API Endpoints

### Auth

* POST `/auth/signup`
* POST `/auth/login`

### Projects

* GET `/projects/`
* POST `/projects/`
* POST `/projects/{id}/add-member`

### Tasks

* GET `/tasks/{project_id}`
* POST `/tasks/`
* PUT `/tasks/{task_id}`
* DELETE `/tasks/{task_id}`

### Dashboard

* GET `/dashboard/{project_id}`

---

##  Future Improvements

* Real-time updates (WebSockets)
* Notifications
* File attachments
* Comments on tasks

---

##  Author

Krishna Gupta

---

##  Acknowledgment

This project was built as part of a full-stack development assignment to demonstrate practical skills in building scalable web applications.
