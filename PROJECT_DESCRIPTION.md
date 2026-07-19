# Leather & Goods - Premium E-Commerce Platform

## Project Overview

A full-stack, production-ready e-commerce web application built for a premium leather goods brand specializing in **Men's Purses**, **Ladies' Purses**, and **Gents' Belts**. The platform features a complete dual-role system with separate dashboards and functionalities for **Customers** and **Administrators**.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js 18, Vite, Tailwind CSS, Zustand, React Query |
| **Backend** | Node.js, Express.js, RESTful APIs |
| **Database** | PostgreSQL (Relational schema with color-wise inventory matrix) |
| **Authentication** | JWT (JSON Web Tokens) + bcrypt password hashing |
| **Email Service** | Nodemailer (Transactional emails) |
| **SMS Service** | Twilio (Order status notifications) |
| **PDF Generation** | PDFKit (Invoice generation) |
| **Security** | Helmet, CORS, Express Rate Limiting |

---

## User Roles & Features

---

## 👤 CUSTOMER ROLE (User Panel)

### 1. Authentication & Account Management
- **Registration** with email, password, first name, last name, and phone number
- **Secure Login** with JWT-based session management
- **Profile Dashboard** to view and edit personal information
- **Default Shipping Address** saving to avoid repetitive typing during checkout
- **Password Security** with bcrypt hashing (minimum 6 characters)

### 2. Product Browsing & Discovery
- **Dynamic Hero Banner Carousel** - Admin-managed sliding banners for promotions
- **Sitewide Offer Bar** - Top announcement bar for flash sales and promo codes
- **Category Filtering** - Browse by Men's Purses, Ladies' Purses, or Gents' Belts
- **Search Functionality** - Search products by name or description
- **Product Cards** with:
  - High-quality product images
  - Live color swatches (hover to preview different variants)
  - Old Price (strikethrough) and New Discounted Price display
  - Flash Sale badges with countdown timers
  - Quick "Add to Wishlist" heart button
  - Quick "View Product" eye button

### 3. Product Detail Page (PDP)
- **4-Image Gallery System**:
  - 1 primary large display image
  - 3 alternative thumbnail images
  - Hover-to-zoom functionality with smooth magnification
  - Navigation arrows for image switching
- **Dynamic Color Selector**:
  - Real-time stock availability updates based on selected color
  - Visual color swatches with hex codes
  - Out-of-stock colors shown with reduced opacity and strikethrough
  - Live quantity display (e.g., "15 in stock", "2 left", "Out of Stock")
- **Quantity Selector** with increment/decrement controls
- **Size & Dimensions Guide** popup:
  - Belt size chart (32", 34", 36", 38", 40" with waist measurements)
  - Purse dimensions (Height, Width, Depth)
- **Trust Badges** - Free Shipping, Secure Payment, Easy Returns

### 4. Wishlist System
- **Heart Icon Toggle** on product cards and detail pages
- **Personalized Wishlist Page** displaying all saved items
- **Persistent Storage** - Wishlist survives page refreshes
- **Quick Add to Cart** directly from wishlist

### 5. Shopping Cart
- **Add to Cart** with selected color variant and quantity
- **Cart Page** showing:
  - Product image, title, selected color, quantity
  - Price calculations (unit price × quantity)
  - Quantity modification (increase/decrease/remove)
  - Order summary with subtotal, shipping, and total
- **Free Shipping** automatically applied on orders over $100
- **Persistent Cart** - Items remain in cart across sessions

### 6. Four-Step Checkout Pipeline
- **Step 1: Cart Review** - Verify items, modify quantities, confirm variants
- **Step 2: Shipping Details** - Name, email, phone, address, city, postal code
  - Auto-fills saved default address for logged-in users
- **Step 3: Payment Method** - Choose between:
  - Cash on Delivery (COD)
  - Credit/Debit Card
- **Step 4: Order Confirmation** - Complete invoice summary with transaction details

### 7. Order Management & Tracking
- **My Orders Page** - Complete order history with:
  - Tracking ID, date, status, items, and total amount
  - Visual status indicators (color-coded badges)
- **Live Order Tracking** - Visual progress pipeline:
  ```
  [Order Placed] → [Dispatched] → [Out for Delivery] → [Delivered]
  ```
  - Animated progress bar showing current stage
  - Status descriptions for each milestone
- **Order Details** - View complete order with item breakdown

### 8. Verified Purchase Review System
- **Submit Reviews** only for delivered orders (verified buyers only)
- **1-5 Star Rating** system
- **Text Comment** field for detailed feedback
- **Reviews Display** on product pages with:
  - Reviewer name and date
  - Star rating visualization
  - Review text

### 9. Complaint Management
- **File Complaints** against specific orders from order history
- **Complaint Form** with subject and description
- **My Complaints Page** showing:
  - Complaint status (Open / In Progress / Resolved)
  - Admin replies
  - Associated order tracking ID

### 10. Customer Support
- **Floating WhatsApp Button** - Persistent sticky button in bottom-right corner
- **Direct WhatsApp Chat** - Opens WhatsApp with pre-filled support message
- **Admin-configurable** WhatsApp number from admin panel

---

## 🛡️ ADMIN ROLE (Administration Panel)

### 1. Secure Admin Access
- **Admin-only routes** protected by role-based middleware
- **Automatic redirect** non-admin users to homepage
- **Admin detection** via `is_admin` flag in JWT token

### 2. Executive KPI Dashboard
- **Visual Stat Cards** showing:
  - Total Revenue (lifetime sales)
  - Total Orders (all-time count)
  - Pending Orders (orders not yet delivered)
  - Open Complaints (unresolved customer issues)
- **Low Stock Alerts Panel** - Real-time warning when any color variant drops below 3 units
- **Quick Action Links** to Products, Orders, and Analytics sections

### 3. Sales Analytics Hub
- **Monthly Revenue Chart** - Bar chart showing revenue trends over 12 months
- **Sales by Category** - Pie chart breaking down sales by product category
- **Popular Colors Chart** - Horizontal bar chart showing most-purchased color variants
- **Interactive Charts** powered by Recharts library

### 4. Product Management (Variant Matrix)
- **Product List Table** showing all products with:
  - Thumbnail image, title, category
  - Pricing (old vs new with discount calculation)
  - Color variant swatches
- **Add New Product** form with:
  - Title, description, category selection
  - Old price and new price fields
  - 4 image URL inputs
  - **Dynamic Variant Matrix** - Add unlimited color variants with:
    - Color name (e.g., Black, Brown, Tan)
    - Color hex code picker
    - Quantity per color
  - Flash Sale toggle with end date/time picker
- **Edit Product** - Modify any existing product and its variants
- **Delete Product** - Soft delete (deactivates product)

### 5. Order Fulfillment Dashboard
- **Complete Orders Table** with:
  - Tracking ID, customer name/email
  - Item count, total amount
  - **Status Dropdown** - Update order status in real-time:
    - Order Placed → Dispatched → Out for Delivery → Delivered
  - **Auto-triggers** Email + SMS notifications to customer on status change
- **One-Click Invoice Generation** - Download print-ready PDF invoice
- **Status Filtering** - Filter orders by current status

### 6. Review Moderation Queue
- **Pending Reviews Panel** - All unapproved customer reviews
- **Review Details** - Product name, reviewer name, star rating, comment text
- **Approve Review** - Makes review visible on product page
- **Delete Review** - Removes inappropriate/spam reviews

### 7. Complaint Resolution Interface
- **All Complaints List** with customer details
- **Status Management**:
  - Open → In Progress → Resolved
- **Admin Reply System**:
  - Type direct response to customer
  - Mark status while replying
- **Customer Context** - View associated order tracking ID

### 8. Marketing Asset Controls
- **Hero Banner Management**:
  - Upload banner images (via URL)
  - Set banner title and link destination
  - Control display order
  - Activate/Deactivate banners
- **Site Settings**:
  - Edit offer bar text and visibility
  - Configure WhatsApp support number

### 9. Automated Notifications
- **Transactional Emails** (Nodemailer):
  - Welcome email on registration
  - Order confirmation with tracking ID
  - Order status update emails
- **SMS Notifications** (Twilio):
  - Order placed confirmation
  - Status change alerts with tracking link
- **Automatic triggers** on order status updates

### 10. Low Stock Automation
- **Dashboard Warning Indicators** - Red alerts when inventory < 3
- **Product-level Alerts** - Specific color variants highlighted
- **Real-time Updates** - Alerts refresh on page load

---

## Database Architecture (PostgreSQL)

### Core Tables
| Table | Purpose |
|-------|---------|
| `users` | Customer & admin accounts with role flags |
| `products` | Product catalog with pricing, images, dimensions |
| `product_variants` | Color-wise inventory matrix (quantity per color) |
| `orders` | Order records with tracking IDs and status |
| `order_items` | Individual line items per order |
| `reviews` | Verified purchase reviews with approval status |
| `complaints` | Customer support tickets with admin replies |
| `wishlists` | User saved items |
| `banners` | Homepage carousel images |
| `site_settings` | Global configuration (offer bar, WhatsApp) |

### Key Features
- **Cascading Deletes** - Clean removal of related records
- **Indexed Foreign Keys** - Fast queries on frequently accessed data
- **JSONB Fields** - Flexible storage for addresses and dimensions
- **Array Types** - Efficient image URL storage

---

## Security Features

| Feature | Implementation |
|---------|---------------|
| Password Hashing | bcrypt with salt rounds 12 |
| Authentication | JWT with 7-day expiration |
| Route Protection | Middleware for auth and admin-only routes |
| Input Validation | express-validator on all forms |
| Rate Limiting | 100 requests per 15 minutes per IP |
| CORS | Whitelist-based origin control |
| Helmet | Security headers (XSS, clickjacking protection) |
| SQL Injection Prevention | Parameterized queries via pg library |

---

## Deployment Ready

### Environment Configuration
- `.env.example` files for both frontend and backend
- Production mode serves built frontend from backend
- CORS configured for multiple origins
- Database URL support for cloud PostgreSQL (Railway, Render, Supabase)

### Recommended Free Hosting Stack
| Service | Purpose |
|---------|---------|
| Railway | Backend + PostgreSQL database |
| Vercel | Frontend hosting |
| Cloudinary | Product image hosting |
| Gmail SMTP | Transactional emails |

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@leathergoods.com | admin123 |
| **Customer** | john@example.com | customer123 |

---

## Project Structure Summary

```
leather-goods-ecommerce/
├── backend/                    # Node.js + Express API
│   ├── index.js               # Server entry point
│   ├── controllers/           # Business logic (MVC)
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth, validation, errors
│   ├── utils/                 # Email, SMS, PDF services
│   ├── migrations/            # Database schema
│   └── seeds/                 # Demo data
│
└── frontend/                  # React.js + Vite SPA
    ├── index.html             # Vite entry
    ├── src/
    │   ├── App.jsx            # Router with lazy loading
    │   ├── pages/             # Page components
    │   │   ├── Home.jsx
    │   │   ├── Shop.jsx
    │   │   ├── ProductDetail.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Wishlist.jsx
    │   │   └── admin/         # Admin pages
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminProducts.jsx
    │   │       ├── AdminOrders.jsx
    │   │       ├── AdminReviews.jsx
    │   │       ├── AdminComplaints.jsx
    │   │       ├── AdminBanners.jsx
    │   │       └── AdminAnalytics.jsx
    │   ├── components/        # Reusable components
    │   ├── context/store.js     # Zustand state management
    │   └── services/api.js    # API service layer
```

---

## Run Commands

```bash
# Backend
cd backend
npm install
npm run migrate      # Create database tables
npm run seed         # Insert demo data
node index.js        # Start server (port 5000)

# Frontend
cd frontend
npm install
npm run dev          # Start dev server (port 3000)
```

---

*Built with the PERN Stack (PostgreSQL, Express, React, Node.js)*
*Designed for premium leather goods e-commerce with complete admin & customer workflows*
