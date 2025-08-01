import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  stock: number;
  categoryId: { _id: string; name: string };
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data.product);
        if (res.data.product?.categoryId?._id) {
          const rel = await api.get(`/api/products?category=${res.data.product.categoryId.name}&limit=4`);
          setRelated(rel.data.products.filter((p: Product) => p._id !== id));
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="py-20 text-center">Loading...</div>;
  if (error) return <div className="py-20 text-center text-red-500">{error}</div>;
  if (!product) return <div className="py-20 text-center">Product not found.</div>;

  return (
    <div className={`max-w-7xl mx-auto py-8 px-4 min-h-screen ${user ? 'bg-black' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left: Scrollable Image Gallery */}
        <div className="md:w-1/3 flex flex-col items-center">
          <div className="flex flex-col gap-2 mb-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1">
            {product.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className={`w-16 h-16 object-cover rounded border cursor-pointer transition-all duration-200 ${selectedImg === i ? (user ? 'ring-2 ring-yellow-400 scale-105' : 'ring-2 ring-primary-600 scale-105') : 'hover:scale-105'}`}
                onClick={() => setSelectedImg(i)}
              />
            ))}
          </div>
          <div className="w-full flex-1 flex items-center justify-center relative group">
            <img
              src={product.images[selectedImg]}
              alt={product.name}
              className="w-full h-96 object-contain rounded-lg border shadow cursor-zoom-in transition-all duration-200 hover:shadow-lg"
              onClick={() => setZoomOpen(true)}
            />
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Click to zoom</span>
          </div>
          {/* Modal Zoom */}
          {zoomOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setZoomOpen(false)}>
              <img src={product.images[selectedImg]} alt="Zoomed" className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-2xl border-4 border-white" />
            </div>
          )}
        </div>

        {/* Center: Product Info */}
        <div className="md:w-2/5 flex flex-col gap-4">
          <h1 className={`text-3xl font-extrabold mb-1 leading-tight ${user ? 'text-white' : 'text-gray-900'}`}>{product.name}</h1>
          {/* Ratings placeholder */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400 text-lg">★ ★ ★ ★ ☆</span>
            <span className={`text-sm ${user ? 'text-gray-400' : 'text-gray-500'}`}>(123 ratings)</span>
          </div>
          <div className="flex items-center gap-4 mb-2">
            {product.salePrice ? (
              <>
                <span className={`text-2xl font-bold ${user ? 'text-yellow-400' : 'text-primary-600'}`}>₹{product.salePrice}</span>
                <span className={`text-lg line-through ${user ? 'text-gray-500' : 'text-gray-500'}`}>₹{product.price}</span>
                <span className={`font-semibold ${user ? 'text-yellow-400' : 'text-green-600'}`}>{Math.round(100 - (product.salePrice / product.price) * 100)}% off</span>
              </>
            ) : (
              <span className={`text-2xl font-bold ${user ? 'text-yellow-400' : 'text-primary-600'}`}>₹{product.price}</span>
            )}
          </div>
          {/* Offers placeholder */}
          <div className={`${user ? 'bg-yellow-400/20 border-l-4 border-yellow-400' : 'bg-yellow-50 border-l-4 border-yellow-400'} p-3 rounded mb-2 text-sm`}>
            <span className={`font-semibold ${user ? 'text-yellow-400' : 'text-yellow-700'}`}>{user ? 'Exclusive deal:' : 'Prime deal:'}</span> {user ? 'Discreet delivery for elite members' : 'Free delivery for Prime members'}
          </div>
          <div className="mb-2 text-sm">
            <span className={`font-semibold ${user ? 'text-white' : 'text-gray-900'}`}>Stock:</span> {product.stock > 0 ? <span className={`${user ? 'text-yellow-400' : 'text-green-700'}`}>{product.stock} available</span> : <span className="text-red-600">Out of stock</span>}
          </div>
          <div className="mb-2 text-sm">
            <span className={`font-semibold ${user ? 'text-white' : 'text-gray-900'}`}>Category:</span>{' '}
            <Link to={`/products?category=${product.categoryId.name}`} className={`${user ? 'text-yellow-400 hover:text-yellow-300' : 'text-primary-600 hover:underline'}`}>
              {product.categoryId.name}
            </Link>
          </div>
          <div className="mb-2 text-base">
            <span className={`font-semibold ${user ? 'text-white' : 'text-gray-900'}`}>Description:</span>
            <p className={`mt-1 leading-relaxed ${user ? 'text-gray-300' : 'text-gray-700'}`}>{product.description}</p>
          </div>
          {/* Features placeholder */}
          <div className="mb-2">
            <span className={`font-semibold ${user ? 'text-white' : 'text-gray-900'}`}>Features:</span>
            <ul className={`list-disc ml-6 text-sm ${user ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Premium quality</li>
              <li>Discreet delivery</li>
              <li>Anonymous transactions</li>
            </ul>
          </div>
        </div>

        {/* Right: Sticky Purchase Box */}
        <div className="md:w-1/4">
          <div className={`${user ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-6 flex flex-col gap-4 border sticky top-8 animate-fade-in`}>
            <div className="flex items-center gap-2">
              {product.salePrice ? (
                <>
                  <span className={`text-2xl font-bold ${user ? 'text-yellow-400' : 'text-primary-600'}`}>₹{product.salePrice}</span>
                  <span className={`text-lg line-through ${user ? 'text-gray-500' : 'text-gray-500'}`}>₹{product.price}</span>
                </>
              ) : (
                <span className={`text-2xl font-bold ${user ? 'text-yellow-400' : 'text-primary-600'}`}>₹{product.price}</span>
              )}
            </div>
            <div className={`font-semibold text-sm ${user ? 'text-yellow-400' : 'text-green-600'}`}>Inclusive of all taxes</div>
            <div className="mb-2 text-sm">
              <span className={`font-semibold ${user ? 'text-white' : 'text-gray-900'}`}>Delivery:</span> {user ? 'Discreet delivery in 2-4 days' : 'Free delivery in 2-4 days'}
            </div>
            <div className="mb-2 text-sm">
              <span className={`font-semibold ${user ? 'text-white' : 'text-gray-900'}`}>Quantity:</span>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                className={`w-16 ml-2 border rounded px-2 py-1 focus:ring-2 ${user ? 'border-gray-600 bg-gray-800 text-white focus:ring-yellow-400' : 'border-gray-300 focus:ring-primary-500'}`}
              />
            </div>
            <button
              className={`w-full font-semibold py-2 px-4 rounded-none transition-colors shadow-md transition-transform duration-150 hover:scale-105 active:scale-95 ${user ? 'bg-yellow-400 hover:bg-yellow-300 text-black' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}
              disabled={product.stock === 0}
              onClick={() => {
                addToCart(product, quantity);
              }}
            >
              Add to Cart
            </button>
            <button
              className={`w-full font-semibold py-2 px-4 rounded-none transition-colors shadow-md transition-transform duration-150 hover:scale-105 active:scale-95 ${user ? 'bg-gray-800 hover:bg-gray-700 text-white border border-yellow-400' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
              disabled={product.stock === 0}
              onClick={() => {
                addToCart(product, quantity);
                window.location.href = '/cart';
              }}
            >
              Buy Now
            </button>
            <button
              className={`w-full border py-2 px-4 rounded-none transition-colors ${user ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              disabled={product.stock === 0}
              onClick={() => {
                console.log('Add to wishlist clicked');
              }}
            >
              {user ? 'Add to Wishlist' : 'Add to Wishlist'}
            </button>
            <div className={`text-xs mt-2 ${user ? 'text-gray-400' : 'text-gray-500'}`}>Only {product.stock} left in stock.</div>
          </div>
        </div>
      </div>

      {/* Below: Only Product Details and Related Products */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className={`mb-8 border-b pb-6 ${user ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-bold mb-2 ${user ? 'text-white' : 'text-gray-900'}`}>Product Details</h2>
            <p className={`${user ? 'text-gray-300' : 'text-gray-700'}`}>{product.description}</p>
          </div>
        </div>
        <div>
          <h2 className={`text-xl font-bold mb-4 ${user ? 'text-white' : 'text-gray-900'}`}>Related Products</h2>
          <div className="grid grid-cols-1 gap-4">
            {related.map((rel) => (
              <Link key={rel._id} to={`/products/${rel._id}`} className={`block rounded-lg shadow-sm hover:shadow-md transition-shadow ${user ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
                <img src={rel.images[0]} alt={rel.name} className="w-full h-32 object-cover rounded-t-lg" />
                <div className="p-4">
                  <h3 className={`text-lg font-semibold mb-2 ${user ? 'text-white' : 'text-gray-900'}`}>{rel.name}</h3>
                  <div className="flex items-center gap-2">
                    {rel.salePrice ? (
                      <>
                        <span className={`font-bold ${user ? 'text-yellow-400' : 'text-primary-600'}`}>₹{rel.salePrice}</span>
                        <span className={`line-through ${user ? 'text-gray-500' : 'text-gray-500'}`}>₹{rel.price}</span>
                      </>
                    ) : (
                      <span className={`font-bold ${user ? 'text-yellow-400' : 'text-primary-600'}`}>₹{rel.price}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 