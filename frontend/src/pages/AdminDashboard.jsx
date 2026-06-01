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

function StatCard({ label, value, accent }) {
  return (
    <div style={{ border: '1px solid var(--border)', background: 'var(--navy-900)', padding: '1rem 1.25rem' }}>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 300, color: accent || 'var(--text-primary)', fontFamily: 'IBM Plex Mono' }}>{value ?? '--'}</div>
    </div>
  )
}

function TableWrap({ children }) {
  return (
    <div style={{ border: '1px solid var(--border)', background: 'var(--navy-900)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        {children}
      </table>
    </div>
  )
}

function Th({ children }) {
  return (
    <th style={{
      padding: '8px 14px', textAlign: 'left',
      fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em',
      color: 'var(--text-muted)', borderBottom: '1px solid var(--border)',
      fontWeight: 400, background: 'var(--navy-800)',
    }}>{children}</th>
  )
}

function Td({ children, mono, style: s }) {
  return (
    <td style={{
      padding: '8px 14px', color: 'var(--text-secondary)',
      fontFamily: mono ? 'IBM Plex Mono' : 'IBM Plex Sans',
      fontSize: mono ? '12px' : '13px', borderBottom: '1px solid var(--border-soft)',
      ...s,
    }}>{children}</td>
  )
}

function Overview() {
  const [stats, setStats] = useState(null)
  useEffect(() => { api.get('/viewer/dashboard').then((r) => setStats(r.data)).catch(() => {}) }, [])

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      {sectionHeader('Platform Overview', 'Alert distribution across all ingested log sources')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)' }}>
        <StatCard label="TOTAL ALERTS" value={stats?.total_alerts} />
        <StatCard label="OPEN" value={stats?.open} accent="#60a5fa" />
        <StatCard label="TRIAGED" value={stats?.triaged} accent="var(--amber)" />
        <StatCard label="RESOLVED" value={stats?.resolved} accent="#4ade80" />
      </div>
    </div>
  )
}

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('viewer')
  const [createStatus, setCreateStatus] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => { api.get('/admin/users').then((r) => setUsers(r.data)).finally(() => setLoading(false)) }, [])

  async function deleteUser(id) {
    if (!confirm('Delete this user?')) return
    await api.delete(`/admin/users/${id}`)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  async function createUser(e) {
    e.preventDefault()
    setCreateStatus('')
    setCreating(true)
    try {
      await api.post('/auth/register', { email: newEmail, password: newPassword, role: newRole })
      setCreateStatus(`OK — ${newEmail} created.`)
      setNewEmail('')
      setNewPassword('')
      setNewRole('viewer')
      const res = await api.get('/admin/users')
      setUsers(res.data)
    } catch (err) {
      setCreateStatus(`ERROR — ${err.response?.data?.detail || 'Failed.'}`)
    } finally {
      setCreating(false)
    }
  }

  const inputStyle = {
    background: 'var(--navy-800)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', padding: '7px 10px',
    fontSize: '12px', fontFamily: 'IBM Plex Sans', outline: 'none',
  }

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      {sectionHeader('User Management', 'Registered operators and their assigned roles')}

      <form onSubmit={createUser} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '5px' }}>EMAIL</div>
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required style={{ ...inputStyle, width: '200px' }} placeholder="user@domain" />
        </div>
        <div>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '5px' }}>PASSWORD</div>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ ...inputStyle, width: '140px' }} placeholder="••••••••" />
        </div>
        <div>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '5px' }}>ROLE</div>
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ ...inputStyle, width: '110px', cursor: 'pointer' }}>
            <option value="viewer">viewer</option>
            <option value="analyst">analyst</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <button type="submit" disabled={creating} style={{
          background: 'var(--amber)', border: 'none', color: 'var(--navy-950)',
          padding: '7px 16px', fontFamily: 'IBM Plex Mono', fontSize: '11px',
          letterSpacing: '0.08em', cursor: creating ? 'not-allowed' : 'pointer', fontWeight: 500,
        }}>
          {creating ? 'CREATING...' : 'CREATE USER'}
        </button>
        {createStatus && (
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: createStatus.startsWith('OK') ? '#4ade80' : '#f87171', alignSelf: 'center' }}>
            {createStatus}
          </span>
        )}
      </form>

      {loading ? (
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-muted)' }}>LOADING...</p>
      ) : (
        <TableWrap>
          <thead><tr><Th>EMAIL</Th><Th>ROLE</Th><Th>REGISTERED</Th><Th></Th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <Td mono>{u.email}</Td>
                <Td>
                  <span style={{
                    fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em',
                    padding: '2px 8px', border: '1px solid var(--border)',
                    color: u.role === 'admin' ? 'var(--amber)' : 'var(--text-muted)',
                  }}>{u.role.toUpperCase()}</span>
                </Td>
                <Td mono>{new Date(u.created_at).toLocaleDateString()}</Td>
                <Td>
                  <button onClick={() => deleteUser(u.id)} style={{
                    background: 'none', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#f87171', fontFamily: 'IBM Plex Mono', fontSize: '10px',
                    letterSpacing: '0.05em', padding: '2px 8px', cursor: 'pointer',
                  }}>REMOVE</button>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  )
}

function UploadLogs() {
  const [file, setFile] = useState(null)
  const [source, setSource] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleUpload(e) {
    e.preventDefault()
    if (!file || !source) return
    setLoading(true)
    setStatus('')
    const form = new FormData()
    form.append('file', file)
    form.append('source', source)
    try {
      const res = await api.post('/admin/upload_logs', form)
      setStatus(`OK — Log ID ${res.data.log_id} ingested.`)
      setFile(null)
      setSource('')
    } catch (err) {
      setStatus(`ERROR — ${err.response?.data?.detail || 'Upload failed.'}`)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', background: 'var(--navy-800)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', padding: '8px 12px',
    fontSize: '13px', fontFamily: 'IBM Plex Sans', outline: 'none',
  }

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '480px' }}>
      {sectionHeader('Ingest Log File', 'Upload a plaintext log file for anomaly analysis')}
      <form onSubmit={handleUpload} style={{ border: '1px solid var(--border)', background: 'var(--navy-900)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px' }}>SOURCE</label>
          <input type="text" value={source} onChange={(e) => setSource(e.target.value)} style={inputStyle} placeholder="nginx / syslog / firewall" required />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px' }}>FILE (.txt / .log)</label>
          <input type="file" accept=".txt,.log" onChange={(e) => setFile(e.target.files[0])} style={{ ...inputStyle, padding: '7px 12px' }} required />
        </div>
        {status && (
          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: status.startsWith('OK') ? '#4ade80' : '#f87171' }}>{status}</p>
        )}
        <button type="submit" disabled={loading} style={{
          background: loading ? 'rgba(232,160,32,0.4)' : 'var(--amber)', border: 'none',
          color: 'var(--navy-950)', padding: '9px', fontFamily: 'IBM Plex Mono',
          fontSize: '11px', letterSpacing: '0.1em', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500,
        }}>
          {loading ? 'INGESTING...' : 'INGEST LOG'}
        </button>
      </form>
    </div>
  )
}

const severityStyle = {
  low: { color: '#4ade80', border: 'rgba(74,222,128,0.2)' },
  medium: { color: 'var(--amber)', border: 'var(--amber-border)' },
  high: { color: '#fb923c', border: 'rgba(251,146,60,0.2)' },
  critical: { color: '#f87171', border: 'rgba(248,113,113,0.2)' },
}

const familyStyle = {
  Mirai:     { color: '#f87171', border: 'rgba(248,113,113,0.3)' },
  DarkNexus: { color: '#c084fc', border: 'rgba(192,132,252,0.3)' },
  Gafgyt:    { color: '#fb923c', border: 'rgba(251,146,60,0.3)'  },
  Generic:   { color: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
  Benign:    { color: '#4ade80', border: 'rgba(74,222,128,0.3)'  },
}

function FamilyBadge({ family }) {
  if (!family) return null
  const s = familyStyle[family] || { color: '#94a3b8', border: 'rgba(148,163,184,0.3)' }
  return (
    <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.06em', padding: '2px 7px', border: `1px solid ${s.border}`, color: s.color }}>
      {family.toUpperCase()}
    </span>
  )
}

function AuditLog() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get('/admin/audit').then((r) => setAlerts(r.data)).finally(() => setLoading(false)) }, [])

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      {sectionHeader('Audit Log', 'All platform alerts ordered by creation time')}
      {loading ? (
        <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: 'var(--text-muted)' }}>LOADING...</p>
      ) : (
        <TableWrap>
          <thead><tr><Th>ID</Th><Th>SEVERITY</Th><Th>FAMILY</Th><Th>STATUS</Th><Th>MESSAGE</Th><Th>TIMESTAMP</Th></tr></thead>
          <tbody>
            {alerts.map((a) => {
              const s = severityStyle[a.severity] || {}
              return (
                <tr key={a.id}>
                  <Td mono style={{ color: 'var(--text-muted)' }}>{a.id}</Td>
                  <Td>
                    <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em', padding: '2px 7px', border: `1px solid ${s.border}`, color: s.color }}>{a.severity.toUpperCase()}</span>
                  </Td>
                  <Td><FamilyBadge family={a.malware_family} /></Td>
                  <Td mono style={{ color: 'var(--text-muted)' }}>{a.status}</Td>
                  <Td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.message}</Td>
                  <Td mono style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{new Date(a.created_at).toLocaleString()}</Td>
                </tr>
              )
            })}
          </tbody>
        </TableWrap>
      )}
    </div>
  )
}

function IoTClassifier() {
  const [status, setStatus] = useState(null)
  const [result, setResult] = useState(null)
  const [payload, setPayload] = useState('{\n  "hash": "abc123",\n  "arch": "arm",\n  "features": {\n    "strace_Call_connect": 12500,\n    "strace_Call_send": 8200,\n    "pcap_Rate_mean": 950.0\n  }\n}')
  const [submitting, setSubmitting] = useState(false)
  const [parseError, setParseError] = useState('')

  useEffect(() => {
    api.get('/ingest/iot/status').then((r) => setStatus(r.data)).catch(() => setStatus({ model_ready: false, message: 'Could not reach backend.' }))
  }, [])

  async function submitSample(e) {
    e.preventDefault()
    setParseError('')
    setResult(null)
    let parsed
    try { parsed = JSON.parse(payload) } catch { setParseError('Invalid JSON'); return }
    setSubmitting(true)
    try {
      const res = await api.post('/ingest/iot', parsed)
      setResult(res.data)
    } catch (err) {
      setParseError(err.response?.data?.detail || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const probColors = { Mirai: '#f87171', DarkNexus: '#c084fc', Gafgyt: '#fb923c', Generic: '#94a3b8', Benign: '#4ade80' }

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '640px' }}>
      {sectionHeader('IoT Malware Classifier', 'Submit behavioural feature vectors for LightGBM family classification')}

      <div style={{ border: '1px solid var(--border)', background: 'var(--navy-900)', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status?.model_ready ? '#4ade80' : '#f87171', boxShadow: status?.model_ready ? '0 0 6px #4ade80' : '0 0 6px #f87171', flexShrink: 0 }} />
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: 'var(--text-secondary)' }}>
          {status ? status.message : 'Checking model status...'}
        </span>
      </div>

      <form onSubmit={submitSample} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '6px' }}>FEATURE PAYLOAD (JSON)</div>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            rows={10}
            style={{ width: '100%', background: 'var(--navy-800)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 12px', fontFamily: 'IBM Plex Mono', fontSize: '12px', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
          />
        </div>
        {parseError && <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', color: '#f87171' }}>{parseError}</p>}
        <button type="submit" disabled={submitting} style={{ background: submitting ? 'rgba(232,160,32,0.4)' : 'var(--amber)', border: 'none', color: 'var(--navy-950)', padding: '9px', fontFamily: 'IBM Plex Mono', fontSize: '11px', letterSpacing: '0.1em', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 500 }}>
          {submitting ? 'CLASSIFYING...' : 'SUBMIT SAMPLE'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '1.25rem', border: '1px solid var(--border)', background: 'var(--navy-900)' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--navy-800)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              ALERT <span style={{ color: 'var(--text-secondary)' }}>#{result.alert_id}</span>
            </span>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              FAMILY <span style={{ color: probColors[result.family] || 'var(--text-secondary)' }}>{result.family?.toUpperCase()}</span>
            </span>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              CONFIDENCE <span style={{ color: 'var(--text-secondary)' }}>{(result.confidence * 100).toFixed(1)}%</span>
            </span>
          </div>
          {result.probabilities && (
            <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(result.probabilities).sort((a, b) => b[1] - a[1]).map(([fam, prob]) => (
                <div key={fam} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: probColors[fam] || 'var(--text-muted)', width: '80px' }}>{fam}</span>
                  <div style={{ flex: 1, height: '4px', background: 'var(--navy-800)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${(prob * 100).toFixed(1)}%`, height: '100%', background: probColors[fam] || 'var(--text-muted)', transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-muted)', width: '42px', textAlign: 'right' }}>{(prob * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/users" element={<Users />} />
        <Route path="/logs" element={<UploadLogs />} />
        <Route path="/audit" element={<AuditLog />} />
        <Route path="/iot" element={<IoTClassifier />} />
      </Routes>
    </DashboardLayout>
  )
}
