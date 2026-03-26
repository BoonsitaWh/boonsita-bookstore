import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CreditCard, Tag, Upload, CheckCircle } from 'lucide-react';

export default function Cart() {
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // สมมติข้อมูลในตะกร้า (ในโปรเจกต์จริงคุณอาจจะดึงจาก State หรือ Context)
  const totalPrice = 590; 

  // 1. ระบบคูปอง (OWASP A03 & A04)
  const applyCoupon = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon)
      .eq('active', true)
      .single();

    if (data) {
      setDiscount(data.discount_percent);
      alert(`ใช้คูปองส่วนลด ${data.discount_percent}% สำเร็จ!`);
    } else {
      alert("คูปองไม่ถูกต้องหรือหมดอายุ");
    }
  };

  // 2. ระบบอัปโหลดสลิป (จำลองการชำระเงิน)
  const handleCheckout = async () => {
    if (!file) return alert("กรุณาแนบหลักฐานการโอนเงิน");
    setUploading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      // อัปโหลดไฟล์ไปที่ Storage (OWASP A04: ป้องกันไฟล์อันตราย)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `slips/${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('payments') // อย่าลืมสร้าง Bucket ชื่อ 'payments' ใน Supabase Storage
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // บันทึกคำสั่งซื้อลงฐานข้อมูล
      const finalAmount = totalPrice - (totalPrice * (discount / 100));
      const { error: orderError } = await supabase.from('orders').insert([{
        user_id: user.id,
        total_price: finalAmount,
        status: 'pending',
        slip_url: filePath
      }]);

      if (orderError) throw orderError;
      alert("สั่งซื้อสำเร็จ! รอเจ้าหน้าที่ตรวจสอบยอดเงิน");
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <CreditCard className="text-blue-600" /> ตะกร้าสินค้าของคุณ
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
        {/* รายการสินค้าแบบย่อ */}
        <div className="flex justify-between border-b pb-4">
          <span>หนังสือ: Learning React...</span>
          <span className="font-bold">{totalPrice} บาท</span>
        </div>

        {/* ส่วนคูปอง */}
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="รหัสคูปอง (เช่น WELCOME10)" 
            className="flex-1 border p-2 rounded-lg outline-none focus:border-blue-500"
            onChange={(e) => setCoupon(e.target.value)}
          />
          <button onClick={applyCoupon} className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-1">
            <Tag size={18} /> ใช้คูปอง
          </button>
        </div>

        {/* สรุปยอดเงิน */}
        <div className="bg-blue-50 p-4 rounded-xl space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>ส่วนลด:</span>
            <span>-{discount}%</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-blue-700">
            <span>ยอดชำระสุทธิ:</span>
            <span>{totalPrice - (totalPrice * (discount / 100))} บาท</span>
          </div>
        </div>

        {/* ส่วนแนบสลิป */}
        <div className="border-2 border-dashed border-gray-200 p-6 rounded-xl text-center">
          <label className="cursor-pointer block">
            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
            <span className="text-sm text-gray-500">คลิกเพื่อแนบสลิปโอนเงิน (PNG, JPG)</span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])} 
            />
          </label>
          {file && <p className="mt-2 text-green-600 text-sm font-medium flex items-center justify-center gap-1">
            <CheckCircle size={14} /> เลือกไฟล์แล้ว: {file.name}
          </p>}
        </div>

        <button 
          onClick={handleCheckout}
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
        >
          {uploading ? 'กำลังประมวลผล...' : 'ยืนยันการสั่งซื้อ'}
        </button>
      </div>
    </div>
  );
}