const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Login = sequelize.define('Login', {
  reg_id: DataTypes.BIGINT,
  username: DataTypes.STRING,
  password: DataTypes.STRING
}, {
  tableName: 'login',
  timestamps: false
});

module.exports = Login;
