import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    // 1. ตรวจสอบว่า Login หรือยัง (OWASP A07)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUser(user);
      // 2. ตรวจสอบ Role จากตาราง profiles (OWASP A01)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile) setRole(profile.role);
    }
    setLoading(false);
  }

  if (loading) return <div className="p-10 text-center">กำลังตรวจสอบสิทธิ์...</div>;

  // ถ้าไม่ได้ Login ให้กลับไปหน้า Login
  if (!user) return <Navigate to="/login" replace />;

  // ถ้าหน้านี้สำหรับ Admin เท่านั้น แต่ User ไม่ใช่ Admin ให้กลับหน้าแรก
  if (adminOnly && role !== 'admin' && role !== 'owner') {
    alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
    return <Navigate to="/" replace />;
  }

  return children;
}