import { Link } from 'react-router-dom'

const roles = [
  {
    tag: 'ADMIN',
    title: 'Security Administrator',
    desc: 'Manage users and roles, upload and manage log sources, review audit trails, and configure platform settings.',
  },
  {
    tag: 'ANALYST',
    title: 'SOC Analyst',
    desc: 'Investigate active alerts, explore raw log data, run AI-assisted triage, and track remediation history.',
  },
  {
    tag: 'VIEWER',
    title: 'Read-Only Viewer',
    desc: 'Monitor triaged alert status and platform-wide threat statistics without write access.',
  },
]

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-950)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--amber)', boxShadow: '0 0 8px var(--amber)',
          }} />
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '13px', color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
            THREATLENS AI
          </span>
        </div>
        <Link to="/login" style={{
          fontFamily: 'IBM Plex Mono',
          fontSize: '11px',
          letterSpacing: '0.1em',
          color: 'var(--amber)',
          border: '1px solid var(--amber-border)',
          padding: '6px 16px',
          background: 'var(--amber-dim)',
          textDecoration: 'none',
        }}>
          SIGN IN
        </Link>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '720px', width: '100%', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: '11px',
            letterSpacing: '0.15em',
            color: 'var(--text-muted)',
            marginBottom: '2rem',
          }}>
            ADVANCED SOFTWARE ENGINEERING / SECURITY OPERATIONS
          </div>

          <h1 style={{
            fontSize: '42px',
            fontWeight: 300,
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '1.25rem',
          }}>
            Intelligent Security Log<br />
            <span style={{ color: 'var(--amber)', fontWeight: 400 }}>Analysis and Alert Triage</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '540px', margin: '0 auto 2.5rem' }}>
            ThreatLens AI ingests system logs, detects anomalies using machine learning,
            and leverages a local LLM to automatically triage alerts, assign severity,
            and recommend remediation steps.
          </p>

          <Link to="/login" style={{
            display: 'inline-block',
            fontFamily: 'IBM Plex Mono',
            fontSize: '12px',
            letterSpacing: '0.1em',
            color: 'var(--navy-950)',
            background: 'var(--amber)',
            padding: '10px 28px',
            textDecoration: 'none',
            fontWeight: 500,
          }}>
            ACCESS PLATFORM
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          marginTop: '5rem',
          maxWidth: '780px',
          width: '100%',
          background: 'var(--border)',
          border: '1px solid var(--border)',
        }}>
          {roles.map((role) => (
            <div key={role.tag} style={{
              background: 'var(--navy-900)',
              padding: '1.5rem',
            }}>
              <div style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: '10px',
                letterSpacing: '0.15em',
                color: 'var(--amber)',
                marginBottom: '0.5rem',
              }}>
                {role.tag}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {role.title}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {role.desc}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          THREATLENS AI
        </span>
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          Advanced Software Engineering
        </span>
      </footer>
    </div>
  )
}
