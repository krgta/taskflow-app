# TaskFlow — Team Task Management Frontend

A production-ready React frontend for team task management, built with Vite, React Router, dnd-kit, and Recharts.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit VITE_API_URL to point to your FastAPI backend

# 3. Start dev server
npm run dev
```

Open http://localhost:5173

## Stack

- **React 18** + **Vite**
- **React Router v6** — routing & protected routes
- **Axios** — API calls with automatic token attachment
- **@dnd-kit** — drag & drop Kanban
- **Recharts** — analytics charts
- **react-hot-toast** — toast notifications
- **CSS Modules** — scoped styling

## Project Structure

```
src/
├── pages/
│   ├── Login.jsx          # Auth page
│   ├── Signup.jsx         # Registration
│   ├── Dashboard.jsx      # Projects list + create
│   └── ProjectPage.jsx    # Kanban board + task CRUD
├── components/
│   ├── Navbar.jsx         # Persistent top nav
│   ├── TaskCard.jsx       # Sortable task card
│   └── KanbanBoard.jsx    # dnd-kit board
├── services/
│   └── api.js             # Axios instance + all API calls
├── context/
│   └── AuthContext.jsx    # JWT auth state
├── App.jsx                # Routes + protected routes
├── main.jsx               # Entry point
└── index.css              # Global design tokens + utility classes
```

## Features

- ✅ JWT auth with localStorage persistence
- ✅ Protected & public routes
- ✅ Dashboard with project cards + stats
- ✅ Create/list projects
- ✅ Full Kanban board (To Do / In Progress / Done)
- ✅ Drag & drop task status update via dnd-kit
- ✅ Create / edit / delete tasks (admin only)
- ✅ Priority color coding (High/Medium/Low)
- ✅ Due date with overdue highlighting
- ✅ Add/remove project members (admin only)
- ✅ Analytics panel with Recharts bar chart
- ✅ Task search & priority filtering
- ✅ Loading skeletons & toast error handling
- ✅ Responsive design

## API Integration

All endpoints map to `http://localhost:8000` (configurable via `VITE_API_URL`):

| Feature | Method | Endpoint |
|---------|--------|----------|
| Login | POST | `/auth/login` |
| Signup | POST | `/auth/signup` |
| List projects | GET | `/projects/` |
| Create project | POST | `/projects/` |
| Add member | POST | `/projects/{id}/add-member` |
| Remove member | DELETE | `/projects/{id}/remove-member/{userId}` |
| List tasks | GET | `/tasks/{projectId}` |
| Create task | POST | `/tasks/` |
| Update task | PUT | `/tasks/{taskId}` |
| Delete task | DELETE | `/tasks/{taskId}` |
| Dashboard stats | GET | `/dashboard/{projectId}` |

## Build for Production

```bash
npm run build
# Output in dist/
```
