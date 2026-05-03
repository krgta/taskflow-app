import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsAPI, dashboardAPI } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import styles from './Dashboard.module.css'

function ProjectCard({ project, onSelect }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    dashboardAPI.stats(project.id)
      .then(r => { if (!cancelled) setStats(r.data) })
      .catch(() => {}) // stats are optional — don't crash if endpoint missing
    return () => { cancelled = true }
  }, [project.id])

  return (
    <div className={styles.projectCard} onClick={() => onSelect(project.id)}>
      <div className={styles.projectCardHeader}>
        <div className={styles.projectIcon}>
          {(project.name || '??').slice(0, 2).toUpperCase()}
        </div>
        <div className={styles.projectMeta}>
          <h3 className={styles.projectName}>{project.name || 'Untitled'}</h3>
          <span className={styles.projectRole}>
            {project.role || project.user_role || 'Member'}
          </span>
        </div>
      </div>

      {stats && (
        <div className={styles.projectStats}>
          <div className={styles.projectStat}>
            <span className={styles.projectStatVal}>{stats.total_tasks ?? '–'}</span>
            <span>Total</span>
          </div>
          <div className={styles.projectStat}>
            <span className={styles.projectStatVal} style={{ color: 'var(--accent)' }}>
              {stats.in_progress ?? '–'}
            </span>
            <span>Active</span>
          </div>
          <div className={styles.projectStat}>
            <span className={styles.projectStatVal} style={{ color: 'var(--success)' }}>
              {stats.done ?? '–'}
            </span>
            <span>Done</span>
          </div>
          {stats.overdue > 0 && (
            <div className={styles.projectStat}>
              <span className={styles.projectStatVal} style={{ color: 'var(--danger)' }}>
                {stats.overdue}
              </span>
              <span>Overdue</span>
            </div>
          )}
        </div>
      )}

      {stats && stats.total_tasks > 0 && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.round(((stats.done ?? 0) / stats.total_tasks) * 100)}%` }}
          />
        </div>
      )}

      <div className={styles.projectCardArrow}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  )
}

function CreateProjectModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Project name is required')
    setLoading(true)
    try {
      await projectsAPI.create({ name: name.trim() })
      toast.success('Project created!')
      onCreated()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Project</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Project name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Website Redesign"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Creating…</> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const PRIORITY_CONFIG = {
  High:   { label: 'High',   class: 'high',   dot: '#f87171' },
  Medium: { label: 'Medium', class: 'medium', dot: '#fbbf24' },
  Low:    { label: 'Low',    class: 'low',     dot: '#34d399' },
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const isOverdue = d < now
  return {
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isOverdue,
  }
}

function DashboardTaskRow({ task, onSelect }) {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Low
  const dueDate = formatDate(task.due_date)

  return (
    <div className={styles.taskRow} onClick={() => onSelect(task.project_id)}>
      <div className={styles.taskRowMain}>
        <div className={styles.taskRowTitle}>{task.title}</div>
        {task.description && <div className={styles.taskRowDesc}>{task.description}</div>}
      </div>
      <div className={styles.taskRowMeta}>
        <div className={styles.taskProjectBadge}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          {task.project_name}
        </div>
        {dueDate && (
          <span className={`${styles.taskDueDate} ${dueDate.isOverdue ? styles.overdue : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {dueDate.label}
          </span>
        )}
        <span className={`badge ${priority.class}`}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: priority.dot, display: 'inline-block' }} />
          {priority.label}
        </span>
        <span className={styles.taskStatus}>{task.status.replace('_', ' ')}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState({ created_projects: [], assigned_projects: [], tasks: [] })
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const loadDashboard = useCallback(async () => {
    try {
      const res = await dashboardAPI.userDashboard()
      setData(res.data)
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const handleProjectCreated = () => {
    setShowCreate(false)
    loadDashboard()
  }

  const actions = (
    <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      New Project
    </button>
  )

  return (
    <div className={styles.page}>
      <Navbar title="Dashboard" actions={actions} />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.heading}>Your Projects</h1>
            <p className={styles.subheading}>Select a project to view its Kanban board and tasks.</p>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingGrid}>
            {[1,2,3].map(i => <div key={i} className={styles.skeletonCard} />)}
          </div>
        ) : (
          <>
            {data.created_projects.length > 0 && (
              <>
                <h2 className={styles.sectionTitle}>Projects I'm Leading</h2>
                <div className={styles.projectsGrid}>
                  {data.created_projects.map((p, i) => (
                    <div key={p.id} style={{ animationDelay: `${i * 0.05}s` }} className="fade-in">
                      <ProjectCard project={p} onSelect={(id) => navigate(`/project/${id}`)} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {data.assigned_projects.length > 0 && (
              <>
                <h2 className={styles.sectionTitle}>Projects I'm a Member Of</h2>
                <div className={styles.projectsGrid}>
                  {data.assigned_projects.map((p, i) => (
                    <div key={p.id} style={{ animationDelay: `${i * 0.05}s` }} className="fade-in">
                      <ProjectCard project={{...p, role: 'Member'}} onSelect={(id) => navigate(`/project/${id}`)} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {data.created_projects.length === 0 && data.assigned_projects.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📂</div>
                <h3>No projects yet</h3>
                <p>Create your first project to get started with task management.</p>
                <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setShowCreate(true)}>
                  Create your first project
                </button>
              </div>
            )}

            {data.tasks.length > 0 && (
              <>
                <h2 className={styles.sectionTitle}>My Tasks</h2>
                <div className={styles.tasksList}>
                  {data.tasks.map((t, i) => (
                    <div key={t.id} style={{ animationDelay: `${i * 0.05}s` }} className="fade-in">
                      <DashboardTaskRow task={t} onSelect={(projectId) => navigate(`/project/${projectId}`)} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  )
}
