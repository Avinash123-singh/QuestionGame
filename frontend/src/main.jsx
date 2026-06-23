import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { GameSettingsProvider } from './context/GameSettingsContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameSettingsProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </GameSettingsProvider>
  </React.StrictMode>,
)
