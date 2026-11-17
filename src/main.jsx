import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

// No StrictMode on purpose. StrictMode double runs effects in dev, which would
// load SBL twice and create two single-use Checkout Component sessions.
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
