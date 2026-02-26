const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  product_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_name: DataTypes.STRING,
  price: DataTypes.DECIMAL,
  quantity: DataTypes.BIGINT,
  category: DataTypes.STRING,
  description: DataTypes.STRING
}, {
  tableName: 'product',
  timestamps: false
});

module.exports = Product;