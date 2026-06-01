import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
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
  low: { color: '#4ade80', border: 'rgba(74,222,128,0.2)', bg: 'rgba(74,222,128,0.05)' },
  medium: { color: 'var(--amber)', border: 'var(--amber-border)', bg: 'var(--amber-dim)' },
  high: { color: '#fb923c', border: 'rgba(251,146,60,0.2)', bg: 'rgba(251,146,60,0.05)' },
  critical: { color: '#f87171', border: 'rgba(248,113,113,0.25)', bg: 'rgba(248,113,113,0.07)' },
}

const familyStyle = {
  Mirai:     { color: '#f87171', border: 'rgba(248,113,113,0.3)', bg: 'rgba(248,113,113,0.07)' },
  DarkNexus: { color: '#c084fc', border: 'rgba(192,132,252,0.3)', bg: 'rgba(192,132,252,0.07)' },
  Gafgyt:    { color: '#fb923c', border: 'rgba(251,146,60,0.3)',  bg: 'rgba(251,146,60,0.07)'  },
  Generic:   { color: '#94a3b8', border: 'rgba(148,163,184,0.3)', bg: 'rgba(148,163,184,0.07)' },
  Benign:    { color: '#4ade80', border: 'rgba(74,222,128,0.3)',  bg: 'rgba(74,222,128,0.07)'  },
}

function SeverityBadge({ severity }) {
  const s = severityStyle[severity] || {}
  return (
    <span style={{
      fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em',
      padding: '2px 7px', border: `1px solid ${s.border}`, color: s.color, background: s.bg,
    }}>
      {severity?.toUpperCase()}
    </span>
  )
}

function FamilyBadge({ family }) {
  if (!family) return null
  const s = familyStyle[family] || { color: '#94a3b8', border: 'rgba(148,163,184,0.3)', bg: 'rgba(148,163,184,0.07)' }
  return (
    <span style={{
      fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.06em',
      padding: '2px 7px', border: `1px solid ${s.border}`, color: s.color, background: s.bg,
    }}>
      {family.toUpperCase()}
    </span>
  )
}

function ActiveAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { api.get('/analyst/alerts').then((r) => setAlerts(r.data)).finally(() => setLoading(false)) }, [])

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      {sectionHeader('Active Alerts', 'Click any alert to open it in the Triage Console')}
      {loading ? (
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-muted)' }}>LOADING...</p>
      ) : alerts.length === 0 ? (
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-muted)' }}>NO ALERTS FOUND</p>
      ) : (
        <div style={{ border: '1px solid var(--border)', background: 'var(--navy-900)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--navy-800)' }}>
                {['ID', 'SEVERITY', 'FAMILY', 'STATUS', 'MESSAGE', 'TIMESTAMP'].map((h) => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => navigate(`/analyst/triage?alertId=${a.id}`)}
                  style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-soft)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--navy-800)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '8px 14px', fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-muted)' }}>{a.id}</td>
                  <td style={{ padding: '8px 14px' }}><SeverityBadge severity={a.severity} /></td>
                  <td style={{ padding: '8px 14px' }}><FamilyBadge family={a.malware_family} /></td>
                  <td style={{ padding: '8px 14px', fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-muted)' }}>{a.status}</td>
                  <td style={{ padding: '8px 14px', color: 'var(--text-secondary)', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.message}</td>
                  <td style={{ padding: '8px 14px', fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(a.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function LogExplorer() {
  const [logId, setLogId] = useState('')
  const [log, setLog] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function fetchLog(e) {
    e.preventDefault()
    setError('')
    setLog(null)
    setLoading(true)
    try {
      const res = await api.get(`/analyst/logs/${logId}`)
      setLog(res.data)
    } catch {
      setError('LOG NOT FOUND')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      {sectionHeader('Log Explorer', 'Retrieve and inspect raw log content by ID')}
      <form onSubmit={fetchLog} style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
        <input
          type="number"
          value={logId}
          onChange={(e) => setLogId(e.target.value)}
          placeholder="Log ID"
          required
          style={{ width: '100px', background: 'var(--navy-800)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '7px 10px', fontFamily: 'IBM Plex Mono', fontSize: '13px', outline: 'none' }}
        />
        <button type="submit" disabled={loading} style={{
          background: 'var(--navy-800)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
          padding: '7px 16px', fontFamily: 'IBM Plex Mono', fontSize: '11px', letterSpacing: '0.08em', cursor: 'pointer',
        }}>
          {loading ? 'FETCHING...' : 'RETRIEVE'}
        </button>
      </form>
      {error && <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: '#f87171', marginBottom: '1rem' }}>{error}</p>}
      {log && (
        <div style={{ border: '1px solid var(--border)', background: 'var(--navy-900)' }}>
          <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'var(--navy-800)', display: 'flex', gap: '1.5rem' }}>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-muted)' }}>FILE <span style={{ color: 'var(--text-secondary)' }}>{log.filename}</span></span>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-muted)' }}>SOURCE <span style={{ color: 'var(--text-secondary)' }}>{log.source}</span></span>
          </div>
          <pre style={{
            fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-secondary)',
            padding: '1rem', overflow: 'auto', maxHeight: '420px',
            whiteSpace: 'pre-wrap', lineHeight: 1.65, margin: 0,
          }}>
            {log.content}
          </pre>
        </div>
      )}
    </div>
  )
}

function TriageConsole() {
  const [alertId, setAlertId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('alertId')
    if (id) setAlertId(id)
  }, [])

  async function runTriage(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await api.post(`/analyst/alerts/${alertId}/triage`, { notes: '' })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'TRIAGE FAILED')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '680px' }}>
      {sectionHeader('Triage Console', 'Run AI-assisted triage on an alert via local LLM')}
      <form onSubmit={runTriage} style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        <input
          type="number"
          value={alertId}
          onChange={(e) => setAlertId(e.target.value)}
          placeholder="Alert ID"
          required
          style={{ width: '100px', background: 'var(--navy-800)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '7px 10px', fontFamily: 'IBM Plex Mono', fontSize: '13px', outline: 'none' }}
        />
        <button type="submit" disabled={loading} style={{
          background: loading ? 'rgba(232,160,32,0.4)' : 'var(--amber)',
          border: 'none', color: 'var(--navy-950)',
          padding: '7px 20px', fontFamily: 'IBM Plex Mono',
          fontSize: '11px', letterSpacing: '0.1em', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500,
        }}>
          {loading ? 'RUNNING AI TRIAGE...' : 'RUN TRIAGE'}
        </button>
      </form>
      {error && <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: '#f87171', marginBottom: '1rem' }}>{error}</p>}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid var(--border)', background: 'var(--border)' }}>
          <div style={{ background: 'var(--navy-900)', padding: '1rem 1.25rem' }}>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--amber)', marginBottom: '8px' }}>AI ANALYSIS</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.ai_response}</p>
          </div>
          <div style={{ background: 'var(--navy-900)', padding: '1rem 1.25rem' }}>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--amber)', marginBottom: '8px' }}>REMEDIATION</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.remediation}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function TriageHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get('/analyst/triage_history').then((r) => setHistory(r.data)).finally(() => setLoading(false)) }, [])

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      {sectionHeader('Triage History', 'All completed AI triage sessions')}
      {loading ? (
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-muted)' }}>LOADING...</p>
      ) : history.length === 0 ? (
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-muted)' }}>NO TRIAGE HISTORY</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid var(--border)', background: 'var(--border)' }}>
          {history.map((h) => (
            <div key={h.id} style={{ background: 'var(--navy-900)', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-muted)' }}>ALERT #{h.alert_id}</span>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(h.created_at).toLocaleString()}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}><span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>SUMMARY </span>{h.ai_response}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>REMEDIATION </span>{h.remediation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AnalystDashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<ActiveAlerts />} />
        <Route path="/logs" element={<LogExplorer />} />
        <Route path="/triage" element={<TriageConsole />} />
        <Route path="/history" element={<TriageHistory />} />
      </Routes>
    </DashboardLayout>
  )
}
