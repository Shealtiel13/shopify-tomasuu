const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  payment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  method: { type: DataTypes.STRING, allowNull: false, defaultValue: 'cod' },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
  reference_number: { type: DataTypes.STRING, allowNull: true },
  amount: { type: DataTypes.DECIMAL, allowNull: false },
  proof_url: { type: DataTypes.STRING, allowNull: true },
  paid_at: { type: DataTypes.DATE, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'payment',
  timestamps: false,
});

module.exports = Payment;
