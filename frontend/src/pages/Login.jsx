import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials')
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
          <h1>Manage work,<br />together.</h1>
          <p>A focused workspace for teams who ship. Track tasks, manage projects, hit deadlines.</p>
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
            <h2>Sign in</h2>
            <p>Welcome back — let's get to work.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
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
                placeholder="••••••••"
                value={form.password} onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p className={styles.switchLink}>
            No account? <Link to="/signup">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
