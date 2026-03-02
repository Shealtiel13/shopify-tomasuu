const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomerOrder = sequelize.define('CustomerOrder', {
  order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id: DataTypes.INTEGER,
  product_id: DataTypes.INTEGER,
  order_date: DataTypes.DATE,
  total_amount: DataTypes.DECIMAL
}, {
  tableName: 'customer_order',
  timestamps: false
});

module.exports = CustomerOrder;