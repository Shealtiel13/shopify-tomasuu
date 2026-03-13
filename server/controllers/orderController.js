const crypto = require('crypto');
const CustomerOrder = require('../models/customerorder');
const Customer = require('../models/customer');
const Product = require('../models/product');

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return 'ORN-' + date + '-' + hex;
}

CustomerOrder.belongsTo(Product, { foreignKey: 'product_id', onDelete: 'CASCADE' });

exports.getAll = async (req, res) => {
  try {
    const orders = await CustomerOrder.findAll();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const customer = await Customer.findOne({ where: { reg_id: req.user.reg_id } });
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });
    const orders = await CustomerOrder.findAll({
      where: { customer_id: customer.customer_id },
      include: [{ model: Product, attributes: ['product_name', 'category', 'price', 'image_url'] }],
      order: [['order_id', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const order = await CustomerOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('Order create - req.user:', req.user);
    const customer = await Customer.findOne({ where: { reg_id: req.user.reg_id } });
    console.log('Order create - customer found:', customer ? customer.customer_id : 'NOT FOUND');
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });
    const order = await CustomerOrder.create({
      order_number: generateOrderNumber(),
      product_id: req.body.product_id,
      order_date: req.body.order_date,
      total_amount: req.body.total_amount,
      customer_id: customer.customer_id,
      status: 'Pending',
    });
    console.log('Order create - order created:', order.order_id, 'customer_id:', order.customer_id);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled'];

exports.update = async (req, res) => {
  try {
    const order = await CustomerOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    await order.update(req.body);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.confirmReceived = async (req, res) => {
  try {
    const customer = await Customer.findOne({ where: { reg_id: req.user.reg_id } });
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });
    const order = await CustomerOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== customer.customer_id) return res.status(403).json({ error: 'Not your order' });
    if (order.status !== 'Delivered') return res.status(400).json({ error: 'Order can only be confirmed when Delivered' });
    await order.update({ status: 'Completed' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const customer = await Customer.findOne({ where: { reg_id: req.user.reg_id } });
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });
    const order = await CustomerOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== customer.customer_id) return res.status(403).json({ error: 'Not your order' });
    if (order.status !== 'Pending') return res.status(400).json({ error: 'Only Pending orders can be cancelled' });
    await order.update({ status: 'Cancelled' });
    res.json({ message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const order = await CustomerOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await order.destroy();
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
