const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Register = sequelize.define('Register', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: DataTypes.STRING,
  password: DataTypes.STRING,
  email: DataTypes.STRING,
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  phone: DataTypes.STRING,
  age: DataTypes.BIGINT,
  birth_date: DataTypes.DATEONLY,
  role: { type: DataTypes.STRING, defaultValue: 'user' }
}, {
  tableName: 'register',
  timestamps: false
});

module.exports = Register;