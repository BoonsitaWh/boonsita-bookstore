import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ChevronLeft, ShoppingCart, BookOpen } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams(); // รับ ID ของหนังสือจาก URL
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookDetail();
  }, [id]);

  async function fetchBookDetail() {
    // OWASP A03: ป้องกัน Injection โดยใช้ .eq('id', id) ซึ่งระบบจะทำ Parameterized Query ให้เอง
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (data) setBook(data);
    setLoading(false);
  }

  if (loading) return <div className="text-center py-20">กำลังโหลดข้อมูลหนังสือ...</div>;
  if (!book) return <div className="text-center py-20 text-red-500">ไม่พบหนังสือเล่มนี้ในระบบ</div>;

  return (
    <div className="py-10 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition"
      >
        <ChevronLeft size={20} /> กลับหน้าแรก
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-8 rounded-3xl shadow-sm border">
        {/* รูปภาพหน้าปก */}
        <div className="flex justify-center">
          <img 
            src={book.image_url} 
            alt={book.title} 
            className="rounded-xl shadow-lg w-full max-w-[300px] object-cover border" 
          />
        </div>

        {/* ข้อมูลหนังสือ */}
        <div className="flex flex-col justify-center">
          <span className="text-blue-600 font-semibold mb-2">Category: General</span>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{book.title}</h1>
          <div className="flex items-center gap-2 text-gray-500 mb-6">
            <BookOpen size={18} />
            <span className="text-lg">ผู้แต่ง: {book.author}</span>
          </div>
          
          <div className="mb-8">
            <p className="text-gray-600 leading-relaxed italic">
              "รายละเอียดหนังสือเบื้องต้น: เรื่องราวที่น่าสนใจเกี่ยวกับหนังสือเล่มนี้..."
            </p>
          </div>

          <div className="flex items-center justify-between border-t pt-6">
            <div>
              <p className="text-gray-400 text-sm">ราคาพิเศษ</p>
              <p className="text-3xl font-bold text-blue-600">{book.price} บาท</p>
            </div>
            <button className="bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition transform active:scale-95 shadow-lg">
              <ShoppingCart size={20} /> ใส่ตะกร้าเลย
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}