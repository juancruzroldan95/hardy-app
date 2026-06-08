/**
 * Andreani REST API v2 — wrapper
 *
 * Docs: https://developers.andreani.com
 * Auth: Basic Auth en POST /v2/login → devuelve x-authorization-token (JWT)
 *       El token se renueva cada llamada (stateless) o se cachea brevemente.
 *
 * Variables de entorno requeridas:
 *   ANDREANI_USER        — usuario de la cuenta cliente
 *   ANDREANI_PASSWORD    — contraseña de la cuenta cliente
 *   ANDREANI_CONTRACT    — número de contrato de envío
 *   ANDREANI_SANDBOX     — 'true' para sandbox (default: false en producción)
 *
 * Dimensiones de los frascos (estimación operativa Hardy):
 *   Frasco 380g / 500g: ~0.6 kg, 10 × 8 × 8 cm (con packaging)
 */

// ─── Config ──────────────────────────────────────────────────────────────────

function getBaseUrl() {
  return process.env.ANDREANI_SANDBOX === 'true'
    ? 'https://apisandbox.andreani.com'
    : 'https://api.andreani.com'
}

function getCredentials() {
  const user     = process.env.ANDREANI_USER
  const password = process.env.ANDREANI_PASSWORD
  const contract = process.env.ANDREANI_CONTRACT

  if (!user || !password || !contract) {
    throw new Error('[Andreani] Faltan variables de entorno: ANDREANI_USER, ANDREANI_PASSWORD, ANDREANI_CONTRACT')
  }

  return { user, password, contract }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

let _cachedToken: string | null = null
let _tokenExpiresAt = 0

async function getToken(): Promise<string> {
  // Cache con 10 min de margen
  if (_cachedToken && Date.now() < _tokenExpiresAt - 10 * 60 * 1000) {
    return _cachedToken
  }

  const { user, password } = getCredentials()
  const credentials = Buffer.from(`${user}:${password}`).toString('base64')

  const res = await fetch(`${getBaseUrl()}/v2/login`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}` },
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`[Andreani] Login fallido (${res.status}): ${detail}`)
  }

  const token = res.headers.get('x-authorization-token')
  if (!token) throw new Error('[Andreani] Login OK pero no se recibió x-authorization-token')

  _cachedToken = token
  // Asumir TTL de 60 min
  _tokenExpiresAt = Date.now() + 60 * 60 * 1000

  return token
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken()
  return {
    'Content-Type': 'application/json',
    'x-authorization-token': token,
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AndreaniCotizacionParams {
  cpDestino: string
  pesoKg: number
  valorDeclarado: number
}

export interface AndreaniCotizacion {
  precio: number
  diasHabiles: number
  servicio: string
}

export interface AndreaniDestinatario {
  nombre: string
  email: string
  telefono: string
  calle: string
  numero: string
  cp: string
  ciudad: string
  provincia: string
}

export interface AndreaniOrdenParams {
  nroPedido: string           // ID interno de la orden en DB
  destinatario: AndreaniDestinatario
  bultos: AndreaniOrdenBulto[]
}

export interface AndreaniOrdenBulto {
  pesoKg: number
  altoKg?: number
  alto?: number
  ancho?: number
  largo?: number
  valorDeclarado: number
}

export interface AndreaniOrdenResult {
  nroEnvio: string
}

export interface AndreaniTraza {
  fecha: string
  estado: string
  descripcion: string
}

// ─── Cotizar envío ────────────────────────────────────────────────────────────

export async function cotizarEnvio(params: AndreaniCotizacionParams): Promise<AndreaniCotizacion> {
  const { contract } = getCredentials()
  const headers = await authHeaders()

  const body = {
    contrato: contract,
    cpDestino: params.cpDestino,
    bultos: [
      {
        kilos:          params.pesoKg,
        largoCm:        20,
        anchoCm:        15,
        altoCm:         10,
        valorDeclarado: params.valorDeclarado,
      },
    ],
  }

  const res = await fetch(`${getBaseUrl()}/v2/precios`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`[Andreani] cotizarEnvio fallido (${res.status}): ${detail}`)
  }

  const data = await res.json()

  // La API devuelve un array de tarifas; tomamos la primera (servicio estándar)
  const tarifa = Array.isArray(data) ? data[0] : data

  return {
    precio:      Math.ceil(Number(tarifa?.tarifaConIVA ?? tarifa?.tarifa ?? 0)),
    diasHabiles: Number(tarifa?.diasHabiles ?? tarifa?.plazoEntrega ?? 3),
    servicio:    String(tarifa?.nombre ?? tarifa?.servicio ?? 'Andreani Estándar'),
  }
}

// ─── Crear orden de envío ─────────────────────────────────────────────────────

export async function crearOrden(params: AndreaniOrdenParams): Promise<AndreaniOrdenResult> {
  const { contract } = getCredentials()
  const headers = await authHeaders()

  const body = {
    contrato: contract,
    remitente: {
      // Depósito Hardy (completar con dirección real en .env si se exige)
      nombreCompleto: 'Hardy Foods',
      email:          process.env.HARDY_WAREHOUSE_EMAIL ?? 'logistica@hardyfoods.com.ar',
      documentoTipo:  'CUIT',
      documentoNumero: process.env.HARDY_CUIT ?? '',
      telefono:       process.env.HARDY_PHONE ?? '',
      direccion: {
        calle:    process.env.ANDREANI_SENDER_CALLE    ?? 'Calle Pendiente',
        numero:   process.env.ANDREANI_SENDER_NUMERO   ?? '0',
        localidad: process.env.ANDREANI_SENDER_CIUDAD  ?? 'Buenos Aires',
        provincia: process.env.ANDREANI_SENDER_PROV    ?? 'Buenos Aires',
        codigoPostal: process.env.ANDREANI_SENDER_CP   ?? '1000',
        pais:     'ARG',
      },
    },
    destinatario: {
      nombreCompleto: params.destinatario.nombre,
      email:          params.destinatario.email,
      telefono:       params.destinatario.telefono,
      direccion: {
        calle:       params.destinatario.calle,
        numero:      params.destinatario.numero,
        codigoPostal: params.destinatario.cp,
        localidad:   params.destinatario.ciudad,
        provincia:   params.destinatario.provincia,
        pais:        'ARG',
      },
    },
    bultos: params.bultos.map((b) => ({
      kilos:          b.pesoKg,
      largoCm:        b.largo  ?? 20,
      anchoCm:        b.ancho  ?? 15,
      altoCm:         b.alto   ?? 10,
      valorDeclarado: b.valorDeclarado,
    })),
    // Referencia interna del pedido
    idClienteOrigen: params.nroPedido,
  }

  const res = await fetch(`${getBaseUrl()}/v2/envios`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`[Andreani] crearOrden fallido (${res.status}): ${detail}`)
  }

  const data = await res.json()

  const nroEnvio = String(
    data?.nroEnvio ?? data?.numeroEnvio ?? data?.idEnvio ?? data?.id ?? ''
  )

  if (!nroEnvio) {
    throw new Error('[Andreani] crearOrden: respuesta sin nroEnvio')
  }

  return { nroEnvio }
}

// ─── Obtener etiqueta PDF ─────────────────────────────────────────────────────

export async function getEtiqueta(nroEnvio: string): Promise<Blob> {
  const headers = await authHeaders()

  const res = await fetch(
    `${getBaseUrl()}/v2/ordenes-de-envio/${nroEnvio}/etiquetas`,
    { headers: { ...headers, Accept: 'application/pdf' } }
  )

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`[Andreani] getEtiqueta fallido (${res.status}): ${detail}`)
  }

  return res.blob()
}

// ─── Trazabilidad ─────────────────────────────────────────────────────────────

export async function getTrazabilidad(nroEnvio: string): Promise<AndreaniTraza[]> {
  const headers = await authHeaders()

  const res = await fetch(
    `${getBaseUrl()}/v2/envios/${nroEnvio}/trazas`,
    { headers }
  )

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`[Andreani] getTrazabilidad fallido (${res.status}): ${detail}`)
  }

  const data = await res.json()
  const trazas: AndreaniTraza[] = (Array.isArray(data) ? data : data?.trazas ?? []).map(
    (t: Record<string, string>) => ({
      fecha:       String(t.fecha ?? t.fechaEvento ?? ''),
      estado:      String(t.estado ?? t.codigoEstado ?? ''),
      descripcion: String(t.descripcion ?? t.observaciones ?? ''),
    })
  )

  return trazas
}

// ─── Helper: calcular peso total desde items del carrito ─────────────────────

/** Peso estimado por frasco (kg) — frascos 380g–500g con packaging */
const KG_POR_FRASCO = 0.6

export function calcularPesoKg(totalUnidades: number): number {
  return Math.max(0.5, totalUnidades * KG_POR_FRASCO)
}
