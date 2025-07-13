import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderPayload)
      });
      if (response.ok) {
        clearCart();
        const data = await response.json();
        navigate(`/order-success?order=${data.order._id}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to place order');
      }
    } catch (err) {
      setError('An error occurred while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" name="name" value={shipping.name} onChange={handleInput} className={`w-full px-3 py-2 border ${fieldErrors.name ? 'border-red-400' : 'border-gray-300'} rounded-lg`} required />
              {fieldErrors.name && <div className="text-red-600 text-xs mt-1">{fieldErrors.name}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input type="tel" name="phone" value={shipping.phone} onChange={handleInput} className={`w-full px-3 py-2 border ${fieldErrors.phone ? 'border-red-400' : 'border-gray-300'} rounded-lg`} required />
              {fieldErrors.phone && <div className="text-red-600 text-xs mt-1">{fieldErrors.phone}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <textarea name="address" value={shipping.address} onChange={handleInput} rows={2} className={`w-full px-3 py-2 border ${fieldErrors.address ? 'border-red-400' : 'border-gray-300'} rounded-lg`} required />
              {fieldErrors.address && <div className="text-red-600 text-xs mt-1">{fieldErrors.address}</div>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input type="text" name="city" value={shipping.city} onChange={handleInput} className={`w-full px-3 py-2 border ${fieldErrors.city ? 'border-red-400' : 'border-gray-300'} rounded-lg`} required />
                {fieldErrors.city && <div className="text-red-600 text-xs mt-1">{fieldErrors.city}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input type="text" name="state" value={shipping.state} onChange={handleInput} className={`w-full px-3 py-2 border ${fieldErrors.state ? 'border-red-400' : 'border-gray-300'} rounded-lg`} required />
                {fieldErrors.state && <div className="text-red-600 text-xs mt-1">{fieldErrors.state}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                <input type="text" name="pincode" value={shipping.pincode} onChange={handleInput} className={`w-full px-3 py-2 border ${fieldErrors.pincode ? 'border-red-400' : 'border-gray-300'} rounded-lg`} required />
                {fieldErrors.pincode && <div className="text-red-600 text-xs mt-1">{fieldErrors.pincode}</div>}
              </div>
            </div>
          </div>
        </div>
        {/* Order Summary & Payment */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-gray-700 text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{((item.salePrice || item.price) * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
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
              <span>{shippingFee === 0 ? 'Free' : `₹${shippingFee.toLocaleString('en-IN')}`}</span>
            </div>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="space-y-2 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mr-2"
                />
                Cash on Delivery (COD)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="mr-2"
                />
                UPI
              </label>
              {paymentMethod === 'UPI' && (
                <div>
                  <input
                    type="text"
                    placeholder="Enter your UPI ID"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className={`w-full px-3 py-2 border ${fieldErrors.upiId ? 'border-red-400' : 'border-gray-300'} rounded-lg mt-2`}
                    required
                  />
                  {fieldErrors.upiId && <div className="text-red-600 text-xs mt-1">{fieldErrors.upiId}</div>}
                </div>
              )}
            </div>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{error}</div>}
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 mt-4"
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout; 