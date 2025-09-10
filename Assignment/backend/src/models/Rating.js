import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';
import User from './User.js';
import Store from './Store.js';

const Rating = sequelize.define('Rating', {
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
}, {
  timestamps: true,
});

Rating.belongsTo(User, { foreignKey: 'userId' });
Rating.belongsTo(Store, { foreignKey: 'storeId' });

export default Rating;
