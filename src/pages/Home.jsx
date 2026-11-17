import { Link } from 'react-router-dom'
import { config } from '../config'

const pages = [
  {
    to: '/components',
    title: 'Checkout Components',
    body: 'Individual payment components mounted in your own layout. Needs a server side session.',
  },
  {
    to: '/embedded',
    title: 'Embedded checkout',
    body: 'Full FastSpring checkout rendered inline in the page via the Store Builder Library.',
  },
  {
    to: '/popup',
    title: 'Popup checkout',
    body: 'Product cards with live pricing. Buy opens the FastSpring popup over the page.',
  },
]

export default function Home() {
  return (
    <section>
      <h1>FastSpring React checkouts</h1>
      <p className="muted">Products: {config.products.join(', ') || 'none set in VITE_FS_PRODUCTS'}</p>
      <div className="grid">
        {pages.map((p) => (
          <Link className="card link-card" to={p.to} key={p.to}>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
