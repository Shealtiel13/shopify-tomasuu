const bcrypt = require('bcrypt');
const Customer = require('../models/customer');
const Address = require('../models/address');
const Register = require('../models/register');
const Login = require('../models/login');

exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findOne({ where: { reg_id: req.user.reg_id } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const address = await Address.findOne({ where: { customer_id: customer.customer_id } });

    res.json({
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: customer.phone,
      age: customer.age,
      birth_date: customer.birth_date,
      address: address
        ? { city: address.city, postal_code: address.postal_code, street_address: address.street_address }
        : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { email, first_name, last_name, phone, birth_date } = req.body;
    const customer = await Customer.findOne({ where: { reg_id: req.user.reg_id } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    await customer.update({ email, first_name, last_name, phone, birth_date });
    await Register.update(
      { email, first_name, last_name, phone, birth_date },
      { where: { id: req.user.reg_id } }
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { city, postal_code, street_address } = req.body;
    const customer = await Customer.findOne({ where: { reg_id: req.user.reg_id } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const [address, created] = await Address.findOrCreate({
      where: { customer_id: customer.customer_id },
      defaults: { city, postal_code, street_address },
    });

    if (!created) {
      await address.update({ city, postal_code, street_address });
    }

    res.json({ message: 'Address updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    const register = await Register.findByPk(req.user.reg_id);
    if (!register) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, register.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await register.update({ password: hashed });
    await Login.update({ password: hashed }, { where: { reg_id: req.user.reg_id } });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
