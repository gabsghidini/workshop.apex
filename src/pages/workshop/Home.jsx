import { useNavigate } from 'react-router-dom'
import { useProgress } from '../../lib/ProgressContext'

const TRACKED = ['mod1', 'mod2', 'mod3', 'mod4', 'mod5', 'mod6']

const MODULES = [
  { id: 'mod1', label: 'Diagnóstico Comercial', tag: 'Módulo 1', dia: 'Dia 1', desc: '8 pontos de vazamento e onde as oportunidades se perdem.' },
  { id: 'mod2', label: 'ICP e Qualificação', tag: 'Módulo 2', dia: 'Dia 1', desc: 'Green flags, red flags e BANT para software houses.' },
  { id: 'mod3', label: 'Oferta e Mecanismo Único', tag: 'Módulo 3', dia: 'Dia 1', desc: 'De "desenvolvimento sob medida" para uma transformação de negócio.' },
  { id: 'mod4', label: 'Demanda, Canais e Ângulos', tag: 'Módulo 4', dia: 'Dia 1', desc: 'Gerar conversas qualificadas sem depender de indicação.' },
  { id: 'mod5', label: 'Operação, CRM e Follow-up', tag: 'Módulo 5', dia: 'Dia 2', desc: 'Pipeline, roteiro de R1, proposta e sequência 8x8.' },
  { id: 'mod6', label: 'Plano de Execução 30 Dias', tag: 'Módulo 6', dia: 'Dia 2', desc: 'Metas semanais, indicadores e diagnóstico de maturidade.' },
]

export default function Home() {
  const navigate = useNavigate()
  const { completedIds, loading } = useProgress()

  const completedCount = TRACKED.filter(id => completedIds.has(id)).length
  const pct = Math.round((completedCount / TRACKED.length) * 100)

  const nextModule = TRACKED.find(id => !completedIds.has(id)) ?? TRACKED[TRACKED.length - 1]

  return (
    <div className="ws-content-area">
      <div className="ws-content-header">
        <div className="ws-content-eyebrow">Workshop APEX</div>
        <h1 className="section-h">Máquina Comercial para <em>Software Houses</em></h1>
        <p className="section-p">
          Imersão de 2 dias para desenhar a primeira versão do sistema comercial — diagnóstico, ICP, oferta, canais, CRM, qualificação e plano de execução.
        </p>
      </div>

      <div className="ws-home-progress">
        <div className="ws-home-progress-info">
          <span className="ws-home-progress-label">{completedCount} de {TRACKED.length} módulos concluídos</span>
          <span className="ws-home-progress-pct">{pct}%</span>
        </div>
        <div className="ws-progress-track" style={{ height: 6, borderRadius: 3 }}>
          <div className="ws-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        {completedCount < TRACKED.length && (
          <button
            className="ws-continue-btn"
            onClick={() => navigate(`/workshop/mod/${nextModule}`)}
          >
            {completedCount === 0 ? 'Começar agora' : 'Continuar de onde parou'} →
          </button>
        )}
        {completedCount === TRACKED.length && (
          <div className="ws-complete-badge">✓ Workshop concluído</div>
        )}
      </div>

      <div className="ws-module-grid">
        {MODULES.map((m, i) => {
          const done = completedIds.has(m.id)
          return (
            <div
              key={m.id}
              className={`ws-module-card dbl ${done ? 'ws-module-done' : ''}`}
              onClick={() => navigate(`/workshop/mod/${m.id}`)}
            >
              <div className="dbl-in ws-module-card-inner">
                <div className="ws-module-card-top">
                  <div className="ws-module-number">{String(i + 1).padStart(2, '0')}</div>
                  {done && <div className="ws-module-check">✓</div>}
                </div>
                {m.dia && <div className="ws-module-dia">{m.dia}</div>}
                <div className="ws-module-tag">{m.tag}</div>
                <div className="ws-module-title">{m.label}</div>
                <p className="ws-module-desc">{m.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
