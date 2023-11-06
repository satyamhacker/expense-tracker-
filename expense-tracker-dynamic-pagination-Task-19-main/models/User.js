const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ispremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  totalexpense: {
    type: DataTypes.INTEGER,
    defaultValue:0,
},}, {
  tableName: 'usersSignup'  // Specify the correct lowercase table name
});

sequelize.sync()
  .then(() => {
    console.log('Models synchronized with the database');
  })
  .catch((error) => {
    console.error('Error synchronizing models:', error);
  });

module.exports = User;
