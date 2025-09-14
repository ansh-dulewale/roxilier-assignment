import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      // Allow more realistic name lengths to avoid frequent validation failures
      len: [1, 60],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
    validate: {
      len: [0, 400],
    },
  },
  role: {
    type: DataTypes.ENUM('admin', 'user', 'owner'),
    allowNull: false,
  },
}, {
  timestamps: true,
});

export default User;
