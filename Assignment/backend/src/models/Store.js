import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';
import User from './User.js';

const Store = sequelize.define('Store', {
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

Store.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

export default Store;
