import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import ReferralCode from '../models/ReferralCode';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Register with referral code
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 2 }),
  body('lastName').trim().isLength({ min: 2 }),
  body('referralCode').trim().isLength({ min: 3 }),
  body('phone').optional().isMobilePhone('any'),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('pincode').optional().trim()
], async (req: Request, res: Response) => {
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

    // Validate referral code: must match a user's referralCode
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(400).json({ error: 'Invalid or expired referral code' });
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      pincode,
      referredBy: referralCode
    });

    // Fallback: ensure referralCode is set (in case pre-save hook fails)
    if (!user.referralCode) {
      user.referralCode = Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select(
      '_id email firstName lastName phone address city state pincode role referralCode createdAt'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: { ...user.toObject(), id: user._id } });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 2 }),
  body('lastName').optional().trim().isLength({ min: 2 }),
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

    const updateData = req.body;
    delete updateData.email; // Prevent email update
    delete updateData.password; // Prevent password update via this route

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      updateData,
      { new: true }
    ).select('_id email firstName lastName phone address city state pincode role referralCode');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'Profile updated successfully', user: { ...user.toObject(), id: user._id } });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router; 