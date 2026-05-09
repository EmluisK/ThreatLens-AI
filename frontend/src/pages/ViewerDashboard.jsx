import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import api from '../services/api'

const sectionHeader = (title, subtitle) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
      <div style={{ width: '3px', height: '16px', background: 'var(--amber)' }} />
      <h1 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{title}</h1>
    </div>
    {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '13px' }}>{subtitle}</p>}
  </div>
)

const severityStyle = {
  low: { color: '#4ade80', border: 'rgba(74,222,128,0.2)' },
  medium: { color: 'var(--amber)', border: 'var(--amber-border)' },
  high: { color: '#fb923c', border: 'rgba(251,146,60,0.2)' },
  critical: { color: '#f87171', border: 'rgba(248,113,113,0.25)' },
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{ border: '1px solid var(--border)', background: 'var(--navy-900)', padding: '1rem 1.25rem' }}>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 300, color: accent || 'var(--text-primary)', fontFamily: 'IBM Plex Mono' }}>{value ?? '--'}</div>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState(null)
  useEffect(() => { api.get('/viewer/dashboard').then((r) => setStats(r.data)).catch(() => {}) }, [])

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      {sectionHeader('Security Dashboard', 'Platform-wide alert status summary')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)' }}>
        <StatCard label="TOTAL" value={stats?.total_alerts} />
        <StatCard label="OPEN" value={stats?.open} accent="#60a5fa" />
        <StatCard label="TRIAGED" value={stats?.triaged} accent="var(--amber)" />
        <StatCard label="RESOLVED" value={stats?.resolved} accent="#4ade80" />
      </div>
    </div>
  )
}

function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get('/viewer/alerts').then((r) => setAlerts(r.data)).finally(() => setLoading(false)) }, [])

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      {sectionHeader('Alerts', 'Triaged and resolved alerts visible to this role')}
      {loading ? (
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-muted)' }}>LOADING...</p>
      ) : alerts.length === 0 ? (
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-muted)' }}>NO TRIAGED ALERTS YET</p>
      ) : (
        <div style={{ border: '1px solid var(--border)', background: 'var(--navy-900)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--navy-800)' }}>
                {['ID', 'SEVERITY', 'STATUS', 'MESSAGE', 'TIMESTAMP'].map((h) => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => {
                const s = severityStyle[a.severity] || {}
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: '8px 14px', fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-muted)' }}>{a.id}</td>
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em', padding: '2px 7px', border: `1px solid ${s.border}`, color: s.color }}>{a.severity?.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '8px 14px', fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-muted)' }}>{a.status}</td>
                    <td style={{ padding: '8px 14px', color: 'var(--text-secondary)', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.message}</td>
                    <td style={{ padding: '8px 14px', fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(a.created_at).toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function ViewerDashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
      </Routes>
    </DashboardLayout>
  )
}
