import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { config } from '../config'
import { useStoreBuilder } from '../lib/useStoreBuilder'
import { log } from '../lib/log'

// Pull display name and price for each product out of the SBL data callback
function productsFromData(data) {
  const map = {}
  data?.groups?.forEach((g) =>
    g.items?.forEach((item) => {
      map[item.path] = {
        name: item.display || item.path,
        price: item.priceTotal || item.price,
      }
    }),
  )
  return map
}

export default function PopupCheckout() {
  const navigate = useNavigate()
  const [catalog, setCatalog] = useState({})

  const { status, builder } = useStoreBuilder({
    src: config.sblUrl,
    storefront: config.popupStorefront,
    callbacks: {
      onData: (data) => {
        setCatalog((prev) => ({ ...prev, ...productsFromData(data) }))
        log('data-callback', `${data?.currency ?? ''} ${data?.total ?? ''}`)
      },
      onError: (code, message) => log('error-callback', `${code} ${message}`),
      onPopupClosed: (order) => {
        log('popup-closed', order)
        if (order?.reference) {
          navigate('/complete', { state: { reference: order.reference, id: order.id, from: 'Popup' } })
        }
      },
    },
  })

  // SBL only returns pricing for products in the cart, so add them all once,
  // capture prices from the data callback, then clear the cart
  const primed = useRef(false)
  useEffect(() => {
    if (!builder || primed.current || !config.products.length) return
    primed.current = true
    builder.push(
      { products: config.products.map((path) => ({ path, quantity: 1 })) },
      () => builder.reset(),
    )
  }, [builder])

  const buy = (path) => {
    if (!builder) return
    builder.reset()
    builder.push({ products: [{ path, quantity: 1 }], checkout: true })
    log('builder.push', `${path} + checkout`)
  }

  return (
    <section>
      <h1>Popup checkout</h1>
      <p className="muted">
        Storefront <code>{config.popupStorefront || 'not set'}</code> · SBL {status}
      </p>

      <div className="grid">
        {config.products.map((path) => (
          <div className="card" key={path}>
            <h3>{catalog[path]?.name || path}</h3>
            <p className="price">{catalog[path]?.price || '...'}</p>
            <button disabled={!builder} onClick={() => buy(path)}>
              Buy now
            </button>
          </div>
        ))}
      </div>

    </section>
  )
}
