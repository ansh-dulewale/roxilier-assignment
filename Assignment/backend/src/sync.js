import sequelize from './sequelize.js';
import User from './models/User.js';
import Store from './models/Store.js';
import Rating from './models/Rating.js';

async function syncModels() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

syncModels();
