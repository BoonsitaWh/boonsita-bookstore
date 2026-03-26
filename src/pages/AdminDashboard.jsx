import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Trash2, Edit, CheckCircle, Eye } from 'lucide-react';

export default function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', price: 0, author: '', stock: 0, image_url: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // ดึงข้อมูลหนังสือทั้งหมด
    const { data: booksData } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    if (booksData) setBooks(booksData);

    // ดึงข้อมูลคำสั่งซื้อ (OWASP A03: ป้องกัน Injection ด้วยการใช้ API แทนการเขียน SQL String)
    const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);
  };

  // --- ส่วนจัดการสินค้า (CRUD) ---
  const handleAddBook = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('books').insert([newBook]);
    if (error) alert("Error: " + error.message);
    else {
      alert("เพิ่มสินค้าสำเร็จ!");
      setIsAdding(false);
      fetchData();
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบหนังสือเล่มนี้?")) {
      await supabase.from('books').delete().eq('id', id);
      fetchData();
    }
  };

  // --- ส่วนจัดการคำสั่งซื้อ ---
  const updateOrderStatus = async (orderId, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    fetchData();
  };

  return (
    <div className="py-10 space-y-12">
      <h1 className="text-3xl font-bold border-b pb-4 text-gray-800">แผงควบคุมเจ้าของร้าน</h1>

      {/* 1. ส่วนจัดการสินค้า */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">รายการหนังสือในร้าน</h2>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Plus size={18} /> {isAdding ? 'ยกเลิก' : 'เพิ่มหนังสือใหม่'}
          </button>
        </div>

        {/* ฟอร์มเพิ่มสินค้า */}
        {isAdding && (
          <form onSubmit={handleAddBook} className="bg-white p-6 rounded-xl shadow-md mb-8 grid grid-cols-2 gap-4 border border-green-100">
            <input type="text" placeholder="ชื่อหนังสือ" className="border p-2 rounded" required onChange={e => setNewBook({...newBook, title: e.target.value})} />
            <input type="text" placeholder="ชื่อผู้แต่ง" className="border p-2 rounded" required onChange={e => setNewBook({...newBook, author: e.target.value})} />
            <input type="number" placeholder="ราคา" className="border p-2 rounded" required onChange={e => setNewBook({...newBook, price: e.target.value})} />
            <input type="number" placeholder="จำนวนในสต็อก" className="border p-2 rounded" required onChange={e => setNewBook({...newBook, stock: e.target.value})} />
            <input type="text" placeholder="URL รูปภาพหน้าปก" className="border p-2 rounded col-span-2" onChange={e => setNewBook({...newBook, image_url: e.target.value})} />
            <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">ยืนยันการเพิ่มสินค้า</button>
          </form>
        )}

        {/* ตารางสินค้า */}
        <div className="bg-white rounded-xl shadow overflow-hidden border">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">รูปภาพ</th>
                <th className="p-4">ชื่อหนังสือ</th>
                <th className="p-4">ราคา</th>
                <th className="p-4">สต็อก</th>
                <th className="p-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id} className="border-b hover:bg-gray-50">
                  <td className="p-4"><img src={book.image_url} className="w-12 h-16 object-cover rounded" alt="" /></td>
                  <td className="p-4 font-medium">{book.title}</td>
                  <td className="p-4 text-blue-600 font-bold">{book.price}.-</td>
                  <td className="p-4">{book.stock}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                    <button onClick={() => handleDeleteBook(book.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. ส่วนคำสั่งซื้อ (Order Management) */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">รายการสั่งซื้อและการชำระเงิน</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden border">
          <table className="w-full text-left">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-4">วันที่สั่ง</th>
                <th className="p-4">ยอดรวม</th>
                <th className="p-4">หลักฐานชำระเงิน</th>
                <th className="p-4">สถานะ</th>
                <th className="p-4">เปลี่ยนสถานะ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b">
                  <td className="p-4 text-sm">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="p-4 font-bold">{order.total_price}.-</td>
                  <td className="p-4">
                    {order.slip_url ? (
                      <a href={order.slip_url} target="_blank" className="flex items-center gap-1 text-blue-600 underline text-sm hover:text-blue-800">
                        <Eye size={16} /> ดูสลิป
                      </a>
                    ) : 'ไม่มีหลักฐาน'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.status === 'paid' ? 'ชำระเงินแล้ว' : 'รอตรวจสอบ'}
                    </span>
                  </td>
                  <td className="p-4">
                    {order.status !== 'paid' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'paid')}
                        className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
                      >
                        <CheckCircle size={14} /> ยืนยันยอดเงิน
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}