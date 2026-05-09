import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getAllItems, NAV } from '../../data/navigation'
import { supabase } from '../../lib/supabase'
import { useProgress } from '../../lib/ProgressContext'
import AiCoach from '../../components/AiCoach'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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
  const [exporting, setExporting] = useState(false)
  const [saved, setSaved] = useState(false)
  const saveTimerRef = useRef(null)

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
    setSaved(true)
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => setSaved(false), 2000)
  }, [modId, userId])

  if (!item) {
    return (
      <div className="ws-content-area">
        <p style={{ color: 'var(--text-muted)' }}>Conteúdo não encontrado.</p>
        <button onClick={() => navigate('/workshop')} style={{ marginTop: 16 }}>← Voltar</button>
      </div>
    )
  }

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)

    const articleEl = document.querySelector('.ws-markdown')
    const notesEl = document.querySelector('.ws-notes-textarea')
    if (!articleEl) { setExporting(false); return }

    // Build a self-contained light-theme container off-screen
    const container = document.createElement('div')
    Object.assign(container.style, {
      position: 'absolute', left: '-9999px', top: '0',
      width: '780px', padding: '52px 60px 60px',
      background: '#ffffff', color: '#111',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontSize: '14px', lineHeight: '1.7', boxSizing: 'border-box',
    })

    // Header
    const header = document.createElement('div')
    header.style.cssText = 'margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #e5e7eb;'
    header.innerHTML = `
      <div style="display:inline-block;padding:4px 13px;border-radius:100px;background:#edf2ff;color:#1a5fd9;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:10px;">${item.tag}</div>
      <div style="font-size:22px;font-weight:700;color:#0a0a0a;letter-spacing:-0.025em;line-height:1.2;">${item.label}</div>
    `
    container.appendChild(header)

    // Clone article, apply inline light styles, replace inputs/textareas
    const clone = articleEl.cloneNode(true)
    clone.style.cssText = 'color:#111;'

    const liveInputs = Array.from(articleEl.querySelectorAll('input.ws-material-cell'))
    clone.querySelectorAll('input.ws-material-cell').forEach((inp, i) => {
      const val = liveInputs[i]?.value ?? ''
      const span = document.createElement('span')
      span.textContent = val
      span.style.cssText = 'display:inline-block;border-bottom:1.5px solid #999;min-width:52px;padding:1px 2px;color:#111;font-size:13px;vertical-align:bottom;'
      inp.replaceWith(span)
    })

    const liveTAs = Array.from(articleEl.querySelectorAll('textarea.ws-material-textarea'))
    clone.querySelectorAll('textarea.ws-material-textarea').forEach((ta, i) => {
      const val = liveTAs[i]?.value ?? ''
      const div = document.createElement('div')
      div.textContent = val
      div.style.cssText = 'background:#f8f9fb;border:1px solid #e2e5ea;border-radius:6px;padding:11px 14px;color:#111;white-space:pre-wrap;font-family:inherit;font-size:13px;line-height:1.65;margin:6px 0;'
      ta.replaceWith(div)
    })

    // Apply light styles to markdown elements
    clone.querySelectorAll('h1').forEach(el => Object.assign(el.style, { fontSize: '20px', fontWeight: '700', color: '#0a0a0a', margin: '24px 0 10px' }))
    clone.querySelectorAll('h2').forEach(el => Object.assign(el.style, { fontSize: '16px', fontWeight: '700', color: '#0a0a0a', margin: '20px 0 8px' }))
    clone.querySelectorAll('h3').forEach(el => Object.assign(el.style, { fontSize: '14px', fontWeight: '600', color: '#222', margin: '16px 0 6px' }))
    clone.querySelectorAll('p').forEach(el => Object.assign(el.style, { color: '#333', marginBottom: '12px' }))
    clone.querySelectorAll('li').forEach(el => Object.assign(el.style, { color: '#333', marginBottom: '4px' }))
    clone.querySelectorAll('strong').forEach(el => Object.assign(el.style, { color: '#0a0a0a', fontWeight: '700' }))
    clone.querySelectorAll('hr').forEach(el => Object.assign(el.style, { border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }))
    clone.querySelectorAll('code').forEach(el => Object.assign(el.style, { background: '#f0f0f0', color: '#222', border: '1px solid #e0e0e0', borderRadius: '3px', padding: '1px 5px', fontSize: '12px' }))
    clone.querySelectorAll('blockquote').forEach(el => Object.assign(el.style, { borderLeft: '3px solid #1a6eff', background: '#f0f5ff', padding: '10px 16px', margin: '12px 0', borderRadius: '0 6px 6px 0' }))
    clone.querySelectorAll('table').forEach(el => Object.assign(el.style, { width: '100%', borderCollapse: 'collapse', margin: '14px 0', fontSize: '13px' }))
    clone.querySelectorAll('th').forEach(el => Object.assign(el.style, { background: '#f0f2f5', color: '#111', border: '1px solid #ccc', padding: '7px 10px', textAlign: 'left', fontWeight: '600' }))
    clone.querySelectorAll('td').forEach(el => Object.assign(el.style, { border: '1px solid #ddd', padding: '6px 8px', background: '#fff', verticalAlign: 'top' }))

    container.appendChild(clone)

    // Notes section
    if (notesEl?.value?.trim()) {
      const notesDiv = document.createElement('div')
      notesDiv.style.cssText = 'margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;'
      notesDiv.innerHTML = `
        <div style="font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#666;margin-bottom:10px;">Minhas anotações</div>
        <div style="background:#f8f9fb;border:1px solid #e2e5ea;border-radius:6px;padding:14px 16px;color:#111;white-space:pre-wrap;font-size:13px;line-height:1.65;">${notesEl.value.replace(/</g, '&lt;')}</div>
      `
      container.appendChild(notesDiv)
    }

    document.body.appendChild(container)

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.93)
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgH = (canvas.height * pageW) / canvas.width
      let remaining = imgH
      let yPos = 0

      pdf.addImage(imgData, 'JPEG', 0, 0, pageW, imgH)
      remaining -= pageH

      while (remaining > 0) {
        yPos -= pageH
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, yPos, pageW, imgH)
        remaining -= pageH
      }

      pdf.save(`${item.label} — APEX Workshop.pdf`.replace(/[/\\?%*:|"<>]/g, '-'))
    } finally {
      document.body.removeChild(container)
      setExporting(false)
    }
  }

  // Per-render closure counters — reset each render
  let _tableIdx = -1
  let _rowIdx = -1
  let _colIdx = -1
  let _codeIdx = -1
  let _cbIdx = 0
  let _tableHeaders = [] // column header texts per table, used as stable key segment

  return (
    <div className="ws-content-area ws-reveal-wrap">
      <div className="ws-content-header">
        <span className="ws-content-eyebrow material-tag">{item.tag}</span>
        <button className="ws-export-btn" onClick={handleExport} disabled={exporting} title="Exportar PDF">
          {exporting ? (
            <span className="ws-export-spinner" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          )}
          {exporting ? 'Gerando…' : 'Exportar PDF'}
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
                _tableIdx++; _rowIdx = -1; _colIdx = -1; _tableHeaders = []
                return <table>{children}</table>
              },
              tr({ children }) {
                _rowIdx++; _colIdx = -1
                return <tr>{children}</tr>
              },
              th({ children }) {
                // capture header text for stable td keys
                const text = typeof children === 'string'
                  ? children.trim()
                  : (Array.isArray(children) ? children.join('') : String(_tableHeaders.length))
                _tableHeaders.push(text || String(_tableHeaders.length))
                return <th>{children}</th>
              },
              td({ children }) {
                _colIdx++
                // use column header as key segment so adding/removing columns elsewhere doesn't shift saved data
                const colSeg = (_tableHeaders[_colIdx] ?? String(_colIdx)).replace(/:/g, '_')
                const subKey = `td:${_tableIdx}:${colSeg}:${_rowIdx}`
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

      <div className={`ws-save-toast ${saved ? 'ws-save-toast-visible' : ''}`}>
        ✓ Salvo
      </div>
    </div>
  )
}
