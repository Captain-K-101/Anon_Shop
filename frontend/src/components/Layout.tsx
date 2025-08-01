import React, { ReactNode } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { ShoppingCart, User, LogOut, Package, Users, BarChart3, Settings, Moon, Sun, Menu, Shield, Zap, Search } from 'lucide-react'
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
    <div className={`min-h-screen ${user ? 'bg-black' : 'bg-white'}`}>
      {/* Top Bar for logged in users */}
      {user && (
        <div className="bg-gray-900 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center text-sm">
              <div className="flex space-x-6">
                <span>Help Center</span>
                <span>Buyer Protection</span>
                <span>Return Policy</span>
              </div>
              <div>
                <span className="text-yellow-400">Free shipping on orders over ₹50,000</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <header className={`${user ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        {/* Promotional Banner for logged in users */}
        {user && (
          <div className="bg-gray-900 py-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-yellow-400 font-bold">Black Friday Deal</span>
                  <span className="text-white">Up to 70% off</span>
                </div>
                <button className="bg-yellow-400 text-black px-4 py-1 font-bold hover:bg-yellow-300 transition-colors">
                  SHOP NOW
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center h-20">
              <Link to="/products" className="flex items-center space-x-3">
                <span className={`text-2xl font-bold ${user ? 'text-white' : 'text-gray-900'}`}>
                  {user ? (
                    <span className="flex items-center">
                      <Shield className="h-8 w-8 mr-3 text-yellow-400" />
                      <span>UNDERGROUND</span>
                    </span>
                  ) : (
                    'TRIXX'
                  )}
                </span>
              </Link>
              
              {/* Search Bar for logged in users */}
              {user && (
                <div className="flex-1 max-w-md mx-8">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400">
                      <Search className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center space-x-6">
              {/* Theme toggle button - only show for logged in users */}
              {user && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-300" />}
                </button>
              )}
              {isUser && (
                <>
                  <Link
                    to="/products"
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      isActive('/products') 
                        ? 'text-yellow-400 border-b-2 border-yellow-400' 
                        : 'text-white hover:text-yellow-400'
                    }`}
                  >
                    Shop
                  </Link>
                  <Link
                    to="/orders"
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      isActive('/orders') 
                        ? 'text-yellow-400 border-b-2 border-yellow-400' 
                        : 'text-white hover:text-yellow-400'
                    }`}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/profile"
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      isActive('/profile') 
                        ? 'text-yellow-400 border-b-2 border-yellow-400' 
                        : 'text-white hover:text-yellow-400'
                    }`}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      isActive('/settings') 
                        ? 'text-yellow-400 border-b-2 border-yellow-400' 
                        : 'text-white hover:text-yellow-400'
                    }`}
                  >
                    Settings
                  </Link>
                  <Link
                    to="/cart"
                    className="relative p-3 text-white hover:text-yellow-400 transition-colors border border-gray-700 hover:border-yellow-400 rounded-lg"
                    title="Shopping Cart"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                        {getTotalItems()}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-white hover:text-yellow-400 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
              {/* Admin links */}
              {user && user.role === 'ADMIN' && (
                <>
                  <Link to="/admin" className={isActive('/admin') ? 'font-semibold text-yellow-400 border-b-2 border-yellow-400' : 'text-white hover:text-yellow-400'}>Admin</Link>
                  <Link to="/admin/products" className={isActive('/admin/products') ? 'font-semibold text-yellow-400 border-b-2 border-yellow-400' : 'text-white hover:text-yellow-400'}>Products</Link>
                  <Link to="/admin/users" className={isActive('/admin/users') ? 'font-semibold text-yellow-400 border-b-2 border-yellow-400' : 'text-white hover:text-yellow-400'}>Users</Link>
                  <Link to="/admin/orders" className={isActive('/admin/orders') ? 'font-semibold text-yellow-400 border-b-2 border-yellow-400' : 'text-white hover:text-yellow-400'}>Orders</Link>
                  <Link to="/admin/referrals" className={isActive('/admin/referrals') ? 'font-semibold text-yellow-400 border-b-2 border-yellow-400' : 'text-white hover:text-yellow-400'}>Referrals</Link>
                  <Link to="/admin/settings" className={isActive('/admin/settings') ? 'font-semibold text-yellow-400 border-b-2 border-yellow-400' : 'text-white hover:text-yellow-400'}>Settings</Link>
                  <Link
                    to="/cart"
                    className="relative p-3 text-white hover:text-yellow-400 transition-colors border border-gray-700 hover:border-yellow-400 rounded-lg"
                    title="Shopping Cart"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                        {getTotalItems()}
                      </span>
                    )}
                  </Link>
                  <button onClick={logout} className="text-white hover:text-yellow-400">Logout</button>
                </>
              )}
              {/* Guest links */}
              {!user && (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">Login</Link>
                  <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Register</Link>
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
                <Link to="/cart" className="block py-2 flex items-center justify-between" onClick={() => setMobileNavOpen(false)}>
                  <span className="flex items-center">
                    <ShoppingCart className="inline h-5 w-5 mr-2" />
                    Cart
                  </span>
                  {getTotalItems() > 0 && (
                    <span className="bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {getTotalItems()}
                    </span>
                  )}
                </Link>
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
                <Link to="/cart" className="block py-2 flex items-center justify-between" onClick={() => setMobileNavOpen(false)}>
                  <span className="flex items-center">
                    <ShoppingCart className="inline h-5 w-5 mr-2" />
                    Cart
                  </span>
                  {getTotalItems() > 0 && (
                    <span className="bg-yellow-400 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {getTotalItems()}
                    </span>
                  )}
                </Link>
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
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${user ? 'bg-black' : 'bg-white'}`}>
        {children}
      </main>
    </div>
  )
}

export default Layout 