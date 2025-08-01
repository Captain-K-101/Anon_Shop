import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../lib/axios'
import { Search, Filter, ShoppingCart } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

const Products: React.FC = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [currentPage, setCurrentPage] = useState(1)
  
  const { addToCart } = useCart()

  // Fetch categories
  const { data: categoriesData } = useQuery(
    ['categories'],
    async () => {
      const response = await api.get('/api/categories')
      return response.data
    }
  )

  // Fetch products with filters
  const { data: productsData, isLoading } = useQuery(
    ['products', searchTerm, selectedCategory, priceRange, currentPage],
    async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)
      if (priceRange.min) params.append('minPrice', priceRange.min)
      if (priceRange.max) params.append('maxPrice', priceRange.max)
      
      const response = await api.get(`/api/products?${params}`)
      return response.data
    }
  )

  const products = productsData?.products || []
  const categories = categoriesData?.categories || []
  const pagination = productsData?.pagination

  const handleAddToCart = (product: any) => {
    addToCart(product, 1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setCurrentPage(1)
  }

  return (
    <div className={`max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-8 ${user ? 'bg-black' : 'bg-white'}`}>
      <h1 className={`text-2xl sm:text-3xl font-bold mb-6 ${user ? 'text-white' : 'text-gray-900'}`}>
        {user ? 'Underground Collection' : 'Products'}
      </h1>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/cart"
            className={`relative p-2 transition-colors ${user ? 'text-white hover:text-yellow-400' : 'text-gray-700 hover:text-blue-600'}`}
          >
            <ShoppingCart className="h-6 w-6" />
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className={`${user ? 'bg-gray-900' : 'bg-white'} p-6 rounded-lg shadow-sm border ${user ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${user ? 'border-gray-700 bg-gray-800 text-white focus:ring-yellow-400' : 'border-gray-300 focus:ring-blue-500'}`}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${user ? 'border-gray-700 bg-gray-800 text-white focus:ring-yellow-400' : 'border-gray-300 focus:ring-blue-500'}`}
            >
              <option value="">All Categories</option>
              {categories.map((category: any) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className={`w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${user ? 'border-gray-700 bg-gray-800 text-white focus:ring-yellow-400' : 'border-gray-300 focus:ring-blue-500'}`}
            />
            <input
              type="number"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className={`w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${user ? 'border-gray-700 bg-gray-800 text-white focus:ring-yellow-400' : 'border-gray-300 focus:ring-blue-500'}`}
            />
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className={`px-4 py-2 transition-colors ${user ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`${user ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm p-4 animate-pulse`}>
              <div className={`${user ? 'bg-gray-600' : 'bg-gray-200'} h-48 rounded-lg mb-4`}></div>
              <div className={`${user ? 'bg-gray-600' : 'bg-gray-200'} h-4 rounded mb-2`}></div>
              <div className={`${user ? 'bg-gray-600' : 'bg-gray-200'} h-4 rounded w-2/3`}></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className={`text-lg ${user ? 'text-gray-400' : 'text-gray-500'}`}>No products found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div key={product._id} className={`${user ? 'bg-gray-900 border border-gray-800' : 'bg-white'} rounded-lg shadow hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-4 flex flex-col h-full group cursor-pointer`}>
                <Link to={`/products/${product._id}`} className="flex-1 flex flex-col">
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.salePrice && (
                      <span className={`absolute top-2 right-2 px-2 py-1 rounded text-sm font-medium ${user ? 'bg-yellow-400 text-black' : 'bg-red-500 text-white'}`}>
                        {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                      </span>
                    )}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user ? 'bg-black/80' : 'bg-white/80'}`}>
                        <span className="text-xs font-bold">💎</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className={`text-lg font-semibold mb-2 ${user ? 'text-white group-hover:text-yellow-400' : 'text-gray-900'} transition-colors`}>
                      {product.name}
                    </h3>
                    <p className={`text-sm mb-3 line-clamp-2 flex-1 ${user ? 'text-gray-400' : 'text-gray-600'}`}>
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        {product.salePrice ? (
                          <>
                            <span className={`text-lg font-bold ${user ? 'text-yellow-400' : 'text-blue-600'}`}>
                              ₹{product.salePrice.toLocaleString()}
                            </span>
                            <span className={`line-through ${user ? 'text-gray-500' : 'text-gray-500'}`}>
                              ₹{product.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className={`text-lg font-bold ${user ? 'text-yellow-400' : 'text-blue-600'}`}>
                            ₹{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-yellow-400">
                        <span className="text-sm">★★★★★</span>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="flex gap-2 mt-auto pt-2">
                  <Link
                    to={`/products/${product._id}`}
                    className={`flex-1 px-4 py-2 rounded-none transition-colors text-center font-semibold ${user ? 'bg-yellow-400 hover:bg-yellow-300 text-black' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    {user ? 'ACCESS DETAILS' : 'View'}
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className={`px-4 py-2 border rounded-none transition-colors ${user ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 border rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                disabled={currentPage === pagination.pages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Products 