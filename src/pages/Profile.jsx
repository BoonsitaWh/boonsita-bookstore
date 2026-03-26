import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Save, Mail } from 'lucide-react';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    // ดึงข้อมูล User ปัจจุบันจาก Session (ความปลอดภัย A07)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setEmail(user.email);
      // ดึงชื่อจากตาราง profiles (ความปลอดภัย A01: เช็ค id ตรงกับ user.id)
      let { data, error } = await supabase
        .from('profiles')
        .select(`full_name`)
        .eq('id', user.id)
        .single();

      if (data) setFullName(data.full_name);
    }
    setLoading(false);
  }

  async function updateProfile(e) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const updates = {
      id: user.id,
      full_name: fullName,
      updated_at: new Date(),
    };

    // OWASP A03: ใช้คำสั่ง upsert ของ library เพื่อป้องกัน Injection
    let { error } = await supabase.from('profiles').upsert(updates);

    if (error) alert(error.message);
    else alert('อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว!');
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 p-4 rounded-full mb-4">
          <User size={48} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">โปรไฟล์ของฉัน</h2>
      </div>

      <form onSubmit={updateProfile} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล (แก้ไขไม่ได้)</label>
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border text-gray-500">
            <Mail size={18} />
            <span>{email}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
          <input
            type="text"
            value={fullName || ''}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="กรอกชื่อของคุณ"
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
        >
          <Save size={18} />
          {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
        </button>
      </form>
    </div>
  );
}