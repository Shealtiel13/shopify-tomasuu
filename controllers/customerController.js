const Customer = require('../models/Customer');
const Register = require('../models/register');
const Login = require('../models/login');
const Address = require('../models/address');

exports.getAll = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    await customer.update(req.body);
    if (customer.reg_id) {
      await Register.update(req.body, { where: { id: customer.reg_id } });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    const regId = customer.reg_id;
    await Address.destroy({ where: { customer_id: customer.customer_id } });
    await customer.destroy();
    if (regId) {
      await Login.destroy({ where: { reg_id: regId } });
      await Register.destroy({ where: { id: regId } });
    }
    res.json({ message: 'Customer, register, login, and address deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};