import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FastSpring } from '@fastspring/checkout-sdk'
import { config } from '../config'
import { log } from '../lib/log'

async function createSession(products) {
  const res = await fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || `Session create failed (${res.status})`)
  return data.id
}

export default function ComponentsCheckout() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  const refs = {
    email: useRef(null),
    applePay: useRef(null),
    googlePay: useRef(null),
    paypal: useRef(null),
    card: useRef(null),
    postal: useRef(null),
    coupon: useRef(null),
    payButton: useRef(null),
    disclosures: useRef(null),
  }

  useEffect(() => {
    let cancelled = false

    if (!config.componentsCheckoutUrl) {
      setError('VITE_FS_COMPONENTS_CHECKOUT_URL is not set')
      return
    }

    const sdk = FastSpring.init({
      checkoutUrl: config.componentsCheckoutUrl,
      debug: import.meta.env.DEV,
      globalStyles: {
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        fontSize: '14px',
      },
      onSessionLoaded: (data) => {
        setSummary(data)
        log('onSessionLoaded', `${data.currency} ${data.cart.withTaxNetTotalDisplay}`)
      },
      onSessionUpdated: (data) => {
        setSummary(data)
        log('onSessionUpdated', data.cart.withTaxNetTotalDisplay)
      },
      onPayClicked: (data) => log('onPayClicked', data.paymentMethodType),
      onPaymentFailed: (err) => {
        log('onPaymentFailed', `${err.type} ${err.message}`)
        setError(err.message)
      },
      onOrderCompleted: (data) => {
        log('onOrderCompleted', data.order.orderReference)
        navigate('/complete', {
          state: {
            reference: data.order.orderReference,
            id: data.order.orderId,
            total: data.withTaxNetTotalDisplay,
            from: 'Checkout Components',
          },
        })
      },
    })

    // Mount order matters for layout only. Wallets render nothing when unavailable
    sdk.components.create('fs-email', { labelMode: 'floating' }).mount(refs.email.current)
    sdk.components.create('fs-apple-pay', { variant: 'black' }).mount(refs.applePay.current)
    sdk.components.create('fs-google-pay', {}).mount(refs.googlePay.current)
    sdk.components.create('fs-paypal', {}).mount(refs.paypal.current)
    sdk.components.create('fs-card', { labelMode: 'floating' }).mount(refs.card.current)
    sdk.components.create('fs-billing-postal-code', {}).mount(refs.postal.current)
    sdk.components.create('fs-coupon', { presentation: 'collapsed' }).mount(refs.coupon.current)
    sdk.components.create('fs-pay-button', {}).mount(refs.payButton.current)
    sdk.components.create('fs-disclosures', {}).mount(refs.disclosures.current)

    // Sessions are single use, so always create a fresh one per page load
    createSession(config.products)
      .then((sessionId) => {
        if (cancelled) return
        log('session created', sessionId)
        return sdk.checkout(sessionId, {
          onSuccess: () => log('checkout', 'ready'),
          onError: (err) => {
            log('checkout error', String(err?.message || err))
            setError('Session failed to load. Check the allowed domains and checkout path.')
          },
        })
      })
      .catch((err) => {
        if (cancelled) return
        log('session error', err.message)
        setError(err.message)
      })

    return () => {
      cancelled = true
      sdk.components.destroyAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section>
      <h1>Checkout Components</h1>
      <p className="muted">
        Checkout <code>{config.componentsCheckoutUrl || 'not set'}</code>
      </p>

      <div className="components-layout">
        <div className="components-form">
          <div ref={refs.email} />
          <div ref={refs.applePay} />
          <div ref={refs.googlePay} />
          <div ref={refs.paypal} />
          <div ref={refs.card} />
          <div ref={refs.postal} />
          <div ref={refs.coupon} />
          {error && <p className="error">{error}</p>}
          <div ref={refs.payButton} />
          <div ref={refs.disclosures} />
        </div>

        <aside className="summary">
          <h3>Order summary</h3>
          {!summary && <p className="muted">Loading session...</p>}
          {summary?.cart.lineItems.map((li) => (
            <div className="line" key={li.productPath}>
              <span>{li.displayName || li.productPath} × {li.quantity}</span>
              <span>{li.extendedNetTotalDisplay}</span>
            </div>
          ))}
          {summary && (
            <>
              {summary.cart.discountTotal > 0 && (
                <div className="line"><span>Discount</span><span>-{summary.cart.discountTotalDisplay}</span></div>
              )}
              <div className="line"><span>Tax</span><span>{summary.cart.taxTotalDisplay}</span></div>
              <div className="line total"><span>Total</span><span>{summary.cart.withTaxNetTotalDisplay}</span></div>
            </>
          )}
        </aside>
      </div>

    </section>
  )
}
