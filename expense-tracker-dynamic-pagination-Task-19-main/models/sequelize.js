const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('expensetracker', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;
