import { useNavigate } from 'react-router-dom'

const MODULES = [
  { id: 'mod0', label: 'Quem Somos — APEX', tag: 'Aula 0', desc: 'Visão do método, o que é máquina comercial e por que software houses travam.' },
  { id: 'mod1', label: 'Diagnóstico Comercial', tag: 'Dia 1 · Módulo 1', desc: 'Identificar onde as oportunidades estão travando. 8 pontos de vazamento.' },
  { id: 'mod2', label: 'ICP e Qualificação', tag: 'Dia 1 · Módulo 2', desc: 'Definir quem merece entrar na máquina. Green flags, red flags e BANT.' },
  { id: 'mod3', label: 'Oferta e Mecanismo Único', tag: 'Dia 1 · Módulo 3', desc: 'Parar de vender "desenvolvimento sob medida" e vender transformação.' },
  { id: 'mod4', label: 'Demanda, Canais e Ângulos', tag: 'Dia 1 · Módulo 4', desc: 'Gerar conversas qualificadas sem depender de indicação.' },
  { id: 'mod5', label: 'Operação, CRM e Follow-up', tag: 'Dia 2 · Módulo 5', desc: 'Transformar interesse em pipeline com processo e CRM real.' },
  { id: 'mod6', label: 'Plano de Execução 30 Dias', tag: 'Dia 2 · Módulo 6', desc: 'Plano semanal, indicadores mínimos e diagnóstico de maturidade.' },
]

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="ws-content-area">
      <div className="ws-content-header">
        <div className="ws-content-eyebrow">Workshop APEX</div>
        <h1 className="section-h">Máquina Comercial para <em>Software Houses</em></h1>
        <p className="section-p">
          Imersão de 2 dias para desenhar a primeira versão do sistema comercial —
          diagnóstico, ICP, oferta, canais, CRM, qualificação e plano de execução.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {MODULES.map(m => (
          <div key={m.id} className="dbl" style={{ cursor: 'pointer' }} onClick={() => navigate(`/workshop/mod/${m.id}`)}>
            <div className="dbl-in" style={{ padding: '24px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 8 }}>
                {m.tag}
              </div>
              <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>
                {m.label}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 48, padding: '24px', borderRadius: 16, border: '1px solid rgba(255,107,0,0.18)', background: 'rgba(255,107,0,0.03)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: 8 }}>
          Roteiro do Instrutor
        </div>
        <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
          Callouts e Upsell
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
          Scripts de transição entre módulos e apresentação dos programas pagos. Usar ao final do Dia 1 e antes do Módulo 6.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/workshop/mod/callout_dia1')} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)', color: 'var(--orange)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans' }}>
            Callout Dia 1
          </button>
          <button onClick={() => navigate('/workshop/mod/callout_mod6')} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)', color: 'var(--orange)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans' }}>
            Callout Pré-Módulo 6
          </button>
          <button onClick={() => navigate('/workshop/mod/upsell')} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(0,208,132,0.1)', border: '1px solid rgba(0,208,132,0.2)', color: 'var(--green)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans' }}>
            Upsell Final
          </button>
        </div>
      </div>
    </div>
  )
}
