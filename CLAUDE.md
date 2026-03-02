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
├── .sequelizerc             # Points Sequelize CLI to server/
├── package.json
├── .env
├── server/
│   ├── index.js             # Express entry point
│   ├── config/
│   │   ├── config.json      # Sequelize CLI config
│   │   └── database.js      # Sequelize instance
│   ├── models/              # Sequelize models
│   ├── controllers/         # Route handlers
│   ├── routes/              # Express routes
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── migrations/          # Sequelize migrations
│   └── seeders/
├── public/                  # Built frontend output
└── client/                  # React/Vite frontend source
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
