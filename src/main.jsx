import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { WebsiteProvider } from './store/websiteStore.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WebsiteProvider>
      <App />
    </WebsiteProvider>
  </StrictMode>,
)
