import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar({ title, subtitle, actions }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '??'

  return (
    <header className={styles.navbar}>
      <div className={styles.navLeft}>
        <Link to="/dashboard" className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span className={styles.logoName}>TaskFlow</span>
        </Link>

        {title && (
          <>
            <span className={styles.separator}>/</span>
            <div className={styles.pageInfo}>
              <span className={styles.pageTitle}>{title}</span>
              {subtitle && <span className={styles.pageSubtitle}>{subtitle}</span>}
            </div>
          </>
        )}
      </div>

      <div className={styles.navRight}>
        {actions}

        <div className={styles.userMenu}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || user?.email || 'User'}</span>
          </div>
        </div>

        <button className={`btn btn-ghost btn-sm ${styles.logoutBtn}`} onClick={logout} title="Sign out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className={styles.logoutLabel}>Sign out</span>
        </button>
      </div>
    </header>
  )
}
