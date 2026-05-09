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
    if (err) { setError('E-mail ou senha inválidos.'); return }
    navigate('/workshop')
  }

  return (
    <div className="login-shell">
      <div className="login-hero">
        <div className="login-hero-inner">
          <div className="login-brand">
            <img src="/apex-logo.png" alt="APEX" width={36} height={36} style={{ objectFit: 'contain' }} />
            <span className="login-brand-text">APEX</span>
          </div>

          <div className="login-hero-content">
            <div className="login-eyebrow">Workshop · 2 dias de imersão</div>
            <h1 className="login-hero-title">
              Máquina Comercial para<br />
              <em>Software Houses</em>
            </h1>
            <p className="login-hero-desc">
              Do diagnóstico ao plano de execução — construa o sistema comercial da sua empresa em um fim de semana.
            </p>

            <div className="login-pillars">
              {[
                { n: '6', label: 'Módulos' },
                { n: '18', label: 'Materiais' },
                { n: '30', label: 'Dias de plano' },
              ].map(p => (
                <div key={p.n} className="login-pillar">
                  <div className="login-pillar-n">{p.n}</div>
                  <div className="login-pillar-label">{p.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="login-hero-footer">
            APEX Inteligência Comercial
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card dbl">
          <div className="dbl-in login-card-inner">
            <div className="login-card-eyebrow">Área do Aluno</div>
            <h2 className="login-card-title">Bem-vindo de volta</h2>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label">E-mail</label>
                <input
                  className="login-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                />
              </div>
              <div className="login-field">
                <label className="login-label">Senha</label>
                <input
                  className="login-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>

              {error && <div className="login-error">{error}</div>}

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? (
                  <span className="ws-export-spinner" />
                ) : (
                  <span className="login-btn-arrow">→</span>
                )}
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </form>

            <div className="login-footer-link">
              <Link to="/forgot" className="admin-link">Esqueci minha senha</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
