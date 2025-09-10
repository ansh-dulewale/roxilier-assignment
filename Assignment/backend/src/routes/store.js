import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Store from '../models/Store.js';
import User from '../models/User.js';

const router = express.Router();

// Add new store (admin only)
router.post('/add', [
  body('name').isLength({ min: 1, max: 60 }),
  body('email').isEmail(),
  body('address').isLength({ max: 400 }),
  body('ownerId').isInt(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, address, ownerId } = req.body;
  try {
    const owner = await User.findByPk(ownerId);
    if (!owner || owner.role !== 'owner') {
      return res.status(400).json({ error: 'Owner not found or not a store owner' });
    }
    const store = await Store.create({ name, email, address, ownerId });
    res.status(201).json({ message: 'Store added', store });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List stores with filtering and sorting
router.get('/list', [
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
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
    });
    res.json({ stores });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
