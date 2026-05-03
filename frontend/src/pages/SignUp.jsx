import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await signup(form.name, form.email, form.password)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authLayout}>
      <div className={styles.authLeft}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>⬡</div>
          <span className={styles.brandName}>TaskFlow</span>
        </div>
        <div className={styles.heroText}>
          <h1>Built for<br />modern teams.</h1>
          <p>Kanban boards, real-time collaboration, and clean analytics — all in one place.</p>
        </div>
        <div className={styles.decorGrid} aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className={styles.decorCell} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>

      <div className={styles.authRight}>
        <div className={styles.authCard}>
          <div className={styles.authCardHeader}>
            <h2>Create account</h2>
            <p>Join your team and start managing tasks.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                className="form-input"
                type="text" name="name"
                placeholder="Jane Smith"
                value={form.name} onChange={handleChange}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email" name="email"
                placeholder="you@company.com"
                value={form.email} onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password" name="password"
                placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Creating account…</> : 'Create account'}
            </button>
          </form>

          <p className={styles.switchLink}>
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
