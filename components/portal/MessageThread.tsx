'use client'

import { useState, useTransition } from 'react'
import { sendOrderMessage } from '@/lib/actions/admin'

interface Message {
  id:           string
  message:      string
  isAdmin:      boolean
  senderUserId: string
  createdAt:    Date
}

interface Props {
  orderId:       string
  messages:      Message[]
  currentUserId: string
  isAdmin:       boolean
}

export default function MessageThread({ orderId, messages, currentUserId, isAdmin }: Props) {
  const [text, setText] = useState('')
  const [localMessages, setLocalMessages] = useState<Message[]>(messages)
  const [isPending, startTransition] = useTransition()

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return

    const optimistic: Message = {
      id:           crypto.randomUUID(),
      message:      trimmed,
      isAdmin,
      senderUserId: currentUserId,
      createdAt:    new Date(),
    }
    setLocalMessages((prev) => [...prev, optimistic])
    setText('')

    startTransition(async () => {
      await sendOrderMessage(orderId, trimmed, isAdmin)
    })
  }

  return (
    <div className="bg-paper border border-ink/8">
      <div className="px-5 py-3 border-b border-ink/8 bg-paper-2 flex items-center justify-between">
        <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40">
          Mensajes del pedido
        </p>
        {localMessages.length > 0 && (
          <span className="font-mono text-[9px] text-ink/30">{localMessages.length}</span>
        )}
      </div>

      {/* Messages list */}
      <div className="px-5 py-4 space-y-3 max-h-[320px] overflow-y-auto">
        {localMessages.length === 0 ? (
          <p className="font-mono text-[10px] text-ink/30 text-center py-4">
            Sin mensajes aún. Consultá cualquier duda sobre este pedido.
          </p>
        ) : localMessages.map((m) => {
          const isMine = m.senderUserId === currentUserId
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
            >
              <div className={[
                'max-w-[80%] px-4 py-3',
                isMine
                  ? 'bg-ink text-paper'
                  : m.isAdmin
                    ? 'bg-red/10 border border-red/20 text-ink'
                    : 'bg-paper-2 border border-ink/10 text-ink',
              ].join(' ')}>
                {m.isAdmin && !isMine && (
                  <p className="font-mono text-[8px] tracking-[0.15em] uppercase text-red mb-1">Hardy</p>
                )}
                <p className="font-body text-[13px] leading-[1.5]">{m.message}</p>
              </div>
              <p className="font-mono text-[8px] text-ink/25 mt-1">
                {new Date(m.createdAt).toLocaleString('es-AR', {
                  day:    '2-digit',
                  month:  'short',
                  hour:   '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-ink/8 flex items-end gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Escribí tu consulta o comentario…"
          rows={2}
          className="flex-1 bg-paper-2 border border-ink/15 font-body text-[13px] px-4 py-3 outline-none focus:border-ink transition-colors resize-none"
        />
        <button
          onClick={handleSend}
          disabled={isPending || !text.trim()}
          className="bg-ink text-paper font-mono text-[11px] tracking-[0.1em] uppercase px-5 py-3 hover:bg-ink/80 disabled:opacity-40 transition-all shrink-0"
        >
          {isPending ? '…' : 'Enviar'}
        </button>
      </div>
      <p className="px-5 pb-3 font-mono text-[8px] text-ink/25">Enter para enviar · Shift+Enter para nueva línea</p>
    </div>
  )
}
