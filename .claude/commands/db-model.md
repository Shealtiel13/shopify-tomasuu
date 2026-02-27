Generate a new Sequelize model with migration, controller, and routes for NexusHub.

## Instructions

Follow existing project patterns:
- **Model:** CommonJS (`module.exports`), `timestamps: false`, `freezeTableName: true`, underscored table names
- **Controller:** Full CRUD (getAll, getById, create, update, patch, delete) following `controllers/` patterns
- **Routes:** Express router with auth middleware, following `routes/` patterns
- **Migration:** Sequelize CLI migration in `migrations/`

## Model Details

**Name:** $ARGUMENTS

## Steps
1. Create model in `models/` following existing conventions (see `models/product.js`, `models/Customer.js`)
2. Create migration in `migrations/` with proper up/down methods
3. Create controller in `controllers/` with full CRUD operations
4. Create routes in `routes/` with JWT auth middleware
5. Register routes in `index.js`
6. Define any foreign key associations in the model
