# NexusHub Development Agents

## Agent 1: Cart Agent
**Role:** Shopping Cart System Developer
**Scope:** End-to-end shopping cart functionality

### Responsibilities
- Create `cart` and `cart_item` models and migrations
- Build cart controller (add item, update quantity, remove item, clear cart, get cart)
- Create cart routes with auth middleware
- Build Cart page UI (item list, quantity controls, subtotal, total, checkout button)
- Add "Add to Cart" button on Dashboard and ProductDetail pages
- Cart badge/counter in navigation
- Stock validation before adding to cart

### API Endpoints
- `GET /api/cart` — Get current user's cart
- `POST /api/cart/items` — Add item to cart
- `PATCH /api/cart/items/:id` — Update item quantity
- `DELETE /api/cart/items/:id` — Remove item from cart
- `DELETE /api/cart/clear` — Clear entire cart
- `POST /api/cart/checkout` — Convert cart to order(s)

### Database Schema
- **cart**: cart_id, customer_id, created_at, updated_at
- **cart_item**: cart_item_id, cart_id, product_id, quantity, price_at_add

---

## Agent 2: Order Tracking Agent
**Role:** Order Status & Lifecycle Manager
**Scope:** Order status tracking from placement to delivery

### Responsibilities
- Add `status` and `status_history` fields/tables to orders
- Build order status update controller (admin side)
- Create status timeline UI component
- Update Admin page with order status management controls
- Add order tracking view for customers
- Status change notifications (in-app)

### Order Statuses
`pending` → `confirmed` → `shipped` → `delivered` → `completed` → `cancelled` (at any stage)

### API Endpoints
- `PATCH /api/orders/:id/status` — Update order status (admin only)
- `GET /api/orders/:id/tracking` — Get order status history
- `POST /api/orders/:id/cancel` — Cancel order (customer or admin)

### Database Schema
- **order_status_history**: history_id, order_id, status, changed_by, notes, created_at
- Add `status` column to `customer_order` table (default: 'pending')

---

## Agent 3: Search & Filter Agent
**Role:** Product Discovery & Search Developer
**Scope:** Search, filtering, and sorting across products

### Responsibilities
- Build search API with keyword matching (name, description, category)
- Add price range filtering
- Add sort options (price low-high, price high-low, newest, name A-Z)
- Build search bar component for Dashboard
- Add filter sidebar/panel UI (price range slider, category checkboxes, sort dropdown)
- Implement debounced search input
- Pagination for search results

### API Endpoints
- `GET /api/products/search?q=&category=&min_price=&max_price=&sort=&page=&limit=` — Search and filter products

### Frontend Components
- SearchBar component
- FilterPanel component (price range, categories, sorting)
- Update Dashboard to integrate search and filters

---

## Agent 4: Reviews & Ratings Agent
**Role:** Product Review System Developer
**Scope:** Customer reviews and star ratings for products

### Responsibilities
- Create `review` model and migration
- Build review controller (create, read, update, delete own review)
- One review per customer per product enforcement
- Calculate and cache average rating on product
- Build review list UI on ProductDetail page
- Star rating input component
- Display average rating and review count on Dashboard product cards

### API Endpoints
- `GET /api/products/:id/reviews` — Get all reviews for a product
- `POST /api/products/:id/reviews` — Create a review (auth required)
- `PATCH /api/reviews/:id` — Update own review
- `DELETE /api/reviews/:id` — Delete own review (or admin)

### Database Schema
- **review**: review_id, product_id, customer_id, rating (1-5), comment, created_at, updated_at
- Add `average_rating` and `review_count` columns to `product` table

---

## Agent 5: User Profile Agent
**Role:** User Account & Profile Manager
**Scope:** User profile management and account settings

### Responsibilities
- Build profile controller (get profile, update info, change password)
- Create Profile/Account page UI
- Address management UI (add, edit, delete, set default)
- Order history view with re-order functionality
- Password change with current password verification
- Update navigation with profile link

### API Endpoints
- `GET /api/profile` — Get current user's profile
- `PATCH /api/profile` — Update profile info
- `PATCH /api/profile/password` — Change password
- `GET /api/profile/orders` — Get order history with status

### Frontend Pages
- Profile page (personal info, edit form)
- Address management section
- Order history section

---

## Agent 6: Wishlist Agent
**Role:** Wishlist/Favorites System Developer
**Scope:** Save and manage favorite products

### Responsibilities
- Create `wishlist` model and migration
- Build wishlist controller (add, remove, get all)
- Toggle heart/favorite icon on product cards and ProductDetail
- Wishlist page UI showing saved products
- "Move to Cart" action from wishlist
- Wishlist count in navigation

### API Endpoints
- `GET /api/wishlist` — Get user's wishlist
- `POST /api/wishlist/:productId` — Add to wishlist
- `DELETE /api/wishlist/:productId` — Remove from wishlist

### Database Schema
- **wishlist**: wishlist_id, customer_id, product_id, created_at

---

## Agent 7: Promotions Agent
**Role:** Deals, Vouchers & Flash Sales Developer
**Scope:** Promotional features — vouchers, flash sales, discounts

### Responsibilities
- Create `voucher` and `flash_sale` models and migrations
- Build voucher controller (create, validate, apply, deactivate)
- Build flash sale controller (create, list active, end sale)
- Voucher input at checkout with discount calculation
- Flash sale countdown timer component
- Flash sale banner/section on Dashboard
- Admin UI for managing vouchers and flash sales

### API Endpoints
- `POST /api/vouchers` — Create voucher (admin)
- `POST /api/vouchers/validate` — Validate and apply voucher code
- `GET /api/flash-sales/active` — Get active flash sales
- `POST /api/flash-sales` — Create flash sale (admin)
- `PATCH /api/flash-sales/:id` — Update/end flash sale (admin)

### Database Schema
- **voucher**: voucher_id, code, discount_type (percentage/fixed), discount_value, min_order_amount, max_uses, used_count, valid_from, valid_until, is_active
- **flash_sale**: flash_sale_id, product_id, sale_price, original_price, start_time, end_time, stock_limit, sold_count

---

## Implementation Order

| Phase | Agent | Priority | Depends On |
|-------|-------|----------|------------|
| 1 | Agent 1: Cart | High | — |
| 1 | Agent 3: Search & Filter | High | — |
| 2 | Agent 2: Order Tracking | High | Agent 1 (checkout flow) |
| 2 | Agent 5: User Profile | Medium | — |
| 3 | Agent 4: Reviews & Ratings | Medium | — |
| 3 | Agent 6: Wishlist | Medium | — |
| 4 | Agent 7: Promotions | Nice to have | Agent 1 (cart/checkout) |

> **Phase 1** can start immediately — Cart and Search are independent of each other.
> **Phase 2** starts once Cart checkout is working.
> **Phase 3 & 4** can be built anytime after Phase 1.
