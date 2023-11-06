const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const User = require('./User'); // Import the User model if you haven't already

const Expense = sequelize.define('Expense', {
  expenseamount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },}, {
    tableName: 'addexpenses'  // Specify the correct lowercase table name
  });

Expense.belongsTo(User, { foreignKey: 'loginuserid', onDelete: 'CASCADE' });
User.hasMany(Expense, { foreignKey: 'loginuserid', onDelete: 'CASCADE' });

sequelize.sync()
  .then(() => {
    console.log('Models synchronized with the database');
  })
  .catch((error) => {
    console.error('Error synchronizing models:', error);
  });

module.exports = Expense;
