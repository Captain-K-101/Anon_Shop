import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Star,
  TrendingUp,
  DollarSign,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import ProductModal from '../components/ProductModal';
import api from '../lib/axios';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  categoryId: {
    _id: string;
    name: string;
  };
  stock: number;
  sku: string;
  weight?: number;
  dimensions?: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'not-featured'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products?limit=100');
      setProducts(response.data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setDeletingProduct(productId);
    try {
      await api.delete(`/api/products/${productId}`);
      setProducts(products.filter(product => product._id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    } finally {
      setDeletingProduct(null);
    }
  };

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      await api.put(`/api/products/${productId}`, { isActive });
      setProducts(products.map(product => 
        product._id === productId ? { ...product, isActive } : product
      ));
    } catch (err) {
      console.error('Error updating product status:', err);
      alert('Failed to update product status');
    }
  };

  const toggleFeatured = async (productId: string, isFeatured: boolean) => {
    try {
      await api.put(`/api/products/${productId}`, { isFeatured });
      setProducts(products.map(product => 
        product._id === productId ? { ...product, isFeatured } : product
      ));
    } catch (err) {
      console.error('Error updating product featured status:', err);
      alert('Failed to update product featured status');
    }
  };

  const openProductModal = (product?: Product) => {
    setSelectedProduct(product || null);
    setIsCreating(!product);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (productData: any) => {
    setIsSaving(true);
    try {
      let response;
      if (isCreating) {
        response = await api.post('/api/products', productData);
      } else {
        response = await api.put(`/api/products/${selectedProduct?._id}`, productData);
      }

      const data = response.data;
      
      if (isCreating) {
        setProducts([data.product, ...products]);
      } else {
        setProducts(products.map(p => 
          p._id === selectedProduct?._id ? data.product : p
        ));
      }

      setShowProductModal(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product');
    } finally {
      setIsSaving(false);
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
      year: 'numeric'
    });
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.categoryId._id === categoryFilter;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && product.isActive) ||
      (statusFilter === 'inactive' && !product.isActive);
    const matchesFeatured = 
      featuredFilter === 'all' || 
      (featuredFilter === 'featured' && product.isFeatured) ||
      (featuredFilter === 'not-featured' && !product.isFeatured);

    return matchesSearch && matchesCategory && matchesStatus && matchesFeatured;
  });

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const featuredProducts = products.filter(p => p.isFeatured).length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white shadow-md rounded-lg p-8 flex flex-col items-center border border-red-200 max-w-md w-full">
          <div className="mb-4">
            <Package className="h-10 w-10 text-red-400 mb-2" />
            <div className="text-red-600 text-lg font-semibold">Error loading products</div>
            <div className="text-gray-500 text-sm mt-1">{error}</div>
          </div>
          <button 
            onClick={fetchProducts}
            className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Product Management Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 mt-2 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1 text-base">Manage your product catalog and inventory</p>
        </div>
        <button
          onClick={() => openProductModal()}
          className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center py-5 px-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 mb-2">
            <Package className="h-6 w-6 text-blue-500" />
          </div>
          <div className="text-xs text-gray-500 font-medium mb-1">Total Products</div>
          <div className="text-2xl font-bold text-gray-900">{totalProducts}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center py-5 px-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 mb-2">
            <Eye className="h-6 w-6 text-green-500" />
          </div>
          <div className="text-xs text-gray-500 font-medium mb-1">Active Products</div>
          <div className="text-2xl font-bold text-gray-900">{activeProducts}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center py-5 px-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-50 mb-2">
            <Star className="h-6 w-6 text-purple-500" />
          </div>
          <div className="text-xs text-gray-500 font-medium mb-1">Featured Products</div>
          <div className="text-2xl font-bold text-gray-900">{featuredProducts}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center py-5 px-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 mb-2">
            <TrendingUp className="h-6 w-6 text-red-500" />
          </div>
          <div className="text-xs text-gray-500 font-medium mb-1">Low Stock</div>
          <div className="text-2xl font-bold text-gray-900">{lowStockProducts}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full max-w-lg">
            <form
              onSubmit={e => { e.preventDefault(); }}
              className="relative flex items-center"
            >
              <input
                type="text"
                placeholder="Search products by name, SKU, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </span>
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1 text-sm font-medium shadow"
                tabIndex={-1}
              >
                Search
              </button>
            </form>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Products</option>
              <option value="featured">Featured Only</option>
              <option value="not-featured">Not Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Product Image */}
            <div className="relative h-48 bg-gray-100">
              {product.images && product.images[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Status Badges */}
              <div className="absolute top-2 left-2 flex space-x-1">
                {!product.isActive && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    Inactive
                  </span>
                )}
                {product.isFeatured && (
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    Featured
                  </span>
                )}
                {product.stock < 10 && (
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    Low Stock
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  onClick={() => openProductModal(product)}
                  className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                  title="Edit Product"
                >
                  <Edit className="h-3 w-3 text-gray-600" />
                </button>
                <button
                  onClick={() => deleteProduct(product._id)}
                  disabled={deletingProduct === product._id}
                  className="p-1 bg-white rounded-full shadow-sm hover:bg-red-50 disabled:opacity-50"
                  title="Delete Product"
                >
                  {deletingProduct === product._id ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="h-3 w-3 text-red-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="mb-2">
                <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                <p className="text-xs text-gray-500">{product.sku}</p>
              </div>

              <div className="mb-3">
                <div className="flex items-center space-x-2">
                  {product.salePrice ? (
                    <>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.salePrice)}
                      </span>
                      <span className="text-xs text-gray-500 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Stock: {product.stock}</span>
                <span>{product.categoryId.name}</span>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleProductStatus(product._id, !product.isActive)}
                  className={`text-xs px-2 py-1 rounded ${
                    product.isActive 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {product.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => toggleFeatured(product._id, !product.isFeatured)}
                  className={`text-xs px-2 py-1 rounded ${
                    product.isFeatured 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  {product.isFeatured ? 'Unfeature' : 'Feature'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No products found matching your criteria</p>
          <button
            onClick={() => openProductModal()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Your First Product
          </button>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        categories={categories}
        onSave={handleSaveProduct}
        isSaving={isSaving}
      />
    </div>
  );
};

export default AdminProducts; 