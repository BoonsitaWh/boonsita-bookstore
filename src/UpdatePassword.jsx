import React, { useState } from 'react';
import { supabase } from "./lib/supabaseClient";

const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState("");

  // --- วางฟังก์ชันของคุณตรงนี้ ---
  const handleUpdatePassword = async (e) => {
    e.preventDefault(); // กันหน้าเว็บ Refresh
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      alert("เปลี่ยนรหัสไม่สำเร็จ: " + error.message);
    } else {
      alert("เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว!");
      window.location.href = "/"; // ส่งกลับไปหน้า Login หลัก
    }
  };

  return (
    <div className="flex flex-col items-center p-10">
      <h2 className="text-xl font-bold mb-4">ตั้งรหัสผ่านใหม่</h2>
      <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3">
        <input 
          type="password" 
          placeholder="กรอกรหัสผ่านใหม่ที่นี่"
          className="border p-2 rounded w-64"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-purple-600 text-white p-2 rounded font-bold">
          ยืนยันการเปลี่ยนรหัส
        </button>
      </form>
    </div>
  );
};

export default UpdatePassword;