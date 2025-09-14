
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import sequelize from '../sequelize.js';

const router = express.Router();

// Get user details by id
router.get('/user/id/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'address', 'role']
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout route (JWT-based, just a placeholder for frontend to clear token)
router.post('/logout', (req, res) => {
  // On frontend, simply delete the JWT token from storage
  res.json({ message: 'Logged out successfully' });
});

// Update password route
router.post('/update-password', [
  body('userId').isInt(),
  body('oldPassword').exists(),
  body('newPassword').isLength({ min: 8, max: 16 })
    .matches(/[A-Z]/).withMessage('Must include uppercase letter')
    .matches(/[^A-Za-z0-9]/).withMessage('Must include special character'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { userId, oldPassword, newPassword } = req.body;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Old password incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Registration route
router.post('/register', [
  body('name').isLength({ min: 20, max: 60 }),
  body('email').isEmail(),
  body('address').isLength({ max: 400 }),
  body('password').isLength({ min: 8, max: 16 })
    .matches(/[A-Z]/).withMessage('Must include uppercase letter')
    .matches(/[^A-Za-z0-9]/).withMessage('Must include special character'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, address, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, address, password: hashedPassword, role });
    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', [
  body('email').isEmail(),
  body('password').exists(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user details by email
router.get('/user/email/:email', async (req, res) => {
  let { email } = req.params;
  try {
    // Decode email in case it's URL-encoded
    email = decodeURIComponent(email);
    // Case-insensitive search for email
    const user = await User.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('email')),
        email.toLowerCase()
      ),
      attributes: ['id', 'name', 'email', 'address', 'role']
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
