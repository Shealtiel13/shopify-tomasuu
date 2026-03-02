const bcrypt = require('bcrypt');
const Register = require('../models/register');
const Customer = require('../models/customer');
const Login = require('../models/login');
const Address = require('../models/address');

// POST create user (signup)
exports.create = async (req, res) => {
  try {
    const role = req.body.role || 'user';
    if (role === 'admin') {
      return res.status(403).json({ error: 'Admin registration is not allowed' });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await Register.create({
      username: req.body.username,
      password: hashedPassword,
      role,
      ...(role === 'user' && {
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: req.body.phone,
        age: req.body.age,
        birth_date: req.body.birth_date
      })
    });

    await Login.create({
      reg_id: user.id,
      username: req.body.username,
      password: hashedPassword
    });

    if (role === 'user') {
      const customer = await Customer.create({
        reg_id: user.id,
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: req.body.phone,
        age: req.body.age,
        birth_date: req.body.birth_date
      });
      await Address.create({
        customer_id: customer.customer_id,
        city: req.body.city,
        postal_code: req.body.postal_code,
        street_address: req.body.street_address
      });
    }

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
