import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getAllItems, NAV } from '../../data/navigation'
import { useProgress } from '../../lib/ProgressContext'
import MaterialPage from './MaterialPage'

const contentFiles = import.meta.glob('../../content/*.md', { query: '?raw', import: 'default', eager: true })

// Build a flat ordered list of all navigable items (for prev/next)
function buildNavOrder() {
  const order = []
  function walk(nodes) {
    for (const node of nodes) {
      if (node.file) order.push(node)
      if (node.type === 'group' && node.children) walk(node.children)
      else if (node.children) walk(node.children)
    }
  }
  walk(NAV)
  return order
}
const NAV_ORDER = buildNavOrder()

const TRACKED = new Set(['mod1', 'mod2', 'mod3', 'mod4', 'mod5', 'mod6'])

export default function ContentPage() {
  const { modId } = useParams()
  const navigate = useNavigate()
  const { completedIds, checklistMap, markComplete, markIncomplete, toggleCheck } = useProgress()

  const allItems = getAllItems()
  const item = allItems[modId]
  const [content, setContent] = useState('')
  const checkboxIndexRef = useRef(0)

  const navIndex = NAV_ORDER.findIndex(n => n.id === modId)
  const prevItem = navIndex > 0 ? NAV_ORDER[navIndex - 1] : null
  const nextItem = navIndex < NAV_ORDER.length - 1 ? NAV_ORDER[navIndex + 1] : null

  const isTracked = TRACKED.has(modId)
  const isComplete = completedIds.has(modId)

  useEffect(() => {
    if (!item) return
    const key = `../../content/${item.file}.md`
    setContent(contentFiles[key] || '# Conteúdo não encontrado')
    window.scrollTo(0, 0)
    checkboxIndexRef.current = 0
  }, [modId, item])

  if (!item) {
    return (
      <div className="ws-content-area">
        <p style={{ color: 'var(--text-muted)' }}>Conteúdo não encontrado.</p>
        <button onClick={() => navigate('/workshop')} className="admin-btn" style={{ marginTop: 16 }}>← Voltar</button>
      </div>
    )
  }

  if (item.type === 'material') return <MaterialPage />

  const eyebrowClass = item.type === 'callout' ? 'callout-tag' : item.type === 'upsell' ? 'upsell-tag' : item.type === 'material' ? 'material-tag' : ''

  const handleCheckbox = (idx, currentChecked) => {
    const key = `${modId}:${idx}`
    toggleCheck(key, !currentChecked)
  }

  // Reset checkbox counter before render
  let cbIdx = 0

  return (
    <div className="ws-content-area">
      <div className="ws-content-header">
        <span className={`ws-content-eyebrow ${eyebrowClass}`}>{item.tag}</span>
      </div>

      {'video' in item && (
        <div className="ws-video-block">
          {item.video ? (
            <iframe
              className="ws-video-iframe"
              src={item.video}
              title={item.label}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="ws-video-placeholder">
              <div className="ws-video-play-icon">▶</div>
              <div className="ws-video-placeholder-text">Gravação disponível em breve</div>
            </div>
          )}
        </div>
      )}

      <article className="ws-markdown">
        <ReactMarkdown
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
            input({ node, ...props }) {
              if (props.type !== 'checkbox') return <input {...props} />
              const idx = cbIdx++
              const key = `${modId}:${idx}`
              const checked = checklistMap[key] ?? props.checked ?? false
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckbox(idx, checked)}
                  className="ws-checkbox"
                />
              )
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

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

        {isTracked && (
          <button
            className={`ws-complete-btn ${isComplete ? 'ws-complete-btn-done' : ''}`}
            onClick={() => isComplete ? markIncomplete(modId) : markComplete(modId)}
          >
            {isComplete ? '✓ Concluído' : 'Marcar como concluído'}
          </button>
        )}
      </div>
    </div>
  )
}
