import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import UpdatePassword from './UpdatePassword.jsx' // ไฟล์ใหม่ที่เราสร้าง
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* หน้าแรก: ร้านค้าและ Login */}
        <Route path="/" element={<App />} />
        
        {/* หน้าพิเศษ: สำหรับเปลี่ยนรหัสผ่านที่ส่งมาจาก Email */}
        <Route path="/update-password" element={<UpdatePassword />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)