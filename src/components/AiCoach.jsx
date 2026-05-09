import { useState, useRef, useEffect } from 'react'
import { MATERIAL_PROMPTS } from '../data/materialPrompts'

const MODEL = 'google/gemma-4-26b-a4b-it:free'

function buildSystemPrompt(item, fields) {
  const materialContext = MATERIAL_PROMPTS[item?.id] ?? ''
  const filledValues = Object.values(fields).filter(v => v && v.trim())
  const filledContext = filledValues.length > 0
    ? `O que o usuário preencheu até agora:\n${filledValues.map(v => `— "${v}"`).join('\n')}`
    : 'O usuário ainda não preencheu nenhum campo neste material.'

  return `Você é o Coach APEX — um consultor comercial socrático especializado em software houses.

O usuário está preenchendo o material "${item.label}" em um workshop de 2 dias sobre construção de máquina comercial.
${materialContext}
${filledContext}

Regras absolutas:
— Nunca preencha respostas. Nunca dê "a resposta certa".
— Faça no máximo 2 perguntas por mensagem.
— Baseie suas perguntas no que ele JÁ escreveu — conecte os pontos, aponte o que ficou vago, questione o óbvio.
— Se ele não preencheu nada, pergunte por onde ele quer começar.
— Seja direto como um consultor, não didático como um professor.
— Fale sempre sobre o negócio específico dele, nunca em abstrato.
— Respostas curtas. Sem introduções. Sem "Ótima reflexão!".
— Responda sempre em português.`
}

async function streamCompletion({ model, messages, onToken, signal }) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'APEX Workshop',
    },
    body: JSON.stringify({ model, messages, stream: true }),
  })

  if (!res.ok) throw new Error(`OpenRouter ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') return
      try {
        const token = JSON.parse(data).choices?.[0]?.delta?.content
        if (token) onToken(token)
      } catch { /* skip malformed chunks */ }
    }
  }
}

export default function AiCoach({ item, fields }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Reset conversation when material changes
  useEffect(() => {
    setMessages([])
  }, [item?.id])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const systemPrompt = buildSystemPrompt(item, fields)
    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    const assistantMsg = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])

    abortRef.current = new AbortController()

    try {
      await streamCompletion({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...newMessages,
        ],
        signal: abortRef.current.signal,
        onToken: (token) => {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: updated[updated.length - 1].content + token,
            }
            return updated
          })
        },
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'Erro ao conectar com o modelo. Verifique a chave do OpenRouter.',
          }
          return updated
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="ws-coach-wrap">
      {open && (
        <div className="ws-coach-panel">
          <div className="ws-coach-header">
            <div className="ws-coach-title">
              <span className="ws-coach-dot" />
              Coach APEX
            </div>
            <button className="ws-coach-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="ws-coach-messages">
            {messages.length === 0 && (
              <div className="ws-coach-empty">
                Preencha os campos e me diga o que está pensando sobre o seu negócio.
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`ws-coach-msg ws-coach-msg-${msg.role}`}>
                {msg.content || (loading && i === messages.length - 1 ? (
                  <span className="ws-coach-typing">▌</span>
                ) : '')}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="ws-coach-input-row">
            <textarea
              className="ws-coach-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva aqui..."
              rows={2}
              disabled={loading}
            />
            <button
              className="ws-coach-send"
              onClick={send}
              disabled={loading || !input.trim()}
            >
              {loading ? '…' : '↑'}
            </button>
          </div>
        </div>
      )}

      <button
        className={`ws-coach-toggle ${open ? 'ws-coach-toggle-open' : ''}`}
        onClick={() => setOpen(p => !p)}
        title="Coach APEX"
      >
        {open ? '✕' : '✦'}
      </button>
    </div>
  )
}
