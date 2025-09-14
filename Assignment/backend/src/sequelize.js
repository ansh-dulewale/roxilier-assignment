import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('roxilier_db', 'root', 'Dulewale@12', {
  host: 'localhost',
  dialect: 'mysql',
});

export default sequelize;