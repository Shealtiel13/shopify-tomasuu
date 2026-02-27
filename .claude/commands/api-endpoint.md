Add a new API endpoint to NexusHub following existing CRUD patterns.

## Instructions

Follow existing patterns in `controllers/` and `routes/`:
- Controller function with try/catch, proper status codes, JSON responses
- Route registered with appropriate HTTP method
- Auth middleware (`middleware/auth.js`) applied for protected routes
- Admin middleware for admin-only routes where needed
- Input validation and error handling

## Endpoint Details

**Description:** $ARGUMENTS

## Steps
1. Add controller function in the appropriate `controllers/` file
2. Add route in the corresponding `routes/` file with auth/admin middleware
3. If new route file needed, register it in `index.js`
4. Follow response format: `{ message, data }` for success, `{ error }` for failures
5. Use proper HTTP status codes (200, 201, 400, 404, 500)
