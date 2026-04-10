const crypto = require('crypto');
const CustomerOrder = require('../models/customerorder');
const Customer = require('../models/customer');
const Product = require('../models/product');
const OrderStatusHistory = require('../models/orderstatushistory');

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
    const customer = await Customer.findOne({ where: { reg_id: req.user.reg_id } });
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });
    const payment_method = req.body.payment_method || 'cod';
    const order = await CustomerOrder.create({
      order_number: generateOrderNumber(),
      product_id: req.body.product_id,
      order_date: req.body.order_date,
      total_amount: req.body.total_amount,
      customer_id: customer.customer_id,
      status: 'Pending',
      payment_method,
    });
    await Payment.create({
      order_id: order.order_id,
      method: payment_method,
      status: 'pending',
      amount: req.body.total_amount,
    });
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
    await OrderStatusHistory.create({
      order_id: order.order_id,
      from_status: 'Delivered',
      to_status: 'Completed',
      changed_by: req.user.username || 'customer',
      notes: 'Customer confirmed receipt',
    });
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
    const fromStatus = order.status;
    await order.update({ status: 'Cancelled' });
    await OrderStatusHistory.create({
      order_id: order.order_id,
      from_status: fromStatus,
      to_status: 'Cancelled',
      changed_by: req.user.username || 'customer',
      notes: 'Customer cancelled order',
    });
    res.json({ message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: update order status
exports.updateStatus = async (req, res) => {
  try {
    const order = await CustomerOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const { status, notes } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const fromStatus = order.status;
    if (fromStatus === status) {
      return res.status(400).json({ error: 'Order is already ' + status });
    }
    await order.update({ status });
    await OrderStatusHistory.create({
      order_id: order.order_id,
      from_status: fromStatus,
      to_status: status,
      changed_by: req.user.username || 'admin',
      notes: notes || null,
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order tracking history
exports.getTracking = async (req, res) => {
  try {
    const order = await CustomerOrder.findByPk(req.params.id, {
      include: [{ model: Product, attributes: ['product_name', 'category', 'image_url'] }],
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const history = await OrderStatusHistory.findAll({
      where: { order_id: order.order_id },
      order: [['created_at', 'ASC']],
    });
    res.json({ order, history });
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
