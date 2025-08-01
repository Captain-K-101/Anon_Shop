import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, ShoppingBag, Package } from 'lucide-react';
import api from '../lib/axios';

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
  const { user } = useAuth();
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
        const response = await api.get(`/api/orders/${orderId}`);
        setOrder(response.data.order);
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
      <div className={`min-h-[60vh] flex items-center justify-center ${user ? 'bg-black' : 'bg-white'}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${user ? 'border-yellow-400' : 'border-blue-600'}`}></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center text-center ${user ? 'bg-black' : 'bg-white'}`}>
        <h2 className={`text-xl font-semibold mb-2 ${user ? 'text-red-400' : 'text-red-600'}`}>{error || 'Order not found.'}</h2>
        <Link 
          to="/" 
          className={`mt-4 px-6 py-2 rounded-none font-semibold transition-colors ${user ? 'bg-yellow-400 hover:bg-yellow-300 text-black' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className={`max-w-3xl mx-auto py-12 text-center ${user ? 'bg-black' : 'bg-white'}`}>
      <div className="flex flex-col items-center mb-8">
        <CheckCircle className={`h-20 w-20 mb-4 ${user ? 'text-yellow-400' : 'text-green-500'}`} />
        <h1 className={`text-3xl font-bold mb-2 ${user ? 'text-yellow-400' : 'text-green-700'}`}>
          {user ? 'Order Secured Successfully!' : 'Order Placed Successfully!'}
        </h1>
        <p className={`mb-2 ${user ? 'text-gray-300' : 'text-gray-700'}`}>
          {user ? 'Your premium items have been secured. Discreet delivery in progress.' : 'Thank you for your purchase. Your order has been placed and is being processed.'}
        </p>
        <div className={`text-sm ${user ? 'text-gray-400' : 'text-gray-500'}`}>
          Order Number: <span className={`font-semibold ${user ? 'text-yellow-400' : 'text-gray-900'}`}>{order.orderNumber || order._id}</span>
        </div>
      </div>
      
      <div className={`${user ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} rounded-lg shadow-lg p-6 mb-8 text-left`}>
        <h2 className={`text-lg font-semibold mb-4 ${user ? 'text-white' : 'text-gray-900'}`}>Order Summary</h2>
        <div className="space-y-3 mb-6">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {item.product.images && item.product.images[0] && (
                  <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                )}
                <span className={`${user ? 'text-gray-300' : 'text-gray-700'}`}>{item.product.name} x {item.quantity}</span>
              </div>
              <span className={`font-semibold ${user ? 'text-yellow-400' : 'text-gray-900'}`}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
        <div className={`border-t ${user ? 'border-gray-700' : 'border-gray-200'} my-4`}></div>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className={`${user ? 'text-gray-400' : 'text-gray-600'}`}>Shipping Address</span>
            <span className={`text-right max-w-xs truncate ${user ? 'text-gray-300' : 'text-gray-700'}`}>{order.shippingAddress}</span>
          </div>
          <div className="flex justify-between">
            <span className={`${user ? 'text-gray-400' : 'text-gray-600'}`}>Payment</span>
            <span className={`${user ? 'text-gray-300' : 'text-gray-700'}`}>{order.paymentMethod} ({order.paymentStatus})</span>
          </div>
        </div>
        <div className={`border-t ${user ? 'border-gray-700' : 'border-gray-200'} my-4`}></div>
        <div className="flex justify-between text-lg font-bold">
          <span className={`${user ? 'text-white' : 'text-gray-900'}`}>Total</span>
          <span className={`${user ? 'text-yellow-400' : 'text-gray-900'}`}>₹{order.total.toLocaleString('en-IN')}</span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          to="/products" 
          className={`px-6 py-2 rounded-none font-semibold transition-colors ${user ? 'bg-yellow-400 hover:bg-yellow-300 text-black' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          {user ? 'Continue Shopping' : 'Continue Shopping'}
        </Link>
        <Link 
          to="/orders" 
          className={`px-6 py-2 rounded-none font-semibold transition-colors ${user ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          {user ? 'View My Orders' : 'View My Orders'}
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess; 