import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getAllItems, NAV } from '../../data/navigation'
import { supabase } from '../../lib/supabase'
import { useProgress } from '../../lib/ProgressContext'
import AiCoach from '../../components/AiCoach'

const contentFiles = import.meta.glob('../../content/*.md', { query: '?raw', import: 'default', eager: true })

function buildNavOrder() {
  const order = []
  function walk(nodes) {
    for (const node of nodes) {
      if (node.file) order.push(node)
      if (node.children) walk(node.children)
    }
  }
  walk(NAV)
  return order
}
const NAV_ORDER = buildNavOrder()

export default function MaterialPage() {
  const { modId } = useParams()
  const navigate = useNavigate()
  const { checklistMap, toggleCheck } = useProgress()

  const allItems = getAllItems()
  const item = allItems[modId]
  const [content, setContent] = useState('')
  const [fields, setFields] = useState({})
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  const navIndex = NAV_ORDER.findIndex(n => n.id === modId)
  const prevItem = navIndex > 0 ? NAV_ORDER[navIndex - 1] : null
  const nextItem = navIndex < NAV_ORDER.length - 1 ? NAV_ORDER[navIndex + 1] : null

  // Load content file
  useEffect(() => {
    if (!item) return
    const key = `../../content/${item.file}.md`
    setContent(contentFiles[key] || '# Conteúdo não encontrado')
    window.scrollTo(0, 0)
  }, [modId, item])

  // Load saved field values from Supabase
  useEffect(() => {
    if (!item) return
    setLoading(true)
    setFields({})
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return }
      setUserId(data.user.id)
      const { data: rows } = await supabase
        .from('material_responses')
        .select('item_key, value')
        .eq('user_id', data.user.id)
        .like('item_key', `${modId}:%`)
      if (rows) {
        const map = {}
        rows.forEach(r => {
          const subKey = r.item_key.substring(modId.length + 1)
          map[subKey] = r.value
        })
        setFields(map)
      }
      setLoading(false)
    })
  }, [modId])

  const saveField = useCallback(async (subKey, value) => {
    const uid = userId
    if (!uid) return
    await supabase.from('material_responses').upsert(
      { user_id: uid, item_key: `${modId}:${subKey}`, value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,item_key' }
    )
  }, [modId, userId])

  if (!item) {
    return (
      <div className="ws-content-area">
        <p style={{ color: 'var(--text-muted)' }}>Conteúdo não encontrado.</p>
        <button onClick={() => navigate('/workshop')} style={{ marginTop: 16 }}>← Voltar</button>
      </div>
    )
  }

  // Per-render closure counters — reset each render, incremented by component functions below
  let _tableIdx = -1
  let _rowIdx = -1
  let _colIdx = -1
  let _codeIdx = -1
  let _cbIdx = 0

  return (
    <div className="ws-content-area ws-reveal-wrap">
      <div className="ws-content-header">
        <span className="ws-content-eyebrow material-tag">{item.tag}</span>
        <button className="ws-export-btn" onClick={() => window.print()} title="Exportar PDF">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exportar PDF
        </button>
      </div>

      <article className="ws-markdown">
        {loading ? (
          <div className="ws-material-loading"><div className="ws-spinner" /></div>
        ) : (
          <ReactMarkdown
            key={modId}
            remarkPlugins={[remarkGfm]}
            components={{
              a({ href, children }) {
                if (href?.startsWith('/')) {
                  return (
                    <a href={href} onClick={e => { e.preventDefault(); navigate(href) }}>
                      {children}
                    </a>
                  )
                }
                return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
              },

              table({ children }) {
                _tableIdx++; _rowIdx = -1; _colIdx = -1
                return <table>{children}</table>
              },
              tr({ children }) {
                _rowIdx++; _colIdx = -1
                return <tr>{children}</tr>
              },
              th({ children }) {
                return <th>{children}</th>
              },
              td({ children }) {
                _colIdx++
                const subKey = `td:${_tableIdx}:${_rowIdx}:${_colIdx}`
                const initial = typeof children === 'string' ? children : ''
                return (
                  <td>
                    <input
                      className="ws-material-cell"
                      defaultValue={fields[subKey] ?? initial}
                      onBlur={e => saveField(subKey, e.target.value)}
                      placeholder="—"
                    />
                  </td>
                )
              },

              // Block code → textarea (don't render children, extract raw text from hast node)
              pre({ node }) {
                _codeIdx++
                const subKey = `code:${_codeIdx}`
                const codeNode = node?.children?.[0]
                const rawText = (codeNode?.children?.[0]?.value ?? '').replace(/\n$/, '')
                const saved = fields[subKey]
                const defaultVal = saved !== undefined ? saved : rawText
                const rows = Math.max(3, (defaultVal.split('\n').length || 1) + 1)
                return (
                  <textarea
                    className="ws-material-textarea"
                    defaultValue={defaultVal}
                    rows={rows}
                    onBlur={e => saveField(subKey, e.target.value)}
                    placeholder="Escreva aqui..."
                  />
                )
              },

              // Inline code: keep styled
              code({ children, className }) {
                return <code className={className}>{children}</code>
              },

              input({ type, checked }) {
                if (type !== 'checkbox') return <input type={type} />
                const idx = _cbIdx++
                const cbKey = `${modId}:cb:${idx}`
                const isChecked = checklistMap[cbKey] ?? checked ?? false
                return (
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCheck(cbKey, !isChecked)}
                    className="ws-checkbox"
                  />
                )
              },
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </article>

      <AiCoach item={item} fields={fields} />

      <div className="ws-notes-section">
        <div className="ws-notes-label">Minhas anotações</div>
        <textarea
          className="ws-notes-textarea"
          key={`notes-${modId}`}
          defaultValue={fields['__notes__'] ?? ''}
          onBlur={e => saveField('__notes__', e.target.value)}
          placeholder="Espaço livre para notas, insights e próximos passos..."
          rows={5}
        />
      </div>

      <div className="ws-content-footer">
        <div className="ws-content-nav">
          {prevItem ? (
            <button className="ws-nav-btn ws-nav-btn-prev" onClick={() => navigate(prevItem.path)}>
              ← {prevItem.label}
            </button>
          ) : <div />}
          {nextItem && (
            <button className="ws-nav-btn ws-nav-btn-next" onClick={() => navigate(nextItem.path)}>
              {nextItem.label} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
