import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { config } from '../config'
import { useStoreBuilder } from '../lib/useStoreBuilder'
import { log } from '../lib/log'

export default function EmbeddedCheckout() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(config.products[0] || '')

  const { status, builder } = useStoreBuilder({
    src: config.sblUrl,
    storefront: config.embeddedStorefront,
    callbacks: {
      onData: () => log('data-callback', 'cart updated'),
      onError: (code, message) => log('error-callback', `${code} ${message}`),
      // Fires when the embedded order completes. Null if no order was placed
      onPopupClosed: (order) => {
        log('popup-closed', order)
        if (order?.reference) {
          navigate('/complete', { state: { reference: order.reference, id: order.id, from: 'Embedded' } })
        }
      },
    },
  })

  // Embedded checkout renders whatever is in the SBL cart, so reset then add
  useEffect(() => {
    if (!builder || !selected) return
    builder.reset()
    builder.push({ products: [{ path: selected, quantity: 1 }] })
    log('builder.push', selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builder, selected])

  return (
    <section>
      <h1>Embedded checkout</h1>
      <p className="muted">
        Storefront <code>{config.embeddedStorefront}</code> · SBL {status}
      </p>

      <div className="toolbar">
        <label>
          Product{' '}
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {config.products.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>

      {/* SBL looks for this exact id and injects the checkout iframe into it */}
      <div id="fsc-embedded-checkout-container" className="embedded-container" />

    </section>
  )
}
