const express = require('express');
require('dotenv').config();

const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/register', require('./routes/registerRoutes'));
app.use('/api/login', require('./routes/loginRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/ai', require('./routes/aiAssistantRoutes'));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
