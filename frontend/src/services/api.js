import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token from localStorage on every request (in case page refreshed)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('taskflow_token')
      localStorage.removeItem('taskflow_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ─────────────────────────────────────────────
export const authAPI = {
  login:  (data) => api.post('/auth/login',  data),
  signup: (data) => api.post('/auth/signup', data),
}

// ── Projects ─────────────────────────────────────────
export const projectsAPI = {
  list:         ()                              => api.get('/projects/'),
  create:       (data)                          => api.post('/projects/', data),
  addMember:    (projectId, data)               => api.post(`/projects/${projectId}/add-member`, data),
  removeMember: (projectId, userId)             => api.delete(`/projects/${projectId}/remove-member/${userId}`),
  getMembers:   (projectId)                     => api.get(`/projects/${projectId}/members`),
}

// ── Tasks ─────────────────────────────────────────────
export const tasksAPI = {
  list:   (projectId) => api.get(`/tasks/${projectId}`),
  create: (data)      => api.post('/tasks/', data),
  update: (taskId, data) => api.put(`/tasks/${taskId}`, data),
  delete: (taskId)    => api.delete(`/tasks/${taskId}`),
}

// ── Dashboard ─────────────────────────────────────────
export const dashboardAPI = {
  stats: (projectId) => api.get(`/dashboard/${projectId}`),
  userDashboard: () => api.get('/dashboard/user/me'),
}

export default api
