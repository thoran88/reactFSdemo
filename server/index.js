// Small Express server that creates FastSpring Sessions for Checkout Components.
// Sessions are single use and expire, so the frontend asks for a fresh one every
// time the Checkout Components page loads. API credentials stay on the server.
import 'dotenv/config'
import express from 'express'

const app = express()
app.use(express.json())

const {
  API_PORT = 4000,
  FS_CHECKOUT_PATH,
  FS_API_USERNAME,
  FS_API_PASSWORD,
  FS_DEFAULT_COUNTRY,
} = process.env

const SESSIONS_URL = (checkoutPath) =>
  `https://api.fastspring.com/v2/checkouts/${checkoutPath}/sessions`

app.post('/api/session', async (req, res) => {
  if (!FS_CHECKOUT_PATH) {
    return res.status(500).json({ error: 'FS_CHECKOUT_PATH is not set in .env' })
  }

  const { products = [], email, country } = req.body || {}
  if (!products.length) {
    return res.status(400).json({ error: 'No products passed to /api/session' })
  }

  const body = {
    cart: {
      lineItems: products.map((productPath) => ({ productPath, quantity: 1 })),
    },
  }

  const buyerCountry = country || FS_DEFAULT_COUNTRY
  if (buyerCountry) body.country = buyerCountry
  if (email) body.customer = { billToContact: { email } }

  const headers = { 'Content-Type': 'application/json' }
  if (FS_API_USERNAME && FS_API_PASSWORD) {
    const token = Buffer.from(`${FS_API_USERNAME}:${FS_API_PASSWORD}`).toString('base64')
    headers.Authorization = `Basic ${token}`
  }

  try {
    const fsRes = await fetch(SESSIONS_URL(FS_CHECKOUT_PATH), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    const data = await fsRes.json().catch(() => ({}))

    if (!fsRes.ok) {
      console.error('[sessions] FastSpring returned', fsRes.status, data)
      return res.status(fsRes.status).json({ error: 'Session create failed', details: data })
    }

    // Only send what the browser needs
    res.json({ id: data.id, checkoutStatus: data.checkoutStatus })
  } catch (err) {
    console.error('[sessions] Request error', err)
    res.status(502).json({ error: 'Could not reach FastSpring' })
  }
})

app.listen(API_PORT, () => {
  console.log(`Session API listening on http://localhost:${API_PORT}`)
})
