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
  await sequelize.sync({ force: true }); // WARNING: destructive in non-dev environments

  // 2. Create users (admin, owners, regular users)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const ownerPassword = await bcrypt.hash('owner123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await User.create({
    name: 'Administrator John Smith',
    email: 'admin@example.com',
    address: '123 Admin St',
    password: adminPassword,
    role: 'admin'
  });
  const owner1 = await User.create({
    name: 'Store Owner Alice Johnson',
    email: 'owner1@example.com',
    address: '456 Owner Ave',
    password: ownerPassword,
    role: 'owner'
  });
  const owner2 = await User.create({
    name: 'Store Owner Bob Williams',
    email: 'owner2@example.com',
    address: '789 Owner Blvd',
    password: ownerPassword,
    role: 'owner'
  });
  const user1 = await User.create({
    name: 'Regular User Charlie Brown',
    email: 'user1@example.com',
    address: '101 User Rd',
    password: userPassword,
    role: 'user'
  });
  const user2 = await User.create({
    name: 'Regular User Dana White',
    email: 'user2@example.com',
    address: '202 User Ln',
    password: userPassword,
    role: 'user'
  });

  // 3. Create core stores referencing existing owners
  const storeA = await Store.create({
    name: 'Coffee Corner',
    email: 'coffee.corner@corner.com',
    address: '1 Java Lane',
    description: 'Best coffee in town',
    ownerId: owner1.id
  });
  const storeB = await Store.create({
    name: 'Book Haven',
    email: 'book.haven@bookhaven.com',
    address: '22 Library Ave',
    description: 'Wide range of books',
    ownerId: owner2.id
  });
  const storeC = await Store.create({
    name: 'Tech Hub',
    email: 'tech.hub@techhub.com',
    address: '99 Silicon Blvd',
    description: 'Latest gadgets and accessories',
    ownerId: owner1.id
  });

  // 4. Additional sample stores (moved AFTER owner creation)
  await Store.create({
    name: 'Fresh Mart',
    email: 'fresh.mart@freshmart.com',
    address: '12 Market St',
    description: 'Organic groceries and fresh produce',
    ownerId: owner2.id
  });
  await Store.create({
    name: 'Fitness Zone',
    email: 'fitness.zone@fitnesszone.com',
    address: '88 Workout Ave',
    description: 'Gym and fitness equipment',
    ownerId: owner1.id
  });
  await Store.create({
    name: 'Pet Paradise',
    email: 'pet.paradise@petparadise.com',
    address: '7 Animal Rd',
    description: 'Pet supplies and grooming',
    ownerId: owner2.id
  });

  // 5. Create ratings for some stores
  await Rating.create({ storeId: storeA.id, userId: user1.id, rating: 5, comment: 'Amazing coffee!' });
  await Rating.create({ storeId: storeA.id, userId: user2.id, rating: 4, comment: 'Nice ambiance.' });
  await Rating.create({ storeId: storeB.id, userId: user1.id, rating: 3, comment: 'Good selection.' });
  await Rating.create({ storeId: storeC.id, userId: user2.id, rating: 5, comment: 'Great tech deals!' });

  // 6. Recompute average rating column values
  await recomputeStoreRatings();

  console.log('Seed data inserted successfully.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});