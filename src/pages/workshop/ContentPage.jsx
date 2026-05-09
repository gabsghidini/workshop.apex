import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getAllItems } from '../../data/navigation'

const contentFiles = import.meta.glob('../../content/*.md', { query: '?raw', import: 'default', eager: true })

export default function ContentPage() {
  const { modId } = useParams()
  const navigate = useNavigate()
  const allItems = getAllItems()
  const item = allItems[modId]

  const [content, setContent] = useState('')

  useEffect(() => {
    if (!item) return
    const key = `../../content/${item.file}.md`
    const raw = contentFiles[key]
    setContent(raw || '# Conteúdo não encontrado')
    window.scrollTo(0, 0)
  }, [modId, item])

  if (!item) {
    return (
      <div className="ws-content-area">
        <p style={{ color: 'var(--text-muted)' }}>Conteúdo não encontrado.</p>
        <button onClick={() => navigate('/workshop')} className="admin-btn" style={{ marginTop: 16 }}>← Voltar</button>
      </div>
    )
  }

  const eyebrowClass = item.type === 'callout' ? 'callout-tag' : item.type === 'upsell' ? 'upsell-tag' : item.type === 'material' ? 'material-tag' : ''

  return (
    <div className="ws-content-area">
      <div className="ws-content-header">
        <div className={`ws-content-eyebrow ${eyebrowClass}`}>{item.tag}</div>
      </div>
      <article className="ws-markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
    </div>
  )
}
