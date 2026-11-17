// Creates a FastSpring Session for Checkout Components.
// Shared by the Vercel function (api/session.js) and the local dev server (server.js).

const SESSIONS_URL = (checkoutPath) =>
  `https://api.fastspring.com/v2/checkouts/${checkoutPath}/sessions`

/**
 * @returns {Promise<{ status: number, body: object }>}
 */
export async function createSession({ products = [], email, country, buyerIp } = {}) {
  const { FS_CHECKOUT_PATH, FS_API_USERNAME, FS_API_PASSWORD, FS_DEFAULT_COUNTRY } = process.env

  if (!FS_CHECKOUT_PATH) {
    return { status: 500, body: { error: 'FS_CHECKOUT_PATH is not set' } }
  }
  if (!Array.isArray(products) || !products.length) {
    return { status: 400, body: { error: 'No products passed' } }
  }

  const payload = {
    cart: {
      lineItems: products.map((productPath) => ({ productPath, quantity: 1 })),
    },
  }

  // In prod the buyer IP lets FastSpring work out country and currency.
  // Locally there is no public IP so fall back to FS_DEFAULT_COUNTRY.
  const authenticated = Boolean(FS_API_USERNAME && FS_API_PASSWORD)
  if (country) payload.country = country
  else if (buyerIp && authenticated) payload.buyerIp = buyerIp
  else if (FS_DEFAULT_COUNTRY) payload.country = FS_DEFAULT_COUNTRY

  if (email) payload.customer = { billToContact: { email } }

  const headers = { 'Content-Type': 'application/json' }
  if (authenticated) {
    const token = Buffer.from(`${FS_API_USERNAME}:${FS_API_PASSWORD}`).toString('base64')
    headers.Authorization = `Basic ${token}`
  }

  try {
    const res = await fetch(SESSIONS_URL(FS_CHECKOUT_PATH), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      console.error('[sessions] FastSpring returned', res.status, data)
      return { status: res.status, body: { error: 'Session create failed', details: data } }
    }

    // Only send what the browser needs
    return { status: 200, body: { id: data.id, checkoutStatus: data.checkoutStatus } }
  } catch (err) {
    console.error('[sessions] Request error', err)
    return { status: 502, body: { error: 'Could not reach FastSpring' } }
  }
}

// CORS: the frontend is on a different Vercel domain, so only allow listed origins
export function corsHeaders(origin) {
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  if (!origin || !allowed.includes(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

export function clientIp(headers) {
  const fwd = headers['x-forwarded-for']
  return fwd ? String(fwd).split(',')[0].trim() : undefined
}
