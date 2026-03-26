import React, { useState, useEffect } from 'react';
import { supabase } from "./lib/supabaseClient";


const App = () => {
  // --- การจัดการ State ---
  const [user, setUser] = useState(null);
  const [allBooks, setAllBooks] = useState([]); // เก็บข้อมูลจาก Database
  const [orders, setOrders] = useState([]); // เก็บรายการสั่งซื้อ (จำลอง)
  const [searchTerm, setSearchTerm] = useState(""); // เก็บค่าค้นหา
  const [cart, setCart] = useState([]); // เก็บรายการในตะกร้า
  const [loading, setLoading] = useState(true); // สถานะการโหลด
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false); // ควบคุมการเปิด/ปิดหน้าแก้ไข
  const [showCartModal, setShowCartModal] = useState(false); // เปิด/ปิด หน้าตะกร้า
  const [showPaymentModal, setShowPaymentModal] = useState(false); // เปิด/ปิด หน้าชำระเงิน
  const [slipImage, setSlipImage] = useState(null); // เก็บไฟล์สลิป (จำลอง)
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0); // ฟังก์ชันคำนวณราคารวม
  // --- State สำหรับ Admin ---
  const [isAdmin, setIsAdmin] = useState(false); // สลับโหมด Admin/User
  const [newBook, setNewBook] = useState({ title: "", author: "", price: "", category: "", image_url: "" }); // สำหรับเพิ่มสินค้าใหม่
  


  // --- 1. ฟังก์ชันดึงข้อมูลจาก Supabase (ตาราง products) ---
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      if (data) setAllBooks(data);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- ฟังก์ชันดึงข้อมูลการสั่งซื้อ (สำหรับ Admin) ---
const fetchOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false }); // เอาอันใหม่ขึ้นก่อน

    if (error) throw error;
    if (data) setOrders(data);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
  }
};

  // --- ฟังก์ชันสำหรับ Admin: ยืนยันคำสั่งซื้อ ---
  const handleApproveOrder = async (orderId) => {
    if (!window.confirm("ยืนยันว่าได้รับยอดเงินและตรวจสอบสลิปเรียบร้อยแล้ว?")) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' }) // เปลี่ยนสถานะเป็นสำเร็จ
        .eq('id', orderId);

      if (error) throw error;

      alert("อัปเดตสถานะออเดอร์เรียบร้อยแล้ว!");
      
      // ดึงข้อมูลคำสั่งซื้อใหม่เพื่อให้หน้าจออัปเดตสถานะทันที
      fetchOrders(); 
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการอัปเดต: " + error.message);
    }
  };

  // ดึงข้อมูลเมื่อเข้าโหมด Admin
  useEffect(() => {
    fetchProducts();
  
    // เพิ่มการเช็ค user ให้ชัวร์ก่อนเรียกใช้ email
    if (isLoggedIn && user && user?.email === "boonsita.wh@gmail.com") {
      fetchOrders();
    }
  }, [isLoggedIn, user, isAdmin]);


  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
    } else {
      setIsLoggedIn(true);
      setShowLoginModal(false);
      alert("เข้าสู่ระบบสำเร็จ!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null); // ล้างข้อมูลชื่อบน Navbar ทันที
    setDisplayName(""); // ล้างชื่อในช่อง Input แก้ไขโปรไฟล์
    alert("ออกจากระบบเรียบร้อยแล้ว");
  };
  
  const handleForgotPassword = async () => {
    const emailAddr = prompt("กรุณากรอกอีเมลที่ต้องการรีเซ็ตรหัสผ่าน:");
    if (emailAddr) {
      const { error } = await supabase.auth.resetPasswordForEmail(emailAddr, {
        redirectTo: 'http://localhost:5173/update-password', // หน้าที่จะให้ผู้ใช้เปลี่ยนรหัส
    });
    if (error) alert("ข้อผิดพลาด: " + error.message);
    else alert("ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว!");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.updateUser({
      data: { 
        full_name: displayName,
        // phone: "08x-xxx-xxxx" // ถ้าต้องการเก็บเบอร์เพิ่ม สามารถเพิ่ม Input ได้
    }
  });

    if (error) {
      alert("แก้ไขข้อมูลไม่สำเร็จ: " + error.message);
    } else {
      setUser(data.user);
      alert("อัปเดตข้อมูลส่วนตัวเรียบร้อย!");
      setShowProfileModal(false); // ปิดหน้าต่างเมื่อสำเร็จ
    }
  };
    // --- 2. สั่งให้ทำงานเมื่อเปิดหน้าเว็บครั้งแรก ---
  useEffect(() => {
    fetchProducts();
  }, []);


  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setIsLoggedIn(true);
        setDisplayName(user.user_metadata.full_name || "");
        fetchProducts(); // ✅ เพิ่มบรรทัดนี้เพื่อให้ดึงข้อมูลหนังสือมาแสดง
      }
    };
    checkUser();
  }, [isLoggedIn]);

  // --- 3. ระบบค้นหาสินค้า (Search Filter) ---
  const filteredBooks = allBooks.filter((book) => {
    // ถ้าไม่มีคำค้นหา ให้แสดงหนังสือทั้งหมด
    if (!searchTerm) return true;
   //ตะกล้า
    const titleMatch = book.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const authorMatch = book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || authorMatch;
  });

  // --- 🛒 ฟังก์ชันจัดการตะกร้าสินค้า ---
  const addToCart = (book) => {
    // เช็คว่าในตะกร้ามีหนังสือเล่มนี้หรือยัง
    const existingItem = cart.find((item) => item.id === book.id);

    if (existingItem) {
      // ถ้ามีแล้ว ให้เพิ่มจำนวน (Quantity)
      setCart(
        cart.map((item) =>
          item.id === book.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        )
      );
    } else {
      // ถ้ายังไม่มี ให้เพิ่มเข้าไปใหม่
      setCart([...cart, { ...book, quantity: 1 }]);
    }
    alert(`เพิ่ม "${book.title}" ลงตะกร้าแล้ว!`);
  };

  // ฟังก์ชันลบสินค้าออกจากตะกร้า
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // ฟังก์ชันกดส่งชำระเงิน
  // ฟังก์ชันกดส่งชำระเงิน (แบบอัปโหลดรูปด้วย)
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!slipImage) return alert("กรุณาแนบหลักฐานการโอนเงิน");

    try {
      // --- ส่วนที่เพิ่ม: อัปโหลดรูปภาพสลิปไปที่ Storage ---
      const fileExt = slipImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `slips/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-slips') // ต้องไปสร้าง Bucket ชื่อนี้ใน Supabase ก่อน
        .upload(filePath, slipImage);

      if (uploadError) throw uploadError;

      // ดึง Public URL ของรูปที่อัปโหลด
      const { data: urlData } = supabase.storage.from('payment-slips').getPublicUrl(filePath);
      const slipUrl = urlData.publicUrl;

      // --- ส่วนเดิม: บันทึกข้อมูลลงตาราง orders ---
      const { data, error } = await supabase
        .from('orders')
        .insert([
          { 
            user_email: user.email, 
            total_price: totalPrice, 
            items: cart, 
            status: 'pending',
            slip_url: slipUrl // เพิ่มคอลัมน์นี้ใน Database เพื่อเก็บลิงก์รูป
          }
        ]);

      if (error) throw error;

      alert("ชำระเงินสำเร็จ! ข้อมูลถูกส่งไปยังเจ้าของร้านแล้ว");
      setCart([]);
      setShowPaymentModal(false);
      setSlipImage(null);
      
      // ถ้าเป็น Admin ให้รีเฟรชรายการ Order ทันที
      if (user?.email === "boonsita.wh@gmail.com") fetchOrders();

    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  // --- 📦 ฟังก์ชันสำหรับ Admin ---
  // เพิ่มสินค้าใหม่ลง Supabase
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('products').insert([newBook]).select();
    if (error) alert("เพิ่มไม่สำเร็จ: " + error.message);
    else {
      alert("เพิ่มสินค้าเรียบร้อย!");
      setAllBooks([...allBooks, data[0]]);
      setNewBook({ title: "", author: "", price: "", category: "", image_url: "" });
    }
  };

  // ลบสินค้าออกจาก Supabase
  const handleDeleteProduct = async (id) => {
    if (window.confirm("ยืนยันการลบสินค้านี้?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) alert("ลบไม่สำเร็จ: " + error.message);
      else {
        setAllBooks(allBooks.filter(book => book.id !== id));
        alert("ลบสินค้าเรียบร้อย");
      }
    }
  };

  if (loading) return <div className="text-center mt-10">กำลังโหลดข้อมูลร้าน BOONSITA...</div>;

  return (
    <div className="min-h-screen bg-purple-50 font-sans">
      {/* Navbar / Header */}
      <nav className="bg-purple-700 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-2xl font-bold">BOONSITA BOOKSTORE</h1>
        
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="ค้นหาชื่อหนังสือ หรือนักเขียน..."
            className="p-2 rounded-lg text-black w-64 focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button 
            onClick={() => setShowCartModal(true)} 
            className="relative p-2 bg-purple-600 rounded-full hover:bg-purple-500 transition"
          >

            🛒 ตะกร้า ({cart.length})
          </button>

          {isLoggedIn ? (
            <div className="flex gap-2">
              {isLoggedIn && user && (
                <span className="text-white mr-2">สวัสดี, {user.user_metadata.full_name || user.email}</span>
              )}

              <button 
                onClick={() => setShowProfileModal(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
              >
                ⚙️ แก้ไขโปรไฟล์
              </button>
              
              {/* แสดงปุ่ม Admin เฉพาะเมื่อ Login ด้วย Email ที่กำหนดเท่านั้น */}
              {isLoggedIn && user?.email === "boonsita.wh@gmail.com" && (
                <button 
                  onClick={() => setIsAdmin(!isAdmin)} 
                  className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  {isAdmin ? "🏠 ไปหน้าแรก" : "🔑 โหมดเจ้าของร้าน"}
                </button>
              )}


              <button 
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="bg-white text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 transition"
              >
                เข้าสู่ระบบ
                </button>
            )}

        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-purple-600 text-white py-12 text-center">
        <h2 className="text-4xl font-extrabold mb-2">ยินดีต้อนรับสู่ร้านหนังสือบุญสิตา</h2>
        <p className="text-purple-100">แหล่งรวมหนังสือดีๆ สำหรับทุกคน</p>
      </div>

      {/* Main Content: รายการหนังสือ */}
      <main className="max-w-7xl mx-auto p-6">
        {isAdmin ? (
          <div className="space-y-10">
            {/* ส่วนที่ 1: ฟอร์มเพิ่มสินค้า */}
            <section className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-purple-600">
              <h3 className="text-xl font-bold mb-4">➕ เพิ่มสินค้าใหม่</h3>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input type="text" placeholder="ชื่อหนังสือ" className="p-2 border rounded" value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} required />
                <input type="text" placeholder="นักเขียน" className="p-2 border rounded" value={newBook.author} onChange={(e) => setNewBook({...newBook, author: e.target.value})} required />
                <input type="number" placeholder="ราคา (บาท)" className="p-2 border rounded" value={newBook.price} onChange={(e) => setNewBook({...newBook, price: e.target.value})} required />
                <input type="text" placeholder="หมวดหมู่" className="p-2 border rounded" value={newBook.category} onChange={(e) => setNewBook({...newBook, category: e.target.value})} />
                <input type="text" placeholder="URL รูปภาพ" className="p-2 border rounded" value={newBook.image_url} onChange={(e) => setNewBook({...newBook, image_url: e.target.value})} />
                <button type="submit" className="bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700">บันทึกสินค้า</button>
              </form>
            </section>

            {/* ส่วนที่ 2: ตารางจัดการสต็อก */}
            <section className="bg-white p-6 rounded-2xl shadow-md overflow-x-auto">
              <h3 className="text-xl font-bold mb-4">📦 จัดการสต็อกสินค้า</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-purple-100 text-purple-800">
                    <th className="p-3 border">ชื่อหนังสือ</th>
                    <th className="p-3 border">ราคา</th>
                    <th className="p-3 border">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {allBooks.map(book => (
                    <tr key={book.id} className="hover:bg-gray-50 text-black">
                      <td className="p-3 border">{book.title}</td>
                      <td className="p-3 border">{book.price}.-</td>
                      <td className="p-3 border">
                        <button onClick={() => handleDeleteProduct(book.id)} className="text-red-500 hover:font-bold">ลบ</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
             
            <section className="bg-white p-6 rounded-2xl shadow-md mt-10 text-black">
              <h3 className="text-xl font-bold mb-4">📋 รายการสั่งซื้อจากลูกค้า</h3>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">ยังไม่มีคำสั่งซื้อในขณะนี้</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="border p-4 rounded-lg bg-gray-50 flex justify-between items-start shadow-sm">
                      <div>
                        <p className="font-bold text-purple-800">📧 ลูกค้า: {order.user_email}</p>
                        <p className="text-sm text-gray-600">💰 ยอดชำระ: <span className="font-bold text-red-600">{order.total_price}.-</span> บาท</p>
                        <p className="text-xs text-blue-600 mt-1">🕒 เวลาสั่งซื้อ: {new Date(order.created_at).toLocaleString('th-TH')}</p>
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-gray-500 underline">รายการที่สั่ง:</p>
                          {/* ดึงชื่อหนังสือจากคอลัมน์ items (jsonb) มาโชว์ */}
                          <ul className="list-disc list-inside text-xs text-gray-700 ml-2">
                            {order.items?.map((item, index) => (
                              <li key={index}>{item.title} (x{item.quantity || 1})</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {order.status === 'pending' ? '⏳ รอตรวจสอบ' : '✅ สำเร็จ'}
                        </span>
                        <br />
                        <button 
                        onClick={() => handleApproveOrder(order.id)}
                        className="mt-4 bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition"
                        >
                          จัดการ Order
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : (
          /* --- โค้ดแสดงรายการหนังสือเดิม --- */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <div key={book.id} className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-purple-100 flex flex-col group">
                  <div className="relative overflow-hidden rounded-xl mb-4 h-48 flex items-center justify-center bg-gray-50">
                    <img 
                      src={book.image_url || "https://via.placeholder.com/150?text=No+Image"} 
                      alt={book.title}
                      className="h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="font-bold text-purple-900 mb-1 line-clamp-2 h-12 text-sm">{book.title}</h4>
                  <p className="text-gray-500 text-xs mb-3">{book.author}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-lg font-bold text-purple-700">{book.price}.-</span>
                    <button 
                      onClick={() => addToCart(book)}
                      className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors shadow-md shadow-purple-200"
                    >
                      <span className="text-xs font-bold">+ ใส่ตะกร้า</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-400 text-lg">ไม่พบหนังสือที่คุณกำลังตามหา...</p>
              </div>
            )}
          </div>
        )}
      </main>
      
      

      {/* Footer */}
      <footer className="bg-purple-800 text-purple-100 py-8 text-center mt-12">
        <p>© 2026 BOONSITA Web Development - Project Bookstore Ecommerce</p>
      </footer>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-500">✕</button>
            <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">เข้าสู่ระบบ</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input 
                type="email" placeholder="อีเมล" className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                value={email} onChange={(e) => setEmail(e.target.value)} required 
              />
              <input 
                type="password" placeholder="รหัสผ่าน" className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                value={password} onChange={(e) => setPassword(e.target.value)} required 
              />
              <button type="submit" className="bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition">
                ตกลง
              </button>

              <div className="text-center mt-2">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-sm text-purple-600 hover:underline hover:text-purple-800 transition"
                >
                  ลืมรหัสผ่านใช่หรือไม่?
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[110]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 relative">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-gray-500">✕</button>
            <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">แก้ไขข้อมูลส่วนตัว</h2>
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <label className="text-sm font-semibold text-gray-600">ชื่อ-นามสกุล</label>
              <input 
                type="text" 
                placeholder="ระบุชื่อจริงของคุณ" 
                className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                required 
              />
              <button type="submit" className="bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
                บันทึกการเปลี่ยนแปลง
              </button>
            </form>
          </div>
        </div>
      )}
      {/* --- 1. Modal ตะกร้าสินค้า --- */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[120]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[500px] relative text-black max-h-[80vh] overflow-y-auto">
            <button onClick={() => setShowCartModal(false)} className="absolute top-4 right-4 text-gray-500 text-xl font-bold">✕</button>
            <h2 className="text-2xl font-bold text-purple-800 mb-6 border-b pb-2">🛒 ตะกร้าของคุณ</h2>
            
            {cart.length === 0 ? (
              <p className="text-center py-10 text-gray-500">ตะกร้าว่างเปล่า...</p>
            ) : (
              <div>
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center mb-4 border-b pb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.price} บาท x {item.quantity}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm hover:underline">ลบ</button>
                  </div>
                ))}
                <div className="text-right mt-4">
                  <p className="text-xl font-bold text-purple-700">รวมทั้งหมด: {totalPrice} บาท</p>
                  <button 
                    onClick={() => { setShowPaymentModal(true); setShowCartModal(false); }}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg mt-4 font-bold hover:bg-purple-700 transition"
                  >
                    ไปหน้าชำระเงิน
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- 2. Modal ชำระเงิน (จำลอง) --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[130]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 relative text-black">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-gray-500">✕</button>
            <h2 className="text-2xl font-bold text-purple-800 mb-4 text-center">💳 ชำระเงิน</h2>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-4 text-center">
              <p className="text-sm font-semibold">โอนเงินมาที่: กสิกรไทย</p>
              <p className="text-lg font-bold text-blue-700">000-0-00000-0</p>
              <p className="text-sm">ชื่อบัญชี: บจก. บุญสิตา บุ๊คสโตร์</p>
              <p className="text-xl mt-2 font-bold text-red-600">ยอดที่ต้องโอน: {totalPrice} บาท</p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
              <label className="text-sm font-semibold text-gray-600">แนบหลักฐานการโอน (ไฟล์รูปภาพ)</label>
              <input 
                type="file" 
                accept="image/*" 
                className="p-2 border rounded-lg text-sm"
                onChange={(e) => setSlipImage(e.target.files[0])}
                required 
              />
              <button type="submit" className="bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
                ยืนยันการชำระเงิน
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;