import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import DeliveryLayout from './components/DeliveryLayout'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import UserSettings from './pages/UserSettings'
import ProductDetails from './pages/ProductDetails'
import AdminDashboard from './pages/AdminDashboard'
import AdminProducts from './pages/AdminProducts'
import AdminProductEdit from './pages/AdminProductEdit'
import AdminUsers from './pages/AdminUsers'
import AdminOrders from './pages/AdminOrders'
import AdminReferrals from './pages/AdminReferrals'
import AdminSettings from './pages/AdminSettings'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import DeliveryRoute from './components/DeliveryRoute'
import NotFound from './pages/NotFound'
import OrderSuccess from './pages/OrderSuccess'
import Checkout from './pages/Checkout'
import DeliveryDashboard from './pages/DeliveryDashboard'

// Create a client
const queryClient = new QueryClient()

function DeliveryRedirectGuard() {
  const { user } = useAuth();
  const location = useLocation();
  if (user && user.role === 'DELIVERY' && location.pathname !== '/delivery') {
    return <Navigate to="/delivery" replace />;
  }
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
            <Route path="/products" element={<Layout><Products /></Layout>} />
            <Route path="/products/:id" element={<Layout><ProductDetails /></Layout>} />

            {/* User Routes */}
            <Route path="/cart" element={<Layout><ProtectedRoute><Cart /></ProtectedRoute></Layout>} />
            <Route path="/orders" element={<Layout><ProtectedRoute><Orders /></ProtectedRoute></Layout>} />
            <Route path="/profile" element={<Layout><ProtectedRoute><Profile /></ProtectedRoute></Layout>} />
            <Route path="/settings" element={<Layout><ProtectedRoute><UserSettings /></ProtectedRoute></Layout>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
            <Route path="/admin/products/:id" element={<AdminRoute><AdminLayout><AdminProductEdit /></AdminLayout></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
            <Route path="/admin/referrals" element={<AdminRoute><AdminLayout><AdminReferrals /></AdminLayout></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />

            {/* Delivery Routes */}
            <Route path="/delivery" element={<DeliveryRoute><DeliveryLayout><DeliveryDashboard /></DeliveryLayout></DeliveryRoute>} />

            {/* Order Success */}
            <Route path="/order-success" element={<Layout><ProtectedRoute><OrderSuccess /></ProtectedRoute></Layout>} />

            {/* Checkout */}
            <Route path="/checkout" element={<Layout><ProtectedRoute><Checkout /></ProtectedRoute></Layout>} />

            {/* 404 Not Found */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
          <DeliveryRedirectGuard />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App 