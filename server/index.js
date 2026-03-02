const express = require('express');
require('dotenv').config();

const path = require('path');
const { Op } = require('sequelize');
const Customer = require('./models/customer');
const Address = require('./models/address');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/register', require('./routes/registerRoutes'));
app.use('/api/login', require('./routes/loginRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/ai', require('./routes/aiAssistantRoutes'));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    const staleCustomers = await Customer.findAll({
      where: {
        first_name: { [Op.or]: [null, ''] },
        last_name: { [Op.or]: [null, ''] },
        email: { [Op.or]: [null, ''] }
      },
      attributes: ['customer_id']
    });

    if (staleCustomers.length > 0) {
      const staleIds = staleCustomers.map(c => c.customer_id);
      await Address.destroy({ where: { customer_id: staleIds } });
      await Customer.destroy({ where: { customer_id: staleIds } });
      console.log(`Cleaned up ${staleIds.length} stale customer row(s)`);
    }
  } catch (err) {
    console.error('Cleanup failed:', err.message);
  }
});
