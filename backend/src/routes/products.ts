import { Router, Request, Response } from 'express';
import { query, param, body, validationResult } from 'express-validator';
import Product from '../models/Product';
import Category from '../models/Category';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all products with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('featured').optional().isBoolean()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      featured
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    const query: any = { isActive: true };

    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        query.categoryId = categoryDoc._id;
      }
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Get products with category
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    return res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', [
  param('id').isString()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('categoryId', 'name description');

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ product });
  } catch (error) {
    console.error('Product fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('name').trim().isLength({ min: 2 }),
  body('description').trim().isLength({ min: 10 }),
  body('price').isFloat({ min: 0 }),
  body('salePrice').optional().isFloat({ min: 0 }),
  body('categoryId').isString(),
  body('stock').isInt({ min: 0 }),
  body('sku').isString(),
  body('weight').optional().isFloat({ min: 0 }),
  body('dimensions').optional().isString(),
  body('images').isArray(),
  body('images.*').isURL()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      price,
      salePrice,
      categoryId,
      stock,
      sku,
      weight,
      dimensions,
      images,
      isFeatured = false
    } = req.body;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });

    if (existingProduct) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }

    const product = new Product({
      name,
      description,
      price,
      salePrice,
      categoryId,
      stock,
      sku,
      weight,
      dimensions,
      images,
      isFeatured
    });

    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('categoryId', 'name');

    return res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Product creation error:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  param('id').isString(),
  body('name').optional().trim().isLength({ min: 2 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('price').optional().isFloat({ min: 0 }),
  body('salePrice').optional().isFloat({ min: 0 }),
  body('categoryId').optional().isString(),
  body('stock').optional().isInt({ min: 0 }),
  body('sku').optional().isString(),
  body('weight').optional().isFloat({ min: 0 }),
  body('dimensions').optional().isString(),
  body('images').optional().isArray(),
  body('images.*').optional().isURL(),
  body('isActive').optional().isBoolean(),
  body('isFeatured').optional().isBoolean()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if SKU is being changed and if it already exists
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const skuExists = await Product.findOne({ sku: updateData.sku });
      if (skuExists) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    // Verify category if being updated
    if (updateData.categoryId) {
      const category = await Category.findById(updateData.categoryId);
      if (!category) {
        return res.status(400).json({ error: 'Category not found' });
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('categoryId', 'name');

    return res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Product update error:', error);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, [
  param('id').isString()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Product deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router; 