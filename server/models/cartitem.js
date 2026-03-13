const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CartItem = sequelize.define('CartItem', {
  cart_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cart_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  price_at_add: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, {
  tableName: 'cart_item',
  timestamps: true
});

module.exports = CartItem;
