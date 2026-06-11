import { NextResponse } from 'next/server'
import { sendContactMessage } from '@/services/resend'

export async function POST(request: Request) {
  try {
    const { nombre, email, tipo, mensaje } = await request.json()

    if (!nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
      return NextResponse.json({ error: 'Completá todos los campos.' }, { status: 400 })
    }
    if (!['consulta', 'resena'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido.' }, { status: 400 })
    }

    await sendContactMessage({ nombre: nombre.trim(), email: email.trim(), tipo, mensaje: mensaje.trim() })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[contact] Error al enviar mensaje:', e)
    return NextResponse.json({ error: 'Error al enviar. Intentá de nuevo.' }, { status: 500 })
  }
}
