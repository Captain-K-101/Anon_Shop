import { Router, Request, Response } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import Product from '../models/Product';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';

const router = Router();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments({ role: 'USER' });

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'COMPLETED' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get top products (simplified)
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', totalQuantity: { $sum: '$items.quantity' } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await Product.findById(item._id).select('name images');
        return {
          productId: item._id,
          totalQuantity: item.totalQuantity,
          product
        };
      })
    );

    return res.json({
      analytics: {
        totalUsers,
        totalOrders,
        totalRevenue,
        recentOrders,
        topProducts: topProductsWithDetails
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find()
      .select('email firstName lastName role isActive referralCode referredBy createdAt phone address city state pincode')
      .sort({ createdAt: -1 });

    // Get order counts for each user
    const usersWithOrderCounts = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ userId: user._id });
        return {
          ...user.toObject(),
          _count: { orders: orderCount }
        };
      })
    );

    return res.json({ users: usersWithOrderCounts });
  } catch (error) {
    console.error('Users fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user status (admin only)
router.put('/users/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('email firstName lastName role isActive');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('User status update error:', error);
    return res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Create user (admin only)
router.post('/users', authenticateToken, requireAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 2 }),
  body('lastName').trim().isLength({ min: 2 }),
  body('role').isIn(['USER', 'ADMIN']),
  body('referralCode').optional().trim(),
  body('phone').optional().isMobilePhone('any'),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('pincode').optional().trim()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      role,
      referralCode,
      phone,
      address,
      city,
      state,
      pincode
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      referralCode,
      phone,
      address,
      city,
      state,
      pincode,
      isActive: true
    });

    await user.save();

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        referralCode: user.referralCode,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Admin user creation error:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// Admin reset user password
router.put('/users/:id/password', authenticateToken, requireAdmin, [
  body('password').isLength({ min: 6 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    ).select('email firstName lastName role isActive');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ message: 'Password reset successfully', user });
  } catch (error) {
    console.error('Admin password reset error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Referral tree endpoint
router.get('/referral-tree', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Fetch all users
    const users = await User.find().select('_id firstName lastName email avatar referralCode referredBy createdAt role isActive');
    // Build a map for quick lookup
    const userMap = new Map();
    users.forEach(user => userMap.set(user.referralCode, user.toObject()));
    // Build tree nodes
    const buildTree = (parentReferralCode: string | null = null): any[] => {
      return users
        .filter(user => (user.referredBy || null) === parentReferralCode)
        .map(user => {
          const node: any = user.toObject();
          node.referrals = buildTree(user.referralCode);
          return node;
        });
    };
    // Roots: users with no referrer
    const tree = buildTree(null);
    return res.json({ tree });
  } catch (error) {
    console.error('Referral tree fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch referral tree' });
  }
});

// Get user details, orders, and logs (admin only)
router.get('/users/:id/details', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const orders = await Order.find({ userId: id })
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 });
    // Placeholder for logs (extend as needed)
    const logs = [
      { type: 'login', message: 'User logged in', date: user.createdAt },
      { type: 'register', message: 'User registered', date: user.createdAt }
    ];
    return res.json({ user, orders, logs });
  } catch (error) {
    console.error('Admin user details fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Flag or unflag a user (admin only)
router.post('/users/:id/flag', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { flagged } = req.body;
    const user = await User.findByIdAndUpdate(id, { flagged }, { new: true }).select('firstName lastName email flagged');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ message: `User has been ${flagged ? 'flagged' : 'unflagged'}.`, user });
  } catch (error) {
    console.error('Admin flag user error:', error);
    return res.status(500).json({ error: 'Failed to flag user' });
  }
});

// Update user details (admin only)
router.put('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    delete updateData.password; // Prevent password update here
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Admin user update error:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get delivery personnel (admin only)
router.get('/users/delivery-personnel', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({ role: 'DELIVERY' })
      .select('_id firstName lastName email phone')
      .sort({ firstName: 1 });
    
    return res.json({ users });
  } catch (error) {
    console.error('Delivery personnel fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch delivery personnel' });
  }
});

// Assign or unassign a delivery person to an order (admin only)
router.put('/orders/:id/assign-delivery', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { deliveryPersonId } = req.body;
    const order = await Order.findByIdAndUpdate(
      id,
      { deliveryPersonId: deliveryPersonId || null },
      { new: true }
    ).populate('deliveryPersonId', 'firstName lastName email');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json({ message: deliveryPersonId ? 'Delivery person assigned.' : 'Delivery person unassigned.', order });
  } catch (error) {
    console.error('Assign delivery person error:', error);
    return res.status(500).json({ error: 'Failed to assign delivery person' });
  }
});

export default router; 