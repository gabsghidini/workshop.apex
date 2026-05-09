import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate('/workshop')
  }

  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="admin-logo-wrap">
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--blue), var(--blue-deep))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 16, color: '#fff',
          }}>A</div>
          <div>
            <div className="admin-logo-text">APEX Workshop</div>
          </div>
        </div>
        <h1 className="admin-title">Área do Aluno</h1>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-field">
            <label className="admin-label">E-mail</label>
            <input
              className="admin-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="seu@email.com"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Senha</label>
            <input
              className="admin-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          {error && <div className="admin-error">{error}</div>}
          <button className="admin-btn" type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <div className="admin-links">
          <Link to="/forgot" className="admin-link">Esqueci minha senha</Link>
        </div>
      </div>
    </div>
  )
}
