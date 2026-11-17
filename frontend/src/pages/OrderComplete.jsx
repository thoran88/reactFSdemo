import { Link, useLocation } from 'react-router-dom'

export default function OrderComplete() {
  const { state } = useLocation()

  if (!state?.reference) {
    return (
      <section>
        <h1>No order</h1>
        <Link to="/">Back to checkouts</Link>
      </section>
    )
  }

  return (
    <section>
      <h1>Thanks for your order</h1>
      <p>Reference <strong>{state.reference}</strong></p>
      <p className="muted">Order ID {state.id}</p>
      {state.total && <p>Total {state.total}</p>}
      <p className="muted">Checkout type: {state.from}</p>
      <p className="muted">
        Fulfil from the order.completed webhook on your server, not from this page.
      </p>
      <Link to="/">Back to checkouts</Link>
    </section>
  )
}
