const CustomerOrder = require('../models/customerorder');
const Customer = require('../models/Customer');
const Product = require('../models/product');

CustomerOrder.belongsTo(Product, { foreignKey: 'product_id' });

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
      include: [{ model: Product, attributes: ['product_name', 'category', 'price'] }],
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
      product_id: req.body.product_id,
      order_date: req.body.order_date,
      total_amount: req.body.total_amount,
      customer_id: customer.customer_id,
    });
    console.log('Order create - order created:', order.order_id, 'customer_id:', order.customer_id);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const order = await CustomerOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await order.update(req.body);
    res.json(order);
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
