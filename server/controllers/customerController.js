const { Op } = require('sequelize');
const Customer = require('../models/customer');
const Register = require('../models/register');
const Login = require('../models/login');
const Address = require('../models/address');
const CustomerOrder = require('../models/customerorder');
const Product = require('../models/product');

exports.getAll = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: {
        first_name: { [Op.not]: null, [Op.ne]: '' }
      }
    });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const address = await Address.findOne({ where: { customer_id: customer.customer_id } });
    const orders = await CustomerOrder.findAll({ where: { customer_id: customer.customer_id } });

    const productIds = [...new Set(orders.map(o => o.product_id).filter(Boolean))];
    const products = productIds.length > 0
      ? await Product.findAll({ where: { product_id: { [Op.in]: productIds } } })
      : [];
    const productMap = Object.fromEntries(products.map(p => [p.product_id, p]));

    const ordersWithProduct = orders.map(o => ({
      ...o.toJSON(),
      product: productMap[o.product_id] || null,
    }));

    res.json({ ...customer.toJSON(), address: address || null, orders: ordersWithProduct });
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