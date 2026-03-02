const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  customer_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reg_id: DataTypes.BIGINT,
  email: DataTypes.STRING,
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  phone: DataTypes.STRING,
  age: DataTypes.INTEGER,
  birth_date: DataTypes.DATEONLY
}, {
  tableName: 'customer',
  timestamps: false
});

module.exports = Customer;