import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import KaunHai from './KaunHai.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <KaunHai />
  </StrictMode>,
)
