import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../lib/axios'
import { ArrowRight, Star, ShoppingCart, Truck, Shield, Zap, Heart, Eye, Clock, Users, Skull, Lock, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Home: React.FC = () => {
  const { user } = useAuth()
  
  // Fetch featured products
  const { data: productsData, isLoading } = useQuery(
    ['featured-products'],
    async () => {
      const response = await api.get('/api/products?featured=true&limit=8')
      return response.data
    }
  )

  const featuredProducts = productsData?.products || []

  // Mock grocery items for non-logged-in users
  const groceryItems = [
    {
      id: 'grocery-1',
      name: 'Fresh Organic Bananas',
      description: 'Sweet and nutritious organic bananas, perfect for healthy snacking',
      price: 89,
      salePrice: 69,
      images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop'],
      category: 'Fruits'
    },
    {
      id: 'grocery-2',
      name: 'Whole Grain Bread',
      description: 'Freshly baked whole grain bread with no preservatives',
      price: 45,
      salePrice: 35,
      images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop'],
      category: 'Bakery'
    },
    {
      id: 'grocery-3',
      name: 'Organic Milk',
      description: 'Pure organic milk from grass-fed cows, rich in nutrients',
      price: 120,
      salePrice: 99,
      images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop'],
      category: 'Dairy'
    },
    {
      id: 'grocery-4',
      name: 'Fresh Tomatoes',
      description: 'Ripe and juicy tomatoes, perfect for salads and cooking',
      price: 60,
      salePrice: 45,
      images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop'],
      category: 'Vegetables'
    },
    {
      id: 'grocery-5',
      name: 'Brown Rice',
      description: 'Nutritious brown rice, rich in fiber and essential minerals',
      price: 85,
      salePrice: 70,
      images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop'],
      category: 'Grains'
    },
    {
      id: 'grocery-6',
      name: 'Free Range Eggs',
      description: 'Fresh eggs from free-range chickens, high in protein',
      price: 180,
      salePrice: 150,
      images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop'],
      category: 'Dairy'
    },
    {
      id: 'grocery-7',
      name: 'Organic Honey',
      description: 'Pure organic honey, natural sweetener with health benefits',
      price: 250,
      salePrice: 200,
      images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop'],
      category: 'Pantry'
    },
    {
      id: 'grocery-8',
      name: 'Fresh Spinach',
      description: 'Nutrient-rich spinach leaves, perfect for salads and smoothies',
      price: 40,
      salePrice: 30,
      images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop'],
      category: 'Vegetables'
    }
  ]

  // If user is logged in, show the underground marketplace with Bosa Shop Dark styling
  if (user) {
    return (
      <div className="space-y-0">
        {/* Hero Section - Underground with Bosa Shop Dark Style */}
        <section className="relative bg-black text-white overflow-hidden">
          {/* Background with luxury items image */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop')] bg-cover bg-center opacity-20"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
                Welcome to UNDERGROUND
              </h1>
              
              <p className="text-2xl md:text-3xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Access the most exclusive and discreet marketplace. Premium products, anonymous transactions, elite clientele only.
              </p>
              
              <div className="flex justify-center mb-16">
                <Link
                  to="/products"
                  className="bg-yellow-400 text-black px-12 py-4 rounded-none font-bold text-lg hover:bg-yellow-300 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  ENTER MARKETPLACE
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Category Blocks - Underground Items */}
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-gray-900 p-8 text-center hover:bg-yellow-400 hover:text-black transition-all duration-300 cursor-pointer group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-black">
                  <Zap className="h-8 w-8 text-black group-hover:text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">PREMIUM CARS</h3>
                <p className="text-yellow-400 group-hover:text-black">Price Range ₹50,00,000 - ₹2,00,00,000</p>
                <ArrowRight className="h-6 w-6 mx-auto mt-4 group-hover:text-black" />
              </div>
              
              <div className="bg-gray-900 p-8 text-center hover:bg-yellow-400 hover:text-black transition-all duration-300 cursor-pointer group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-black">
                  <Shield className="h-8 w-8 text-black group-hover:text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">LUXURY WATCHES</h3>
                <p className="text-yellow-400 group-hover:text-black">Price Range ₹10,00,000 - ₹50,00,000</p>
                <ArrowRight className="h-6 w-6 mx-auto mt-4 group-hover:text-black" />
              </div>
              
              <div className="bg-yellow-400 p-8 text-center text-black cursor-pointer group">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">RARE PAINTINGS</h3>
                <p className="text-black">Price Range ₹50,00,000 - ₹5,00,00,000</p>
                <ArrowRight className="h-6 w-6 mx-auto mt-4 text-black" />
              </div>
              
              <div className="bg-gray-900 p-8 text-center hover:bg-yellow-400 hover:text-black transition-all duration-300 cursor-pointer group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-black">
                  <Lock className="h-8 w-8 text-black group-hover:text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">EXCLUSIVE ITEMS</h3>
                <p className="text-yellow-400 group-hover:text-black">Price Range ₹1,00,00,000 - ₹10,00,00,000</p>
                <ArrowRight className="h-6 w-6 mx-auto mt-4 group-hover:text-black" />
              </div>
            </div>
          </div>
        </section>

        {/* Underground Features Section */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-5xl font-bold text-white mb-6">
                  Complete Underground Collection.
                </h2>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Discover our exclusive collection of premium items. Each product is carefully selected for its rarity, value, and exclusivity. From luxury vehicles to rare artworks, we offer the finest selection for discerning collectors who value discretion and quality.
                </p>
                <div className="flex space-x-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-black font-bold">💎</span>
                    </div>
                    <p className="text-white text-sm">Premium Quality</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-black font-bold">🔒</span>
                    </div>
                    <p className="text-white text-sm">Anonymous</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-black font-bold">⚡</span>
                    </div>
                    <p className="text-white text-sm">Exclusive Access</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop" 
                  alt="Luxury Items" 
                  className="w-full h-96 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-yellow-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-black text-2xl">▶</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Underground Features */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Why Choose Underground?
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Experience the most secure and exclusive marketplace designed for discerning clients
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Complete Anonymity</h3>
                <p className="text-gray-400 leading-relaxed">
                  Your identity is protected with military-grade encryption
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <EyeOff className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Discreet Delivery</h3>
                <p className="text-gray-400 leading-relaxed">
                  Unmarked packaging with no traceable information
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Elite Access</h3>
                <p className="text-gray-400 leading-relaxed">
                  Referral-only system ensures exclusive clientele
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Premium Quality</h3>
                <p className="text-gray-400 leading-relaxed">
                  Only the highest quality products make it to our marketplace
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products - Underground Style */}
        <section className="py-20 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">Featured Products</h2>
                <p className="text-xl text-gray-400">Exclusive selection for elite clients</p>
              </div>
              <Link
                to="/products"
                className="group text-red-400 hover:text-red-300 font-semibold flex items-center transition-colors"
              >
                View All Products
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-700 rounded-2xl shadow-sm p-6 animate-pulse">
                    <div className="bg-gray-600 h-64 rounded-xl mb-4"></div>
                    <div className="bg-gray-600 h-4 rounded mb-2"></div>
                    <div className="bg-gray-600 h-4 rounded w-2/3 mb-4"></div>
                    <div className="bg-gray-600 h-8 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product: any) => (
                  <div key={product.id} className="group bg-gray-700 rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.salePrice && (
                        <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                        </span>
                      )}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors">
                          <Heart className="h-5 w-5 text-gray-300" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-red-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                          {product.salePrice ? (
                            <>
                              <span className="text-xl font-bold text-red-400">
                                ₹{product.salePrice.toLocaleString()}
                              </span>
                              <span className="text-gray-500 line-through">
                                ₹{product.price.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-red-400">
                              ₹{product.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm text-gray-400 ml-1">4.8</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-colors text-center"
                        >
                          View Details
                        </Link>
                        <button className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-500 transition-colors">
                          <ShoppingCart className="h-5 w-5 text-gray-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Underground CTA */}
        <section className="py-20 bg-gradient-to-r from-red-900 to-black text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Access the Underground?
            </h2>
            <p className="text-xl mb-8 text-red-200 leading-relaxed">
              You're already in. Explore our exclusive marketplace with complete anonymity and discretion
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Enter Marketplace
              </Link>
              <Link
                to="/profile"
                className="border-2 border-red-500/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                Your Profile
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Clean Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-8">
              <Shield className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Trusted & Secure Shopping</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-900">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                TRIXX
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover fresh, organic groceries and household essentials in our trusted marketplace. 
              Quality, freshness, and community-driven shopping experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/products"
                className="group bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Explore Products
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                Join with Referral
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10K+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Fresh Items</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">99%</div>
                <div className="text-sm text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose TRIXX?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience trusted shopping with our carefully curated platform designed for quality-conscious customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Authentic Products</h3>
              <p className="text-gray-600 leading-relaxed">
                Every product is verified for authenticity and quality before reaching you
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Lightning-fast delivery with real-time tracking and secure packaging
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Trusted Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Join our referral-based community for exclusive access and special perks
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Premium Experience</h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy a curated shopping experience with personalized recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Fresh Groceries</h2>
              <p className="text-xl text-gray-600">Carefully selected fresh items</p>
            </div>
            <Link
              to="/products"
              className="group text-blue-600 hover:text-blue-700 font-semibold flex items-center transition-colors"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {groceryItems.map((product: any) => (
              <div key={product.id} className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.salePrice && (
                    <span className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                    </span>
                  )}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors">
                      <Heart className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      {product.salePrice ? (
                        <>
                          <span className="text-xl font-bold text-green-600">
                            ₹{product.salePrice.toLocaleString()}
                          </span>
                          <span className="text-gray-500 line-through">
                            ₹{product.price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-green-600">
                          ₹{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">4.9</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to="/products"
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors text-center"
                    >
                      Add to Cart
                    </Link>
                    <button className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <ShoppingCart className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience TRIXX?
          </h2>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            Join our trusted community and discover premium products with unbeatable quality and service
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started Today
            </Link>
            <Link
              to="/products"
              className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home 