const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
  history_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  from_status: { type: DataTypes.STRING, allowNull: true },
  to_status: { type: DataTypes.STRING, allowNull: false },
  changed_by: { type: DataTypes.STRING, allowNull: false },
  notes: { type: DataTypes.STRING, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'order_status_history',
  timestamps: false,
});

module.exports = OrderStatusHistory;
