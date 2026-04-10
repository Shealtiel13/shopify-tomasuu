const Payment = require('../models/payment');
const CustomerOrder = require('../models/customerorder');
const Customer = require('../models/customer');

// Get payment for an order
exports.getByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ where: { order_id: req.params.orderId } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload proof of payment (GCash)
exports.uploadProof = async (req, res) => {
  try {
    const customer = await Customer.findOne({ where: { reg_id: req.user.reg_id } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const order = await CustomerOrder.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== customer.customer_id) return res.status(403).json({ error: 'Not your order' });

    const payment = await Payment.findOne({ where: { order_id: order.order_id } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.method !== 'gcash') return res.status(400).json({ error: 'Proof upload is only for GCash payments' });
    if (payment.status === 'paid') return res.status(400).json({ error: 'Payment already verified' });

    const proof_url = req.file ? '/uploads/' + req.file.filename : null;
    if (!proof_url) return res.status(400).json({ error: 'No file uploaded' });

    const reference_number = req.body.reference_number || null;

    await payment.update({ proof_url, reference_number, status: 'submitted' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: verify payment
exports.verify = async (req, res) => {
  try {
    const payment = await Payment.findOne({ where: { order_id: req.params.orderId } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const { action } = req.body; // 'approve' or 'reject'
    if (action === 'approve') {
      await payment.update({ status: 'paid', paid_at: new Date() });
    } else if (action === 'reject') {
      await payment.update({ status: 'rejected' });
    } else {
      return res.status(400).json({ error: 'Action must be approve or reject' });
    }
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all payments (admin)
exports.getAll = async (req, res) => {
  try {
    const payments = await Payment.findAll({ order: [['created_at', 'DESC']] });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
