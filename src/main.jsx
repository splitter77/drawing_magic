import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Cachebuster timestamp
const CACHE_BUSTER = '20261014_174000';

// Register Service Worker with forced fresh cache check
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js?v=${CACHE_BUSTER}`;
    navigator.serviceWorker
      .register(swUrl, {
        scope: import.meta.env.BASE_URL,
        updateViaCache: 'none', // Instructs browser to always fetch fresh sw.js
      })
      .then((registration) => {
        // Immediately check for update
        registration.update();

        // If a new worker is installed, reload to take effect
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[Cachebuster] New version installed, reloading...');
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('SW registration:', err);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
