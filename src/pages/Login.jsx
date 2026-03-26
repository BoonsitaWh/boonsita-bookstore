import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    // OWASP A07: ใช้ระบบ Auth มาตรฐานที่จัดการเรื่องการเดารหัสผ่านและ Session ให้อย่างปลอดภัย
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else alert('ยินดีต้อนรับ!');
  };

  const handleResetPassword = async () => {
    const email = prompt("กรุณากรอกอีเมลที่ลงทะเบียนไว้:");
    if (email) {
      await supabase.auth.resetPasswordForEmail(email);
      alert("ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว!");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-lg border">
      <h2 className="text-2xl font-bold mb-6 text-center">เข้าสู่ระบบ</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input type="email" placeholder="อีเมล" className="w-full border p-3 rounded" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="รหัสผ่าน" className="w-full border p-3 rounded" onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white py-3 rounded font-bold">เข้าสู่ระบบ</button>
      </form>
      <button onClick={handleResetPassword} className="w-full mt-4 text-sm text-gray-500 underline">ลืมรหัสผ่าน?</button>
    </div>
  );
}