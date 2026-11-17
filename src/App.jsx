import { NavLink, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ComponentsCheckout from './pages/ComponentsCheckout'
import EmbeddedCheckout from './pages/EmbeddedCheckout'
import PopupCheckout from './pages/PopupCheckout'
import OrderComplete from './pages/OrderComplete'

export default function App() {
  return (
    <>
      <header className="nav">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/components">Checkout Components</NavLink>
        <NavLink to="/embedded">Embedded</NavLink>
        <NavLink to="/popup">Popup</NavLink>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<ComponentsCheckout />} />
          <Route path="/embedded" element={<EmbeddedCheckout />} />
          <Route path="/popup" element={<PopupCheckout />} />
          <Route path="/complete" element={<OrderComplete />} />
        </Routes>
      </main>
    </>
  )
}
