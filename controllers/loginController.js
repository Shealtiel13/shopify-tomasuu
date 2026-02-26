const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Login = require('../models/login');
const Register = require('../models/register');

// GET all logins
exports.getAll = async (req, res) => {
  try {
    const logins = await Login.findAll({ attributes: ['id', 'reg_id', 'username', 'password'] });
    res.json(logins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH update login
exports.update = async (req, res) => {
  try {
    const login = await Login.findByPk(req.params.id);
    if (!login) return res.status(404).json({ error: 'Login not found' });
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    await login.update(updateData);
    res.json(login);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE login
exports.delete = async (req, res) => {
  try {
    const login = await Login.findByPk(req.params.id);
    if (!login) return res.status(404).json({ error: 'Login not found' });
    await login.destroy();
    res.json({ message: 'Login deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST authenticate user
exports.authenticate = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const login = await Login.findOne({ where: { username } });
    if (!login) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const match = await bcrypt.compare(password, login.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = await Register.findByPk(login.reg_id);
    const role = user ? user.role : 'user';
    const token = jwt.sign(
      { reg_id: login.reg_id, username: login.username, role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ message: 'Login successful', token, role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
