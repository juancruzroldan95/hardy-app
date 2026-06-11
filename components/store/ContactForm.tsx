'use client'

import { useState } from 'react'

type Tipo = 'consulta' | 'resena'

export default function ContactForm() {
  const [tipo, setTipo]       = useState<Tipo>('consulta')
  const [nombre, setNombre]   = useState('')
  const [email, setEmail]     = useState('')
  const [mensaje, setMensaje] = useState('')
  const [status, setStatus]   = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nombre, email, tipo, mensaje }),
      })
      const data = await res.json()
      if (!res.ok) { setStatus('error'); setErrorMsg(data.error ?? 'Error al enviar.'); return }
      setStatus('ok')
    } catch {
      setStatus('error')
      setErrorMsg('Error de conexión. Intentá de nuevo.')
    }
  }

  if (status === 'ok') {
    return (
      <div className="bg-paper-2 border border-ink/10 px-8 py-10 text-center max-w-[560px] mx-auto">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#2d6a35] mb-3">✓ Enviado</p>
        <p className="font-heading text-[22px] font-medium mb-2">¡Gracias{nombre ? `, ${nombre.split(' ')[0]}` : ''}!</p>
        <p className="font-body text-[14px] text-ink/50 leading-[1.6]">
          {tipo === 'resena'
            ? 'Tu reseña nos llegó. La leemos con atención.'
            : 'Tu consulta nos llegó. Te respondemos a la brevedad.'}
        </p>
      </div>
    )
  }

  const inputClass = 'w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors'
  const tabClass   = (t: Tipo) => [
    'flex-1 font-mono text-[10px] tracking-[0.15em] uppercase py-3 border transition-colors',
    tipo === t
      ? 'bg-ink text-paper border-ink'
      : 'bg-paper text-ink/40 border-ink/15 hover:text-ink hover:border-ink/40',
  ].join(' ')

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Tipo */}
      <div className="flex gap-2">
        <button type="button" className={tabClass('consulta')} onClick={() => setTipo('consulta')}>Consulta</button>
        <button type="button" className={tabClass('resena')}   onClick={() => setTipo('resena')}>Reseña</button>
      </div>

      {/* Nombre + Email */}
      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        <input
          type="text"
          required
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={inputClass}
        />
        <input
          type="email"
          required
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Mensaje */}
      <textarea
        required
        rows={4}
        placeholder={tipo === 'resena' ? 'Contanos tu experiencia con Hardy...' : '¿En qué podemos ayudarte?'}
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        className={`${inputClass} resize-none`}
      />

      {errorMsg && (
        <p className="font-mono text-[11px] tracking-[0.05em] text-red">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-4 hover:bg-red/90 transition-colors disabled:opacity-50 self-start"
      >
        {status === 'sending' ? 'Enviando...' : 'Enviar →'}
      </button>
    </form>
  )
}
