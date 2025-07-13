import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

interface OrderItem {
  product: {
    name: string;
    images: string[];
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  createdAt: string;
}

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get order ID from query string
  const params = new URLSearchParams(location.search);
  const orderId = params.get('order');

  useEffect(() => {
    if (!orderId) {
      setError('No order found.');
      setLoading(false);
      return;
    }
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
        } else {
          setError('Order not found.');
        }
      } catch (err) {
        setError('Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold mb-2 text-red-600">{error || 'Order not found.'}</h2>
        <Link to="/" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <div className="flex flex-col items-center mb-8">
        <svg width="72" height="72" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-500 mb-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" /></svg>
        <h1 className="text-3xl font-bold text-green-700 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-700 mb-2">Thank you for your purchase. Your order has been placed and is being processed.</p>
        <div className="text-gray-500 text-sm">Order Number: <span className="font-semibold text-gray-900">{order.orderNumber || order._id}</span></div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 text-left">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2 mb-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {item.product.images && item.product.images[0] && (
                  <img src={item.product.images[0]} alt={item.product.name} className="w-10 h-10 object-cover rounded" />
                )}
                <span>{item.product.name} x {item.quantity}</span>
              </div>
              <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-gray-700 mb-2">
          <span>Shipping Address</span>
          <span className="text-right max-w-xs truncate">{order.shippingAddress}</span>
        </div>
        <div className="flex justify-between text-gray-700 mb-2">
          <span>Payment</span>
          <span>{order.paymentMethod} ({order.paymentStatus})</span>
        </div>
        <div className="border-t border-gray-200 my-4"></div>
        <div className="flex justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>₹{order.total.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/products" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Continue Shopping</Link>
        <Link to="/orders" className="px-6 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors">View My Orders</Link>
      </div>
    </div>
  );
};

export default OrderSuccess; 