const sequelize = require('../config/database');
const crypto = require('crypto');
const Cart = require('../models/cart');
const CartItem = require('../models/cartitem');
const Product = require('../models/product');
const Customer = require('../models/customer');
const CustomerOrder = require('../models/customerorder');

Cart.hasMany(CartItem, { foreignKey: 'cart_id', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id' });

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return 'ORN-' + date + '-' + hex;
}

async function getCustomer(req) {
  return Customer.findOne({ where: { reg_id: req.user.reg_id } });
}

async function findOrCreateCart(customerId) {
  const [cart] = await Cart.findOrCreate({ where: { customer_id: customerId } });
  return cart;
}

exports.getCart = async (req, res) => {
  try {
    const customer = await getCustomer(req);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const cart = await findOrCreateCart(customer.customer_id);
    const items = await CartItem.findAll({
      where: { cart_id: cart.cart_id },
      include: [{ model: Product, attributes: ['product_id', 'product_name', 'price', 'quantity', 'category', 'image_url'] }],
      order: [['createdAt', 'ASC']]
    });

    res.json({ cart_id: cart.cart_id, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id is required' });

    const customer = await getCustomer(req);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.quantity <= 0) return res.status(400).json({ error: 'Product is out of stock' });

    const cart = await findOrCreateCart(customer.customer_id);

    const existing = await CartItem.findOne({
      where: { cart_id: cart.cart_id, product_id }
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.quantity) {
        return res.status(400).json({ error: 'Not enough stock. Available: ' + product.quantity });
      }
      await existing.update({ quantity: newQty, price_at_add: product.price });
      const item = await CartItem.findByPk(existing.cart_item_id, {
        include: [{ model: Product, attributes: ['product_id', 'product_name', 'price', 'quantity', 'category', 'image_url'] }]
      });
      return res.json(item);
    }

    if (quantity > product.quantity) {
      return res.status(400).json({ error: 'Not enough stock. Available: ' + product.quantity });
    }

    const newItem = await CartItem.create({
      cart_id: cart.cart_id,
      product_id,
      quantity,
      price_at_add: product.price
    });

    const item = await CartItem.findByPk(newItem.cart_item_id, {
      include: [{ model: Product, attributes: ['product_id', 'product_name', 'price', 'quantity', 'category', 'image_url'] }]
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await CartItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Cart item not found' });

    const { quantity } = req.body;
    if (quantity <= 0) {
      await item.destroy();
      return res.json({ message: 'Item removed' });
    }

    const product = await Product.findByPk(item.product_id);
    if (quantity > product.quantity) {
      return res.status(400).json({ error: 'Not enough stock. Available: ' + product.quantity });
    }

    await item.update({ quantity });
    const updated = await CartItem.findByPk(item.cart_item_id, {
      include: [{ model: Product, attributes: ['product_id', 'product_name', 'price', 'quantity', 'category', 'image_url'] }]
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const item = await CartItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Cart item not found' });
    await item.destroy();
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const customer = await getCustomer(req);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const cart = await Cart.findOne({ where: { customer_id: customer.customer_id } });
    if (!cart) return res.json({ message: 'Cart is already empty' });

    await CartItem.destroy({ where: { cart_id: cart.cart_id } });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkout = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const customer = await getCustomer(req);
    if (!customer) { await t.rollback(); return res.status(404).json({ error: 'Customer not found' }); }

    const cart = await Cart.findOne({ where: { customer_id: customer.customer_id } });
    if (!cart) { await t.rollback(); return res.status(400).json({ error: 'Cart is empty' }); }

    const where = { cart_id: cart.cart_id };
    if (req.body.cart_item_ids && req.body.cart_item_ids.length > 0) {
      where.cart_item_id = req.body.cart_item_ids;
    }

    const items = await CartItem.findAll({
      where,
      include: [{ model: Product }]
    });

    if (items.length === 0) { await t.rollback(); return res.status(400).json({ error: 'No items to checkout' }); }

    // Validate stock
    for (const item of items) {
      if (item.Product.quantity < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          error: 'Not enough stock for ' + item.Product.product_name + '. Available: ' + item.Product.quantity
        });
      }
    }

    // Create orders and decrement stock
    const orders = [];
    for (const item of items) {
      await Product.update(
        { quantity: item.Product.quantity - item.quantity },
        { where: { product_id: item.product_id }, transaction: t }
      );

      const order = await CustomerOrder.create({
        order_number: generateOrderNumber(),
        customer_id: customer.customer_id,
        product_id: item.product_id,
        order_date: new Date(),
        total_amount: Number(item.price_at_add) * item.quantity,
        status: 'Pending'
      }, { transaction: t });

      orders.push(order);
    }

    await CartItem.destroy({ where: { cart_item_id: items.map(i => i.cart_item_id) }, transaction: t });
    await t.commit();

    res.json({ message: 'Checkout successful', orders });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};
