import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import Category from '../models/Category';
import Product from '../models/Product';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 });

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          categoryId: category._id, 
          isActive: true 
        });
        return {
          ...category.toObject(),
          _count: { products: productCount }
        };
      })
    );

    return res.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category with products
router.get('/:id', [
  param('id').isString()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category || !category.isActive) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get products for this category
    const products = await Product.find({ 
      categoryId: category._id, 
      isActive: true 
    }).sort({ createdAt: -1 });

    const productCount = await Product.countDocuments({ 
      categoryId: category._id, 
      isActive: true 
    });

    const categoryWithProducts = {
      ...category.toObject(),
      products,
      _count: { products: productCount }
    };

    return res.json({ category: categoryWithProducts });
  } catch (error) {
    console.error('Category fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create category (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('name').trim().isLength({ min: 2 }),
  body('description').optional().trim(),
  body('image').optional().isURL()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, image } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = new Category({ name, description, image });
    await category.save();

    return res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Category creation error:', error);
    return res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  param('id').isString(),
  body('name').optional().trim().isLength({ min: 2 }),
  body('description').optional().trim(),
  body('image').optional().isURL(),
  body('isActive').optional().isBoolean()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if category exists
    const existingCategory = await Category.findById(id);

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // If name is being updated, check for duplicates
    if (updateData.name && updateData.name !== existingCategory.name) {
      const duplicateCategory = await Category.findOne({ name: updateData.name });

      if (duplicateCategory) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Category update error:', error);
    return res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, requireAdmin, [
  param('id').isString()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ 
      categoryId: category._id, 
      isActive: true 
    });

    if (productCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing products' 
      });
    }

    // Soft delete
    await Category.findByIdAndUpdate(id, { isActive: false });

    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Category deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router; 