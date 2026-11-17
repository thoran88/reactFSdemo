// Vercel serverless function: POST /api/session
import { clientIp, corsHeaders, createSession } from '../lib/createSession.js'

export default async function handler(req, res) {
  const cors = corsHeaders(req.headers.origin)
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (req.headers.origin && !cors['Access-Control-Allow-Origin']) {
    return res.status(403).json({ error: 'Origin not allowed' })
  }

  const { status, body } = await createSession({
    ...(req.body || {}),
    buyerIp: clientIp(req.headers),
  })
  res.status(status).json(body)
}
