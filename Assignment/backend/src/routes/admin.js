import express from 'express';
import { query, validationResult } from 'express-validator';
import User from '../models/User.js';
import Store from '../models/Store.js';
import Rating from '../models/Rating.js';

const router = express.Router();

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const userCount = await User.count();
    const storeCount = await Store.count();
    const ratingCount = await Rating.count();
    res.json({ userCount, storeCount, ratingCount });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List users with filtering and sorting
router.get('/users', [
  query('name').optional().isString(),
  query('email').optional().isString(),
  query('address').optional().isString(),
  query('role').optional().isString(),
  query('sortBy').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, address, role, sortBy = 'name', order = 'asc' } = req.query;
  const where = {};
  if (name) where.name = name;
  if (email) where.email = email;
  if (address) where.address = address;
  if (role) where.role = role;
  try {
    const users = await User.findAll({
      where,
      order: [[sortBy, order]],
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List stores with filtering and sorting
router.get('/stores', [
  query('name').optional().isString(),
  query('email').optional().isString(),
  query('address').optional().isString(),
  query('sortBy').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
], async (req, res) => {
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
    const stores = await Store.findAll({
      where,
      order: [[sortBy, order]],
    });
    res.json({ stores });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User details (with rating if store owner)
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    let ownerRating = null;
    if (user.role === 'owner') {
      const stores = await Store.findAll({ where: { ownerId: user.id } });
      ownerRating = stores.map(store => ({ storeId: store.id, avgRating: store.rating }));
    }
    res.json({ user, ownerRating });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
