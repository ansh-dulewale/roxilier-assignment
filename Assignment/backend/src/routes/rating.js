import express from 'express';
import { body, validationResult } from 'express-validator';
import Rating from '../models/Rating.js';
import Store from '../models/Store.js';
import User from '../models/User.js';
import { broadcast } from '../sse.js';

const router = express.Router();

// Submit or update a rating for a store
router.post('/submit', [
  body('storeId').isInt(),
  body('userId').isInt(),
  body('rating').isInt({ min: 1, max: 5 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { storeId, userId, rating } = req.body;
  try {
    const store = await Store.findByPk(storeId);
    if (!store) return res.status(404).json({ error: 'Store not found' });
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    let userRating = await Rating.findOne({ where: { storeId, userId } });
    if (userRating) {
      userRating.rating = rating;
      await userRating.save();
    } else {
      userRating = await Rating.create({ storeId, userId, rating });
    }
    // Update store's average rating
    const ratings = await Rating.findAll({ where: { storeId } });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    store.rating = avgRating;
    await store.save();
  // Broadcast to SSE subscribers
  broadcast({ type: 'rating:update', storeId, avgRating });
  res.json({ message: 'Rating submitted', userRating, avgRating });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Get all ratings by a specific user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const ratings = await Rating.findAll({
      where: { userId },
      attributes: ['id', 'storeId', 'rating'],
    });
    res.json({ ratings });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


export default router;
