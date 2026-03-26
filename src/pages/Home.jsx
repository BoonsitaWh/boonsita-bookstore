import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    // OWASP A03: ป้องกัน Injection โดยใช้ API ของ Library แทนการต่อสตริง SQL
    const { data, error } = await supabase.from('books').select('*');
    if (data) setBooks(data);
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">หนังสือมาใหม่</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map(book => (
          <ProductCard key={book.id} book={book} onAddToCart={(b) => alert('เพิ่ม ' + b.title)} />
        ))}
      </div>
    </div>
  );
}