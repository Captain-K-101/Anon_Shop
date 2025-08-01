import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import Order from '../models/Order';
import Product from '../models/Product';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import User from '../models/User';

const router = Router();

// Create order
router.post('/', authenticateToken, [
  body('items').isArray({ min: 1 }),
  body('items.*.productId').isString(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('paymentMethod').isIn(['UPI', 'COD']),
  body('shippingAddress').trim().isLength({ min: 10 }),
  body('billingAddress').trim().isLength({ min: 10 }),
  body('notes').optional().trim()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      items,
      paymentMethod,
      shippingAddress,
      billingAddress,
      notes
    } = req.body;

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product || !product.isActive) {
        return res.status(400).json({ 
          error: `Product ${item.productId} not found or inactive` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}` 
        });
      }

      const price = product.salePrice || product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: price
      });
    }

    // Calculate taxes and shipping
    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal > 1000 ? 0 : 100; // Free shipping above ₹1000
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = new Order({
      userId: req.user!.id,
      orderNumber,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      billingAddress,
      notes,
      items: orderItems
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('items.productId', 'name images');

    return res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user orders
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ userId: req.user!.id })
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 });

    // Transform each order's items to have 'product' instead of 'productId'
    const ordersTransformed = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.map((item: any) => ({
        ...item,
        product: item.productId, // populated product
        productId: undefined // remove productId
      }));
      return orderObj;
    });

    return res.json({ orders: ordersTransformed });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:id', authenticateToken, [
  param('id').isString()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const order = await Order.findOne({ 
      _id: id,
      userId: req.user!.id 
    }).populate('items.productId', 'name images sku');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Transform items to have 'product' instead of 'productId'
    const orderObj = order.toObject();
    orderObj.items = orderObj.items.map((item: any) => ({
      ...item,
      product: item.productId, // populated product
      productId: undefined // remove productId
    }));

    return res.json({ order: orderObj });
  } catch (error) {
    console.error('Order fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, [
  param('id').isString(),
  body('status').isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  body('paymentStatus').optional().isIn(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updateData: any = { status };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('items.productId', 'name images');

    return res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Order status update error:', error);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get all orders (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'firstName lastName email')
      .populate('items.productId', 'name images')
      .populate('deliveryPersonId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return res.json({ orders });
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Middleware to require delivery role
function requireDelivery(req: AuthRequest, res: Response, next: Function) {
  if (!req.user || req.user.role !== 'DELIVERY') {
    return res.status(403).json({ error: 'Access denied' });
  }
  return next();
}

// Delivery personnel: fetch assigned orders
router.get('/delivery/assigned', authenticateToken, requireDelivery, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ deliveryPersonId: req.user!.id })
      .populate('userId', 'firstName lastName email phone')
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (error) {
    console.error('Delivery fetch orders error:', error);
    return res.status(500).json({ error: 'Failed to fetch assigned orders' });
  }
});

// Delivery personnel: update delivery status for an assigned order
router.put('/:id/delivery-status', authenticateToken, requireDelivery, [
  param('id').isString(),
  body('status').isIn(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'])
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    
    // Only allow update if assigned to this delivery person
    const order = await Order.findOne({ _id: id, deliveryPersonId: req.user!.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found or not assigned to you' });
    }
    
    order.status = status;
    await order.save();
    
    const updatedOrder = await Order.findById(id)
      .populate('userId', 'firstName lastName email phone')
      .populate('items.productId', 'name images');
    
    return res.json({ message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    console.error('Delivery update status error:', error);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router; 