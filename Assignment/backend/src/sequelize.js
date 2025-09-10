// Sequelize configuration for MySQL
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('roxilier_db', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;
