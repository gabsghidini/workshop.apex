import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres.'); return }
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate('/login')
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
        <h1 className="admin-title">Nova senha</h1>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-field">
            <label className="admin-label">Nova senha</label>
            <input
              className="admin-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Confirmar senha</label>
            <input
              className="admin-input"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          {error && <div className="admin-error">{error}</div>}
          <button className="admin-btn" type="submit" disabled={loading}>
            {loading ? 'Salvando…' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
