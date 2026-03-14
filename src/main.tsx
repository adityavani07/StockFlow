import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Apply saved theme on initial load
const saved = localStorage.getItem('stockflow-storage');
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    if (parsed?.state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch { /* ignore */ }
} else {
  // Default to dark
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
