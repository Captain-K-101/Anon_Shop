import React, { ReactNode } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { ShoppingCart, User, LogOut, Package, Users, BarChart3, Settings, Moon, Sun, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const { getTotalItems } = useCart()
  const location = useLocation()

  // Theme toggle logic
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path: string) => location.pathname === path

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (user && user.role === 'DELIVERY') {
    return <Navigate to="/delivery" replace />;
  }

  // Only show user tabs for USER
  const isUser = user && user.role === 'USER';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/products" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Anon Shop</span>
            </Link>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {/* Theme toggle button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-700" />}
              </button>
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
            {/* Hamburger for mobile */}
            <button className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </button>
          </div>
        </div>
        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4 space-y-4">
            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-2"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-700" />}
            </button>
            {isUser && (
              <>
                <Link to="/products" className="block py-2" onClick={() => setMobileNavOpen(false)}>Products</Link>
                <Link to="/orders" className="block py-2" onClick={() => setMobileNavOpen(false)}>Orders</Link>
                <Link to="/profile" className="block py-2" onClick={() => setMobileNavOpen(false)}>Profile</Link>
                <Link to="/settings" className="block py-2" onClick={() => setMobileNavOpen(false)}>Settings</Link>
                <Link to="/cart" className="block py-2" onClick={() => setMobileNavOpen(false)}><ShoppingCart className="inline h-5 w-5 mr-1" />Cart</Link>
                <button onClick={() => { setMobileNavOpen(false); logout(); }} className="block py-2 text-left w-full">Logout</button>
              </>
            )}
            {user && user.role === 'ADMIN' && (
              <>
                <Link to="/admin" className="block py-2" onClick={() => setMobileNavOpen(false)}>Admin</Link>
                <Link to="/admin/products" className="block py-2" onClick={() => setMobileNavOpen(false)}>Products</Link>
                <Link to="/admin/users" className="block py-2" onClick={() => setMobileNavOpen(false)}>Users</Link>
                <Link to="/admin/orders" className="block py-2" onClick={() => setMobileNavOpen(false)}>Orders</Link>
                <Link to="/admin/referrals" className="block py-2" onClick={() => setMobileNavOpen(false)}>Referrals</Link>
                <Link to="/admin/settings" className="block py-2" onClick={() => setMobileNavOpen(false)}>Settings</Link>
                <button onClick={() => { setMobileNavOpen(false); logout(); }} className="block py-2 text-left w-full">Logout</button>
              </>
            )}
            {!user && (
              <>
                <Link to="/login" className="block py-2" onClick={() => setMobileNavOpen(false)}>Login</Link>
                <Link to="/register" className="block py-2" onClick={() => setMobileNavOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 dark:bg-gray-900">
        {children}
      </main>
    </div>
  )
}

export default Layout 