import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const role = await login(email, password)
      if (role === 'admin') navigate('/admin')
      else if (role === 'analyst') navigate('/analyst')
      else navigate('/viewer')
    } catch {
      setError('Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--navy-800)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    padding: '9px 12px',
    fontSize: '13px',
    fontFamily: 'IBM Plex Sans',
    outline: 'none',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy-950)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '360px', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: 'var(--amber)', boxShadow: '0 0 6px var(--amber)',
            }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '13px', letterSpacing: '0.1em', color: 'var(--text-primary)' }}>
              THREATLENS AI
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono', letterSpacing: '0.05em' }}>
            OPERATOR AUTHENTICATION
          </p>
        </div>

        <div style={{ border: '1px solid var(--border)', background: 'var(--navy-900)' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em', marginLeft: '4px' }}>
              secure_login.sh
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171',
                fontSize: '12px',
                padding: '8px 12px',
                fontFamily: 'IBM Plex Mono',
              }}>
                ERROR: {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'IBM Plex Mono', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                IDENTIFIER
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                placeholder="operator@domain"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'IBM Plex Mono', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                PASSPHRASE
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: '52px', fontFamily: showPassword ? 'IBM Plex Sans' : 'IBM Plex Mono' }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em',
                  }}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.25rem',
                width: '100%',
                background: loading ? 'rgba(232,160,32,0.4)' : 'var(--amber)',
                border: 'none',
                color: 'var(--navy-950)',
                padding: '10px',
                fontFamily: 'IBM Plex Mono',
                fontSize: '12px',
                letterSpacing: '0.1em',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ fontFamily: 'IBM Plex Mono', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em', textDecoration: 'none' }}>
            RETURN TO HOME
          </Link>
        </div>
      </div>
    </div>
  )
}
