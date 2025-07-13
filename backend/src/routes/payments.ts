import { Router, Request, Response } from 'express';
import QRCode from 'qrcode';
import { body, param, validationResult } from 'express-validator';
import Order from '../models/Order';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Generate UPI QR code
router.post('/upi/qr', authenticateToken, [
  body('amount').isFloat({ min: 1 }),
  body('orderId').isString()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, orderId } = req.body;

    // Verify order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user!.id
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Generate UPI payment URL
    const upiId = process.env.UPI_ID || 'anonshop@paytm';
    const merchantName = process.env.UPI_NAME || 'Anon Shop';
    const merchantCode = process.env.UPI_MERCHANT_CODE || '123456789';

    const upiUrl = `upi://pay?pa=${upiId}&pn=${merchantName}&mc=${merchantCode}&tr=${order.orderNumber}&am=${amount}&cu=INR`;

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(upiUrl);

    return res.json({
      qrCode: qrCodeDataUrl,
      upiUrl,
      orderNumber: order.orderNumber,
      amount
    });
  } catch (error) {
    console.error('UPI QR generation error:', error);
    return res.status(500).json({ error: 'Failed to generate UPI QR code' });
  }
});

// Update payment status (for webhook or manual update)
router.put('/:orderId/status', authenticateToken, [
  param('orderId').isString(),
  body('status').isIn(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
  body('transactionId').optional().isString()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.params;
    const { status, transactionId } = req.body;

    // Verify order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user!.id
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update payment status
    const updateData: any = { paymentStatus: status };
    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    return res.json({
      message: 'Payment status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Payment status update error:', error);
    return res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Get payment details
router.get('/:orderId', authenticateToken, [
  param('orderId').isString()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user!.id
    }).select('orderNumber paymentMethod paymentStatus total createdAt');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({ payment: order });
  } catch (error) {
    console.error('Payment details fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch payment details' });
  }
});

export default router; 