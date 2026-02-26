const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
  address_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id: DataTypes.INTEGER,
  city: DataTypes.STRING,
  postal_code: DataTypes.STRING,
  street_address: DataTypes.STRING
}, {
  tableName: 'address',
  timestamps: false
});

module.exports = Address;
