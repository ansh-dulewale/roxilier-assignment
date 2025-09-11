// Seed script for sample users, stores, and ratings (ESM)
import sequelize from './src/sequelize.js';
import User from './src/models/User.js';
import Store from './src/models/Store.js';
import Rating from './src/models/Rating.js';

async function seed() {
  // Additional sample stores
  await Store.create({
    name: 'Fresh Mart',
    email: 'contact@freshmart.com',
    address: '12 Market St',
    description: 'Organic groceries and fresh produce',
    ownerId: owner2.id
  });
  await Store.create({
    name: 'Fitness Zone',
    email: 'info@fitnesszone.com',
    address: '88 Workout Ave',
    description: 'Gym and fitness equipment',
    ownerId: owner1.id
  });
  await Store.create({
    name: 'Pet Paradise',
    email: 'hello@petparadise.com',
    address: '7 Animal Rd',
    description: 'Pet supplies and grooming',
    ownerId: owner2.id
  });
  await sequelize.sync({ force: true }); // WARNING: This will drop all tables!

  // Create users
  const admin = await User.create({
    name: 'Administrator John Smith',
    email: 'admin@example.com',
    address: '123 Admin St',
    password: 'admin123',
    role: 'admin'
  });
  const owner1 = await User.create({
    name: 'Store Owner Alice Johnson',
    email: 'owner1@example.com',
    address: '456 Owner Ave',
    password: 'owner123',
  role: 'owner'
  });
  const owner2 = await User.create({
    name: 'Store Owner Bob Williams',
    email: 'owner2@example.com',
    address: '789 Owner Blvd',
    password: 'owner123',
  role: 'owner'
  });
  const user1 = await User.create({
    name: 'Regular User Charlie Brown',
    email: 'user1@example.com',
    address: '101 User Rd',
    password: 'user123',
    role: 'user'
  });
  const user2 = await User.create({
    name: 'Regular User Dana White',
    email: 'user2@example.com',
    address: '202 User Ln',
    password: 'user123',
    role: 'user'
  });

  // Create stores
  const storeA = await Store.create({
    name: 'Coffee Corner',
    email: 'coffee@corner.com',
    address: '1 Java Lane',
    description: 'Best coffee in town',
    ownerId: owner1.id
  });
  const storeB = await Store.create({
    name: 'Book Haven',
    email: 'info@bookhaven.com',
    address: '22 Library Ave',
    description: 'Wide range of books',
    ownerId: owner2.id
  });
  const storeC = await Store.create({
    name: 'Tech Hub',
    email: 'contact@techhub.com',
    address: '99 Silicon Blvd',
    description: 'Latest gadgets and accessories',
    ownerId: owner1.id
  });

  // Create ratings
  await Rating.create({ storeId: storeA.id, userId: user1.id, rating: 5, comment: 'Amazing coffee!' });
  await Rating.create({ storeId: storeA.id, userId: user2.id, rating: 4, comment: 'Nice ambiance.' });
  await Rating.create({ storeId: storeB.id, userId: user1.id, rating: 3, comment: 'Good selection.' });
  await Rating.create({ storeId: storeC.id, userId: user2.id, rating: 5, comment: 'Great tech deals!' });

  console.log('Seed data inserted successfully.');
  process.exit();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});