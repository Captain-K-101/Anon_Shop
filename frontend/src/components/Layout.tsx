import React, { ReactNode } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { ShoppingCart, User, LogOut, Package, Users, BarChart3, Settings } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const { getTotalItems } = useCart()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  if (user && user.role === 'DELIVERY') {
    return <Navigate to="/delivery" replace />;
  }

  // Only show user tabs for USER
  const isUser = user && user.role === 'USER';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/products" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">Anon Shop</span>
            </Link>
            <nav className="flex items-center space-x-8">
              {isUser && (
                <>
                  <Link
                    to="/products"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/products') 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    Products
                  </Link>
                  <Link
                    to="/orders"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/orders') 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/profile"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/profile') 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/settings') 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    Settings
                  </Link>
                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={logout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
              {/* Admin links */}
              {user && user.role === 'ADMIN' && (
                <>
                  <Link to="/admin" className={isActive('/admin') ? 'font-semibold text-blue-600' : 'text-gray-700'}>Admin</Link>
                  <Link to="/admin/products" className={isActive('/admin/products') ? 'font-semibold text-blue-600' : 'text-gray-700'}>Products</Link>
                  <Link to="/admin/users" className={isActive('/admin/users') ? 'font-semibold text-blue-600' : 'text-gray-700'}>Users</Link>
                  <Link to="/admin/orders" className={isActive('/admin/orders') ? 'font-semibold text-blue-600' : 'text-gray-700'}>Orders</Link>
                  <Link to="/admin/referrals" className={isActive('/admin/referrals') ? 'font-semibold text-blue-600' : 'text-gray-700'}>Referrals</Link>
                  <Link to="/admin/settings" className={isActive('/admin/settings') ? 'font-semibold text-blue-600' : 'text-gray-700'}>Settings</Link>
                  <button onClick={logout} className="text-gray-700 hover:text-red-600">Logout</button>
                </>
              )}
              {/* Guest links */}
              {!user && (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">Login</Link>
                  <Link to="/register" className="btn btn-primary">Register</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout 