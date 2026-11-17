// Local dev only. Runs the same session logic as the Vercel function.
import 'dotenv/config'
import express from 'express'
import { clientIp, corsHeaders, createSession } from './lib/createSession.js'

const app = express()
app.use(express.json())

app.use((req, res, next) => {
  Object.entries(corsHeaders(req.headers.origin)).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.post('/api/session', async (req, res) => {
  const { status, body } = await createSession({ ...req.body, buyerIp: clientIp(req.headers) })
  res.status(status).json(body)
})

const port = process.env.API_PORT || 4000
app.listen(port, () => console.log(`Session API listening on http://localhost:${port}`))
