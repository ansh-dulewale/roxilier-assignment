import express from 'express';
import bcrypt from 'bcryptjs';
import { query, validationResult } from 'express-validator';
import User from '../models/User.js';
import Store from '../models/Store.js';
import Rating from '../models/Rating.js';

// Initialize router BEFORE defining routes
const router = express.Router();

// Dashboard stats (align keys with frontend expectations)
router.get('/dashboard', async (_req, res) => {
  try {
    const users = await User.count();
    const stores = await Store.count();
    const ratings = await Rating.count();
    res.json({ users, stores, ratings });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Register new user (admin action)
router.post('/register', async (req, res) => {
  try {
    let { name, email, password, address, role } = req.body;

    // Normalize role from UI to DB enum
    if (role === 'store-owner') role = 'owner';

    // Basic validations matching model constraints
    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role,
    });
    return res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Add new store with owner creation
router.post('/add-store', async (req, res) => {
  try {
    const { name, email, address, ownerName, ownerEmail, ownerPassword, ownerAddress } = req.body;

    if (!name || !email || !address || !ownerName || !ownerEmail || !ownerPassword || !ownerAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check/create owner
    let owner = await User.findOne({ where: { email: ownerEmail } });
    if (!owner) {
      const hashedPassword = await bcrypt.hash(ownerPassword, 10);
      owner = await User.create({
        name: ownerName,
        email: ownerEmail,
        password: hashedPassword,
        address: ownerAddress,
        role: 'owner',
      });
    }

    // Create store linked to owner
    const store = await Store.create({ name, email, address, ownerId: owner.id });
    return res.status(201).json({ message: 'Store and owner created', store, owner });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// List users with optional filtering and sorting
router.get(
  '/users',
  [
    query('name').optional().isString(),
    query('email').optional().isString(),
    query('address').optional().isString(),
    query('role').optional().isString(),
    query('sortBy').optional().isString(),
    query('order').optional().isIn(['asc', 'desc']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, address, role, sortBy = 'name', order = 'asc' } = req.query;
    const where = {};
    if (name) where.name = name;
    if (email) where.email = email;
    if (address) where.address = address;
    if (role) where.role = role === 'store-owner' ? 'owner' : role;
    try {
      const users = await User.findAll({ where, order: [[sortBy, order]] });
      return res.json({ users });
    } catch (_err) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// List stores with optional filtering and sorting
router.get(
  '/stores',
  [
    query('name').optional().isString(),
    query('email').optional().isString(),
    query('address').optional().isString(),
    query('sortBy').optional().isString(),
    query('order').optional().isIn(['asc', 'desc']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, address, sortBy = 'name', order = 'asc' } = req.query;
    const where = {};
    if (name) where.name = name;
    if (email) where.email = email;
    if (address) where.address = address;
    try {
      const stores = await Store.findAll({ where, order: [[sortBy, order]] });
      // Map to include avgRating for frontend compatibility
      const mapped = stores.map((s) => ({ ...s.toJSON(), avgRating: s.rating }));
      return res.json({ stores: mapped });
    } catch (_err) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// User details (with rating info if owner)
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    let ownerRating = null;
    if (user.role === 'owner') {
      const stores = await Store.findAll({ where: { ownerId: user.id } });
      ownerRating = stores.map((store) => ({ storeId: store.id, avgRating: store.rating }));
    }
    return res.json({ user, ownerRating });
  } catch (_err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
