import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import ReferralCode from '../models/ReferralCode';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user's referral code
router.get('/code', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select('referralCode');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ referralCode: user.referralCode });
  } catch (error) {
    console.error('Referral code fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch referral code' });
  }
});

// Get user's referral statistics
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const referredUsers = await User.find({ referredBy: req.user!.referralCode })
      .select('firstName lastName email createdAt')
      .sort({ createdAt: -1 });

    return res.json({
      referralCode: req.user!.referralCode,
      totalReferrals: referredUsers.length,
      referredUsers
    });
  } catch (error) {
    console.error('Referral stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch referral statistics' });
  }
});

// Create referral code (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('code').trim().isLength({ min: 3 }),
  body('userId').isString(),
  body('maxUsage').optional().isInt({ min: 1 }),
  body('expiresAt').optional().isISO8601()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, userId, maxUsage, expiresAt } = req.body;

    // Check if code already exists
    const existingCode = await ReferralCode.findOne({ code });

    if (existingCode) {
      return res.status(400).json({ error: 'Referral code already exists' });
    }

    // Verify user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const referralCode = new ReferralCode({
      code,
      userId,
      maxUsage,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await referralCode.save();

    return res.status(201).json({
      message: 'Referral code created successfully',
      referralCode
    });
  } catch (error) {
    console.error('Referral code creation error:', error);
    return res.status(500).json({ error: 'Failed to create referral code' });
  }
});

// Get all referral codes (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const referralCodes = await ReferralCode.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return res.json({ referralCodes });
  } catch (error) {
    console.error('Admin referral codes fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch referral codes' });
  }
});

// Update referral code (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('isActive').optional().isBoolean(),
  body('maxUsage').optional().isInt({ min: 1 }),
  body('expiresAt').optional().isISO8601()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    if (updateData.expiresAt) {
      updateData.expiresAt = new Date(updateData.expiresAt);
    }

    const referralCode = await ReferralCode.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'firstName lastName email');

    if (!referralCode) {
      return res.status(404).json({ error: 'Referral code not found' });
    }

    return res.json({
      message: 'Referral code updated successfully',
      referralCode
    });
  } catch (error) {
    console.error('Referral code update error:', error);
    return res.status(500).json({ error: 'Failed to update referral code' });
  }
});

export default router; 