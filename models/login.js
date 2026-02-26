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

const Register = require('./register');
Login.belongsTo(Register, { foreignKey: 'reg_id', targetKey: 'id' });

module.exports = Login;
