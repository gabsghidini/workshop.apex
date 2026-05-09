import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
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
          <div className="admin-logo-text">APEX Workshop</div>
        </div>
        <h1 className="admin-title">Recuperar senha</h1>
        {sent ? (
          <div className="admin-success">
            E-mail enviado. Verifique sua caixa de entrada.
          </div>
        ) : (
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-field">
              <label className="admin-label">E-mail cadastrado</label>
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
            {error && <div className="admin-error">{error}</div>}
            <button className="admin-btn" type="submit" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar link de recuperação'}
            </button>
          </form>
        )}
        <div className="admin-links">
          <Link to="/login" className="admin-link">← Voltar ao login</Link>
        </div>
      </div>
    </div>
  )
}
