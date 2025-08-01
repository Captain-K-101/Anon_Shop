import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';

interface UserOrder {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      images: string[];
      price: number;
    };
    quantity: number;
    price: number;
  }>;
}

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return user ? 'bg-yellow-400/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return user ? 'bg-blue-400/20 text-blue-400' : 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return user ? 'bg-purple-400/20 text-purple-400' : 'bg-purple-100 text-purple-800';
      case 'SHIPPED': return user ? 'bg-indigo-400/20 text-indigo-400' : 'bg-indigo-100 text-indigo-800';
      case 'OUT_FOR_DELIVERY': return user ? 'bg-orange-400/20 text-orange-400' : 'bg-orange-100 text-orange-800';
      case 'DELIVERED': return user ? 'bg-green-400/20 text-green-400' : 'bg-green-100 text-green-800';
      case 'CANCELLED': return user ? 'bg-red-400/20 text-red-400' : 'bg-red-100 text-red-800';
      default: return user ? 'bg-gray-400/20 text-gray-400' : 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return user ? 'bg-green-400/20 text-green-400' : 'bg-green-100 text-green-800';
      case 'PENDING': return user ? 'bg-yellow-400/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return user ? 'bg-red-400/20 text-red-400' : 'bg-red-100 text-red-800';
      default: return user ? 'bg-gray-400/20 text-gray-400' : 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />;
      case 'PROCESSING': return <Package className="h-4 w-4" />;
      case 'SHIPPED': return <Truck className="h-4 w-4" />;
      case 'OUT_FOR_DELIVERY': return <Truck className="h-4 w-4" />;
      case 'DELIVERED': return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className={`min-h-screen py-8 ${user ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${user ? 'border-yellow-400' : 'border-blue-600'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${user ? 'bg-black' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-3xl font-bold ${user ? 'text-white' : 'text-gray-900'}`}>
          {user ? 'Your Underground Orders' : 'Your Orders'}
        </h1>
        
        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${user ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 border rounded-lg ${user ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${user ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={`text-center py-12 ${user ? 'text-gray-400' : 'text-gray-500'}`}>
          <ShoppingBag className={`mx-auto h-16 w-16 mb-4 ${user ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`text-lg font-medium mb-2 ${user ? 'text-white' : 'text-gray-900'}`}>
            {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
          </h3>
          <p className="mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Start shopping to see your orders here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => (
            <div key={order._id} className={`${user ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} rounded-lg shadow-lg overflow-hidden`}>
              {/* Order Header */}
              <div className={`p-6 border-b ${user ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${user ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${user ? 'text-white' : 'text-gray-900'}`}>
                        Order #{order.orderNumber}
                      </h3>
                      <p className={`text-sm ${user ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${user ? 'text-yellow-400' : 'text-gray-900'}`}>
                      {formatCurrency(order.total)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium ${user ? 'text-white' : 'text-gray-900'}`}>
                          {item.product.name}
                        </h4>
                        <p className={`text-sm ${user ? 'text-gray-400' : 'text-gray-500'}`}>
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className={`text-right ${user ? 'text-yellow-400' : 'text-gray-900'}`}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Details */}
                <div className={`mt-6 pt-6 border-t ${user ? 'border-gray-800' : 'border-gray-200'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className={`font-medium mb-2 ${user ? 'text-white' : 'text-gray-900'}`}>
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Shipping Address
                      </h4>
                      <p className={`text-sm ${user ? 'text-gray-400' : 'text-gray-600'}`}>
                        {order.shippingAddress}
                      </p>
                    </div>
                    <div>
                      <h4 className={`font-medium mb-2 ${user ? 'text-white' : 'text-gray-900'}`}>
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Order Date
                      </h4>
                      <p className={`text-sm ${user ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${user ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Eye className="inline h-4 w-4 mr-1" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${user ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${user ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${user ? 'text-white' : 'text-gray-900'}`}>
                  Order Details
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className={`p-2 rounded-lg ${user ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Modal content would go here */}
              <p className={`${user ? 'text-gray-300' : 'text-gray-600'}`}>
                Detailed order information for {selectedOrder.orderNumber}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders; 