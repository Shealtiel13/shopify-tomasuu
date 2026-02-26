# NexusHub - Customer & Order Management System

## Overview
NexusHub is a RESTful API backend with a web UI for managing customers, products, orders, and addresses. Built with Express.js, Sequelize ORM, and PostgreSQL.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Auth:** JWT + bcrypt password hashing
- **Frontend:** HTML, Tailwind CSS, vanilla JavaScript
- **Dev:** Nodemon for auto-restart

## Project Structure
```
├── index.js                 # Express entry point
├── config/
│   ├── config.json          # Sequelize CLI config
│   └── database.js          # Sequelize instance
├── models/                  # Sequelize models
│   ├── Customer.js
│   ├── product.js
│   ├── customerorder.js
│   ├── register.js
│   ├── login.js
│   └── address.js
├── controllers/             # Route handlers
│   ├── customerController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── registerController.js
│   ├── loginController.js
│   └── addressController.js
├── routes/                  # Express routes
│   ├── customerRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   ├── registerRoutes.js
│   ├── loginRoutes.js
│   └── addressRoutes.js
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── public/                  # Frontend static files
│   ├── index.html           # Login page
│   ├── register.html        # Registration page
│   └── dashboard.html       # Main dashboard
└── migrations/              # Sequelize migrations
```

## API Endpoints

### Public (no auth required)
- `POST /api/register` — Sign up (creates register + customer + login + address)
- `POST /api/login/authenticate` — Login (returns JWT token)

### Protected (JWT required)
- `GET/POST/PUT/PATCH/DELETE /api/customers`
- `GET/POST/PUT/PATCH/DELETE /api/products`
- `GET/POST/PUT/PATCH/DELETE /api/orders`
- `GET/POST/PUT/PATCH/DELETE /api/addresses`

## Database
- PostgreSQL running on localhost:5432
- Database: thomas_db
- Foreign key relationships:
  - customer.reg_id → register.id
  - address.customer_id → customer.customer_id
  - customer_order.customer_id → customer.customer_id
  - customer_order.product_id → product.product_id

## Running the App
```bash
npm run dev    # Development with nodemon
npm start      # Production
```

## Environment Variables (.env)
```
NODE_ENV, DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT, PORT, JWT_SECRET
```
