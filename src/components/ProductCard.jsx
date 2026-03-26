export default function ProductCard({ book, onAddToCart }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
      <img src={book.image_url} alt={book.title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{book.title}</h3>
        <p className="text-gray-500 text-sm">{book.author}</p>
        <p className="text-blue-600 font-bold mt-2">{book.price} บาท</p>
        <button 
          onClick={() => onAddToCart(book)}
          className="w-full mt-4 bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
        >
          ใส่ตะกร้า
        </button>
      </div>
    </div>
  );
}