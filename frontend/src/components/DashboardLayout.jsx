import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = {
  admin: [
    { label: 'Overview', path: '/admin' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Upload Logs', path: '/admin/logs' },
    { label: 'Audit Log', path: '/admin/audit' },
    { label: 'IoT Classifier', path: '/admin/iot' },
  ],
  analyst: [
    { label: 'Active Alerts', path: '/analyst' },
    { label: 'Log Explorer', path: '/analyst/logs' },
    { label: 'Triage Console', path: '/analyst/triage' },
    { label: 'Triage History', path: '/analyst/history' },
  ],
  viewer: [
    { label: 'Dashboard', path: '/viewer' },
    { label: 'Alerts', path: '/viewer/alerts' },
  ],
}

const roleLabels = {
  admin: 'SECURITY ADMIN',
  analyst: 'SOC ANALYST',
  viewer: 'VIEWER',
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const items = navItems[user?.role] || []

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-950)', display: 'flex' }}>
      <aside style={{
        width: '200px',
        minWidth: '200px',
        background: 'var(--navy-900)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--amber)', boxShadow: '0 0 5px var(--amber)',
            }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--text-primary)' }}>
              THREATLENS
            </span>
          </div>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '9px', letterSpacing: '0.12em', color: 'var(--amber)', paddingLeft: '14px' }}>
            {roleLabels[user?.role]}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px 0' }}>
          {items.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'block',
                  padding: '7px 16px',
                  fontSize: '12px',
                  color: active ? 'var(--amber)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  background: active ? 'var(--amber-dim)' : 'transparent',
                  borderLeft: active ? '2px solid var(--amber)' : '2px solid transparent',
                  transition: 'color 0.15s',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email || ''}
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none', border: '1px solid var(--border)',
              color: 'var(--text-muted)', padding: '5px 10px',
              fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em',
              cursor: 'pointer', width: '100%',
            }}
          >
            SIGN OUT
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
