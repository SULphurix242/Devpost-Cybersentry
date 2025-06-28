import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(15, 20, 25, 0.95)',
          color: '#e2e8f0',
          border: '1px solid rgba(96, 165, 250, 0.3)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
        },
      }}
    />
  </React.StrictMode>,
)