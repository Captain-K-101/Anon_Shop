import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, getTotalItems, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
  const shipping = subtotal > 1000 ? 0 : subtotal === 0 ? 0 : 100; // Free shipping above ₹1000
  const total = subtotal + tax + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <svg width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto text-gray-300 mb-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h8.04a2 2 0 001.83-1.3L21 7M7 13V7m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2" /></svg>
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Shop Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row items-center bg-white rounded-lg shadow-sm border border-gray-200 p-4 gap-4">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-1 w-full">
                <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
                <p className="text-gray-500 text-sm mb-2">₹{(item.salePrice || item.price).toLocaleString('en-IN')}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <label className="text-sm text-gray-600">Qty:</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={item.quantity}
                    onChange={e => updateQuantity(item.id, Math.max(1, Math.min(99, Number(e.target.value))))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center"
                  />
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-4 text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right min-w-[80px]">
                <p className="text-lg font-bold text-gray-900">₹{((item.salePrice || item.price) * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Cart Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Tax (18% GST)</span>
            <span>₹{tax.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}</span>
          </div>
          <div className="border-t border-gray-200 my-4"></div>
          <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
            <span>Total</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <button
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={items.length === 0}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart; 