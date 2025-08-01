import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, getTotalItems, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
  const shipping = subtotal > 1000 ? 0 : subtotal === 0 ? 0 : 100; // Free shipping above ₹1000
  const total = subtotal + tax + shipping;

  if (items.length === 0) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center text-center ${user ? 'bg-black' : 'bg-white'}`}>
        <ShoppingBag className={`mx-auto mb-4 h-20 w-20 ${user ? 'text-gray-600' : 'text-gray-300'}`} />
        <h2 className={`text-xl font-semibold mb-2 ${user ? 'text-white' : 'text-gray-900'}`}>Your cart is empty</h2>
        <p className={`mb-6 ${user ? 'text-gray-400' : 'text-gray-500'}`}>Looks like you haven't added anything to your cart yet.</p>
        <Link 
          to="/products" 
          className={`px-6 py-2 rounded-none font-semibold transition-colors ${user ? 'bg-yellow-400 hover:bg-yellow-300 text-black' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          {user ? 'Continue Shopping' : 'Shop Products'}
        </Link>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${user ? 'bg-black' : 'bg-white'}`}>
      <div className="flex items-center gap-4 mb-8">
        <Link 
          to="/products" 
          className={`p-2 rounded-full transition-colors ${user ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-600 hover:text-blue-600'}`}
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className={`text-3xl font-bold ${user ? 'text-white' : 'text-gray-900'}`}>
          {user ? 'Your Underground Cart' : 'Your Cart'}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className={`${user ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} rounded-lg shadow-lg p-6 flex flex-col sm:flex-row items-center gap-6`}>
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-1 w-full">
                <h2 className={`text-lg font-semibold ${user ? 'text-white' : 'text-gray-900'}`}>{item.name}</h2>
                <p className={`text-sm mb-3 ${user ? 'text-yellow-400' : 'text-blue-600'}`}>
                  ₹{(item.salePrice || item.price).toLocaleString('en-IN')}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className={`text-sm ${user ? 'text-gray-400' : 'text-gray-600'}`}>Qty:</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={item.quantity}
                      onChange={e => updateQuantity(item.id, Math.max(1, Math.min(99, Number(e.target.value))))}
                      className={`w-16 px-2 py-1 border rounded text-center ${user ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'}`}
                    />
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className={`flex items-center gap-1 text-sm transition-colors ${user ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right min-w-[100px]">
                <p className={`text-lg font-bold ${user ? 'text-yellow-400' : 'text-gray-900'}`}>
                  ₹{((item.salePrice || item.price) * item.quantity).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className={`${user ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} rounded-lg shadow-lg p-6 sticky top-8`}>
            <h2 className={`text-xl font-bold mb-6 ${user ? 'text-white' : 'text-gray-900'}`}>Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className={`${user ? 'text-gray-400' : 'text-gray-600'}`}>Subtotal</span>
                <span className={`${user ? 'text-white' : 'text-gray-900'}`}>₹{getTotalPrice().toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${user ? 'text-gray-400' : 'text-gray-600'}`}>Tax (18% GST)</span>
                <span className={`${user ? 'text-white' : 'text-gray-900'}`}>₹{Math.round(getTotalPrice() * 0.18).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${user ? 'text-gray-400' : 'text-gray-600'}`}>Shipping</span>
                <span className={`${user ? 'text-yellow-400' : 'text-green-600'}`}>
                  {getTotalPrice() > 1000 ? 'Free' : '₹100'}
                </span>
              </div>
            </div>
            
            <div className={`border-t ${user ? 'border-gray-700' : 'border-gray-200'} pt-4 mb-6`}>
              <div className="flex justify-between">
                <span className={`text-lg font-bold ${user ? 'text-white' : 'text-gray-900'}`}>Total</span>
                <span className={`text-lg font-bold ${user ? 'text-yellow-400' : 'text-gray-900'}`}>
                  ₹{(getTotalPrice() + Math.round(getTotalPrice() * 0.18) + (getTotalPrice() > 1000 ? 0 : 100)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                className={`w-full py-3 rounded-none font-semibold transition-colors ${user ? 'bg-yellow-400 hover:bg-yellow-300 text-black' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                disabled={items.length === 0}
                onClick={() => navigate('/checkout')}
              >
                {user ? 'PROCEED TO CHECKOUT' : 'Proceed to Checkout'}
              </button>
              <Link 
                to="/products"
                className={`block w-full py-3 rounded-none font-semibold text-center transition-colors ${user ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                {user ? 'Continue Shopping' : 'Continue Shopping'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 