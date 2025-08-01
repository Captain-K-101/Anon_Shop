import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet } from 'lucide-react';
import api from '../lib/axios';

const Checkout: React.FC = () => {
  const { items, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Prefill shipping address from user profile if available
  const [shipping, setShipping] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('COD');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const shippingFee = subtotal > 1000 ? 0 : subtotal === 0 ? 0 : 100;
  const total = subtotal + tax + shippingFee;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!shipping.name.trim()) errors.name = 'Full name is required.';
    if (!shipping.phone.trim()) {
      errors.phone = 'Phone is required.';
    } else if (!/^\d{10}$/.test(shipping.phone.trim())) {
      errors.phone = 'Phone must be 10 digits.';
    }
    if (!shipping.address.trim()) {
      errors.address = 'Address is required.';
    } else if (shipping.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters.';
    }
    if (!shipping.city.trim()) errors.city = 'City is required.';
    if (!shipping.state.trim()) errors.state = 'State is required.';
    if (!shipping.pincode.trim()) {
      errors.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(shipping.pincode.trim())) {
      errors.pincode = 'Pincode must be 6 digits.';
    }
    if (paymentMethod === 'UPI') {
      if (!upiId.trim()) {
        errors.upiId = 'UPI ID is required.';
      } else if (!/^\w+@[\w.]+$/.test(upiId.trim())) {
        errors.upiId = 'Enter a valid UPI ID.';
      }
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please fix the errors above.');
      return false;
    }
    setError(null);
    return true;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      // Prepare order payload
      const orderPayload = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        paymentMethod,
        shippingAddress: `${shipping.name}, ${shipping.phone}, ${shipping.address}, ${shipping.city}, ${shipping.state}, ${shipping.pincode}`,
        billingAddress: `${shipping.name}, ${shipping.phone}, ${shipping.address}, ${shipping.city}, ${shipping.state}, ${shipping.pincode}`,
        upiId: paymentMethod === 'UPI' ? upiId : undefined
      };
      
      const response = await api.post('/api/orders', orderPayload);
      clearCart();
      navigate(`/order-success?order=${response.data.order._id}`);
    } catch (err) {
      setError('An error occurred while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${user ? 'bg-black' : 'bg-white'}`}>
      <div className="flex items-center gap-4 mb-8">
        <Link 
          to="/cart" 
          className={`p-2 rounded-full transition-colors ${user ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-600 hover:text-blue-600'}`}
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className={`text-3xl font-bold ${user ? 'text-white' : 'text-gray-900'}`}>
          {user ? 'Underground Checkout' : 'Checkout'}
        </h1>
      </div>
      
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Address */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`${user ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-semibold mb-6 ${user ? 'text-white' : 'text-gray-900'}`}>
              {user ? 'Discreet Delivery Address' : 'Shipping Address'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${user ? 'text-gray-300' : 'text-gray-700'}`}>Full Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={shipping.name} 
                  onChange={handleInput} 
                  className={`w-full px-3 py-2 border rounded ${fieldErrors.name ? 'border-red-400' : user ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'}`} 
                  required 
                />
                {fieldErrors.name && <div className="text-red-600 text-xs mt-1">{fieldErrors.name}</div>}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${user ? 'text-gray-300' : 'text-gray-700'}`}>Phone *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={shipping.phone} 
                  onChange={handleInput} 
                  className={`w-full px-3 py-2 border rounded ${fieldErrors.phone ? 'border-red-400' : user ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'}`} 
                  required 
                />
                {fieldErrors.phone && <div className="text-red-600 text-xs mt-1">{fieldErrors.phone}</div>}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${user ? 'text-gray-300' : 'text-gray-700'}`}>Address *</label>
                <textarea 
                  name="address" 
                  value={shipping.address} 
                  onChange={handleInput} 
                  rows={2} 
                  className={`w-full px-3 py-2 border rounded ${fieldErrors.address ? 'border-red-400' : user ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'}`} 
                  required 
                />
                {fieldErrors.address && <div className="text-red-600 text-xs mt-1">{fieldErrors.address}</div>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${user ? 'text-gray-300' : 'text-gray-700'}`}>City *</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={shipping.city} 
                    onChange={handleInput} 
                    className={`w-full px-3 py-2 border rounded ${fieldErrors.city ? 'border-red-400' : user ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'}`} 
                    required 
                  />
                  {fieldErrors.city && <div className="text-red-600 text-xs mt-1">{fieldErrors.city}</div>}
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${user ? 'text-gray-300' : 'text-gray-700'}`}>State *</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={shipping.state} 
                    onChange={handleInput} 
                    className={`w-full px-3 py-2 border rounded ${fieldErrors.state ? 'border-red-400' : user ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'}`} 
                    required 
                  />
                  {fieldErrors.state && <div className="text-red-600 text-xs mt-1">{fieldErrors.state}</div>}
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${user ? 'text-gray-300' : 'text-gray-700'}`}>Pincode *</label>
                  <input 
                    type="text" 
                    name="pincode" 
                    value={shipping.pincode} 
                    onChange={handleInput} 
                    className={`w-full px-3 py-2 border rounded ${fieldErrors.pincode ? 'border-red-400' : user ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'}`} 
                    required 
                  />
                  {fieldErrors.pincode && <div className="text-red-600 text-xs mt-1">{fieldErrors.pincode}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary & Payment */}
        <div className="lg:col-span-1">
          <div className={`${user ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} rounded-lg shadow-lg p-6 sticky top-8`}>
            <h2 className={`text-xl font-semibold mb-6 ${user ? 'text-white' : 'text-gray-900'}`}>Order Summary</h2>
            <div className="space-y-2 mb-6">
              {items.map(item => (
                <div key={item.id} className={`flex justify-between text-sm ${user ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{((item.salePrice || item.price) * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className={`${user ? 'text-gray-400' : 'text-gray-600'}`}>Subtotal</span>
                <span className={`${user ? 'text-white' : 'text-gray-900'}`}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${user ? 'text-gray-400' : 'text-gray-600'}`}>Tax (18% GST)</span>
                <span className={`${user ? 'text-white' : 'text-gray-900'}`}>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${user ? 'text-gray-400' : 'text-gray-600'}`}>Shipping</span>
                <span className={`${user ? 'text-yellow-400' : 'text-green-600'}`}>
                  {shippingFee === 0 ? 'Free' : `₹${shippingFee.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>
            <div className={`border-t ${user ? 'border-gray-700' : 'border-gray-200'} my-4`}></div>
            <div className="flex justify-between text-lg font-bold mb-6">
              <span className={`${user ? 'text-white' : 'text-gray-900'}`}>Total</span>
              <span className={`${user ? 'text-yellow-400' : 'text-gray-900'}`}>₹{total.toLocaleString('en-IN')}</span>
            </div>
            
            <h2 className={`text-xl font-semibold mb-4 ${user ? 'text-white' : 'text-gray-900'}`}>Payment Method</h2>
            <div className="space-y-3 mb-6">
              <label className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${paymentMethod === 'COD' ? (user ? 'border-yellow-400 bg-yellow-400/10' : 'border-blue-500 bg-blue-50') : (user ? 'border-gray-600' : 'border-gray-300')}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <Wallet className={`h-5 w-5 mr-2 ${user ? 'text-yellow-400' : 'text-blue-600'}`} />
                  <span className={`${user ? 'text-white' : 'text-gray-900'}`}>Cash on Delivery (COD)</span>
                </div>
              </label>
              <label className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${paymentMethod === 'UPI' ? (user ? 'border-yellow-400 bg-yellow-400/10' : 'border-blue-500 bg-blue-50') : (user ? 'border-gray-600' : 'border-gray-300')}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <CreditCard className={`h-5 w-5 mr-2 ${user ? 'text-yellow-400' : 'text-blue-600'}`} />
                  <span className={`${user ? 'text-white' : 'text-gray-900'}`}>UPI</span>
                </div>
              </label>
              {paymentMethod === 'UPI' && (
                <div>
                  <input
                    type="text"
                    placeholder="Enter your UPI ID"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className={`w-full px-3 py-2 border rounded mt-2 ${fieldErrors.upiId ? 'border-red-400' : user ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300'}`}
                    required
                  />
                  {fieldErrors.upiId && <div className="text-red-600 text-xs mt-1">{fieldErrors.upiId}</div>}
                </div>
              )}
            </div>
            
            {error && <div className={`mb-4 p-3 border rounded text-sm ${user ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-800'}`}>{error}</div>}
            
            <button
              type="submit"
              className={`w-full py-3 rounded-none font-semibold transition-colors ${user ? 'bg-yellow-400 hover:bg-yellow-300 text-black' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              disabled={loading}
            >
              {loading ? 'Placing Order...' : (user ? 'PLACE ORDER' : 'Place Order')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout; 