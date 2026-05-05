import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tasksAPI, projectsAPI, dashboardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import KanbanBoard from '../components/KanbanBoard'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import styles from './ProjectPage.module.css'

// ── Task Form Modal ────────────────────────────────────────────────────────────
function TaskModal({ task, projectId, projectName, onClose, onSaved, isAdmin }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleToggleStatus = async (newStatus) => {
    try {
      setLoading(true)
      await tasksAPI.update(task.id, { status: newStatus })
      toast.success('Task status updated!')
      onSaved({ ...task, status: newStatus }, true)
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin && task) {
    const daysLeft = task.due_date ? Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
    const isAssignee = task.assigned_to === user?.id;
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Task Details</h2>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>
          <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
            <div>
              <label className="form-label">Project</label>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{projectName || 'Project'}</div>
            </div>
            <div>
              <label className="form-label">Title</label>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{task.title}</div>
            </div>
            <div>
              <label className="form-label">Description</label>
              <div style={{ fontSize: 14 }}>{task.description || <span style={{ color: 'var(--text-muted)' }}>No description</span>}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Priority</label>
                <div style={{ fontSize: 14 }}>{task.priority}</div>
              </div>
              <div>
                <label className="form-label">Status</label>
                <div style={{ fontSize: 14, textTransform: 'capitalize' }}>{task.status.replace('_', ' ')}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Due Date</label>
                <div style={{ fontSize: 14 }}>{task.due_date || 'None'}</div>
              </div>
              <div>
                <label className="form-label">Time Left</label>
                <div style={{ fontSize: 14, color: daysLeft !== null && daysLeft < 0 ? 'var(--danger)' : 'inherit', fontWeight: 600 }}>
                  {daysLeft === null ? 'N/A' : daysLeft < 0 ? `Overdue by ${Math.abs(daysLeft)} days` : `${daysLeft} days left`}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer" style={{ marginTop: 24, padding: 0, borderTop: 'none', justifyContent: 'flex-end', display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            {isAssignee && task.status !== 'done' && (
              <button className="btn btn-primary" onClick={() => handleToggleStatus('done')} disabled={loading}>
                {loading ? 'Updating…' : 'Mark as Done'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const [form, setForm] = useState(task ? {
    title: task.title || '',
    description: task.description || '',
    due_date: task.due_date ? task.due_date.slice(0, 10) : '',
    priority: task.priority || 'Medium',
    assigned_to_email: '',
    status: task.status || 'todo',
  } : {
    title: '', description: '', due_date: '',
    priority: 'Medium', assigned_to_email: '', status: 'todo',
  })

  const [assignEmailError, setAssignEmailError] = useState('')
  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (e.target.name === 'assigned_to_email') setAssignEmailError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.due_date) return toast.error('Due date is required')
    setAssignEmailError('')
    setLoading(true)
    try {
      let res
      if (task) {
        res = await tasksAPI.update(task.id, form)
        toast.success('Task updated!')
      } else {
        res = await tasksAPI.create({ ...form, project_id: projectId })
        toast.success('Task created!')
      }
      onSaved(res.data, !!task)
    } catch (err) {
      const detail = err.response?.data?.detail || 'Something went wrong'
      // Show user-not-found error inline on the email field
      if (detail.toLowerCase().includes('email') || detail.toLowerCase().includes('user')) {
        setAssignEmailError(detail)
      } else {
        toast.error(detail)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'Create Task'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" type="text" name="title"
              placeholder="Task title" value={form.title} onChange={handleChange} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" name="description"
              placeholder="What needs to be done?" value={form.description} onChange={handleChange} rows={3} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" name="priority" value={form.priority} onChange={handleChange}>
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" name="due_date"
                min={new Date().toISOString().split('T')[0]}
                value={form.due_date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Assign To (email)</label>
              <input className="form-input" type="email" name="assigned_to_email"
                placeholder="User Email" value={form.assigned_to_email} onChange={handleChange}
                style={assignEmailError ? { borderColor: 'var(--danger)' } : undefined} />
              {assignEmailError && (
                <span style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>
                  ⚠ {assignEmailError}
                </span>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Add Member Modal ────────────────────────────────────────────────────────────
function AddMemberModal({ projectId, onClose, onAdded }) {
  const [form, setForm] = useState({ email: '', role: 'Member' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim()) return toast.error('Email is required')
    setLoading(true)
    try {
      await projectsAPI.addMember(projectId, form)
      toast.success('Member added!')
      onAdded()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Member</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">User Email</label>
            <input className="form-input" type="email" placeholder="Enter user email"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding…' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Members List Modal ────────────────────────────────────────────────────────
function MembersListModal({ projectId, onClose }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    projectsAPI.getMembers(projectId)
      .then(res => setMembers(res.data))
      .catch(() => toast.error('Failed to load members'))
      .finally(() => setLoading(false))
  }, [projectId])

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member?')) return
    try {
      await projectsAPI.removeMember(projectId, userId)
      setMembers(prev => prev.filter(m => m.id !== userId))
      toast.success('Member removed')
    } catch (err) {
      toast.error('Failed to remove member')
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2 className="modal-title">Team Members</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ marginTop: 16 }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : members.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No members found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {members.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'var(--surface-color)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-color)' }}>{m.name || m.email}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{m.email} &bull; {m.role}</div>
                  </div>
                  {m.role !== 'Admin' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => handleRemove(m.id)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ marginTop: 24, padding: 0, borderTop: 'none', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── Analytics Panel ────────────────────────────────────────────────────────────
function AnalyticsPanel({ projectId }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.stats(projectId)
      .then(r => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) return <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>Loading analytics…</div>
  if (!stats)  return null

  const statusData = [
    { name: 'To Do',       value: stats.todo        ?? 0, fill: '#8888aa' },
    { name: 'In Progress', value: stats.in_progress ?? 0, fill: '#7c6af7' },
    { name: 'Done',        value: stats.done        ?? 0, fill: '#34d399' },
  ]

  return (
    <div className={styles.analytics}>
      <h3 className={styles.analyticsTitle}>Analytics</h3>

      <div className={styles.analyticsStats}>
        <div className={styles.analyticsStat}>
          <div className={styles.analyticsVal}>{stats.total_tasks ?? 0}</div>
          <div className={styles.analyticsLabel}>Total</div>
        </div>
        <div className={styles.analyticsStat}>
          <div className={styles.analyticsVal} style={{ color: 'var(--danger)' }}>
            {stats.overdue ?? 0}
          </div>
          <div className={styles.analyticsLabel}>Overdue</div>
        </div>
      </div>

      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={statusData} barSize={28} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: '#55556a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#55556a', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#18181f', border: '1px solid #2a2a38', borderRadius: 8, fontSize: 12 }}
              itemStyle={{ color: '#f0f0f8' }}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            <Bar dataKey="value" radius={[4,4,0,0]}>
              {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Main Project Page ─────────────────────────────────────────────────────────
export default function ProjectPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [tasks, setTasks] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showMembersListModal, setShowMembersListModal] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [filter, setFilter] = useState({ priority: '', search: '' })

  const isAdmin = project?.role === 'Admin' || project?.created_by === user?.id

  const loadData = useCallback(async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        tasksAPI.list(projectId),
        projectsAPI.list(),
      ])
      setTasks(tasksRes.data)
      const found = projectsRes.data.find(p => String(p.id) === String(projectId))
      setProject(found || { id: projectId, name: 'Project' })
    } catch (err) {
      toast.error('Failed to load project data')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { loadData() }, [loadData])

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => String(t.id) === String(taskId) ? { ...t, status: newStatus } : t))
    try {
      await tasksAPI.update(taskId, { status: newStatus })
    } catch {
      toast.error('Failed to update task status')
      loadData()
    }
  }

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return
    setTasks(prev => prev.filter(t => t.id !== taskId))
    try {
      await tasksAPI.delete(taskId)
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
      loadData()
    }
  }

  const handleTaskSaved = () => {
    loadData()
    setShowTaskModal(false)
    setEditTask(null)
  }

  const handleEdit = (task) => {
    setEditTask(task)
    setShowTaskModal(true)
  }

  const filteredTasks = tasks.filter(t => {
    if (filter.priority && t.priority !== filter.priority) return false
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })

  const navActions = (
    <div className={styles.navActions}>
      <div className={styles.searchBox}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className={styles.searchInput}
          placeholder="Filter tasks…"
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
        />
      </div>

      <select
        className={`form-input ${styles.priorityFilter}`}
        value={filter.priority}
        onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
      >
        <option value="">All priorities</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <button className={`btn btn-secondary btn-sm`} onClick={() => setShowAnalytics(v => !v)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        Analytics
      </button>

      {isAdmin && (
        <>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowMembersListModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v2a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4v-2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Team Members
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/>
            </svg>
            Add Member
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setShowTaskModal(true) }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Task
          </button>
        </>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar title="Loading…" />
        <div className={styles.loadingCenter}>
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Navbar
        title={project?.name || 'Project'}
        subtitle={`${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
        actions={navActions}
      />

      <main className={styles.main}>
        {showAnalytics && <AnalyticsPanel projectId={projectId} />}

        <KanbanBoard
          tasks={filteredTasks}
          onStatusChange={handleStatusChange}
          onDelete={isAdmin ? handleDelete : null}
          onEdit={handleEdit}
          isAdmin={isAdmin}
        />
      </main>

      {showTaskModal && (
        <TaskModal
          task={editTask}
          projectId={projectId}
          projectName={project?.name}
          isAdmin={isAdmin}
          onClose={() => { setShowTaskModal(false); setEditTask(null) }}
          onSaved={handleTaskSaved}
        />
      )}

      {showMemberModal && (
        <AddMemberModal
          projectId={projectId}
          onClose={() => setShowMemberModal(false)}
          onAdded={() => {}}
        />
      )}

      {showMembersListModal && (
        <MembersListModal
          projectId={projectId}
          onClose={() => setShowMembersListModal(false)}
        />
      )}
    </div>
  )
}
