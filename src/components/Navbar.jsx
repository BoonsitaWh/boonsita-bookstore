import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link title="หน้าแรก" to="/" className="text-2xl font-bold text-blue-600">BookShop</Link>
        <div className="flex gap-6 items-center">
          <Link title="ตะกร้า" to="/cart" className="flex items-center gap-1 hover:text-blue-500">
            <ShoppingCart size={20} /> ตะกร้า
          </Link>
          <Link title="โปรไฟล์" to="/profile" className="flex items-center gap-1 hover:text-blue-500">
            <User size={20} /> โปรไฟล์
          </Link>
          <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md">เข้าสู่ระบบ</Link>
        </div>
      </div>
    </nav>
  );
}