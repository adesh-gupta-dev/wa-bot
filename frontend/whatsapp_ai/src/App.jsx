import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// import qr from './../public/qr.png'

function App() {
  setInterval(() => {
    console.log("refreshed");
    window.location.reload(true);

  }, 60*1000);

  return (
    <>
      
      <h1>Welcome to ADESH'S whatsapp Bot</h1>
      <span>Scan the QR code to connect your WhatsApp</span><br />
      <img src="/qrnew.png" alt="WhatsApp QR Code" />
      
    </>
  )
}

export default App
