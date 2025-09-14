// Seed script for sample users, stores, and ratings (ESM)
import sequelize from './src/sequelize.js';
import User from './src/models/User.js';
import Store from './src/models/Store.js';
import Rating from './src/models/Rating.js';
import bcrypt from 'bcryptjs';

// Helper to recompute and persist average rating per store
async function recomputeStoreRatings() {
  const stores = await Store.findAll();
  for (const store of stores) {
    const ratings = await Rating.findAll({ where: { storeId: store.id } });
    if (ratings.length) {
      const avg = ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
      store.rating = Number(avg.toFixed(2));
      await store.save();
    }
  }
}

async function seed() {
  // 1. Recreate schema first so subsequent inserts use fresh tables
  await sequelize.sync({ force: true });  


  // Only create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Administrator John Smith',
    email: 'admin@example.com',
    address: '123 Admin St',
    password: adminPassword,
    role: 'admin'
  });

  console.log('Seed data inserted successfully.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});