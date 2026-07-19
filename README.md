# Leather & Goods E-Commerce Platform

A premium full-stack e-commerce application built with the PERN stack (PostgreSQL, Express.js, React.js, Node.js) for selling Men's Purses, Ladies' Purses, and Gents' Belts.

## Project Structure

```
leather-goods-ecommerce/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL pool configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication & user management
│   │   ├── productController.js   # Product CRUD & inventory
│   │   ├── orderController.js     # Order processing & tracking
│   │   ├── reviewController.js    # Product reviews moderation
│   │   ├── complaintController.js # Customer complaints
│   │   ├── wishlistController.js  # Wishlist management
│   │   ├── siteSettingsController.js # Site config & banners
│   │   └── analyticsController.js    # Dashboard analytics
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── validation.js        # Input validation
│   │   └── errorHandler.js      # Global error handling
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── wishlistRoutes.js
│   │   ├── siteSettingsRoutes.js
│   │   └── analyticsRoutes.js
│   ├── utils/
│   │   ├── emailService.js      # Nodemailer email service
│   │   ├── smsService.js        # Twilio SMS service
│   │   └── pdfGenerator.js      # PDF invoice generation
│   ├── migrations/
│   │   └── migrate.js           # Database schema creation
│   ├── seeds/
│   │   └── seed.js              # Sample data insertion
│   ├── .env.example
│   ├── package.json
│   └── server.js                # Express server entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── ProtectedRoute.js
    │   │   │   └── AdminRoute.js
    │   │   ├── layout/
    │   │   │   ├── MainLayout.js
    │   │   │   ├── AdminLayout.js
    │   │   │   ├── Navbar.js
    │   │   │   ├── Footer.js
    │   │   │   ├── OfferBar.js
    │   │   │   └── WhatsAppButton.js
    │   │   ├── product/
    │   │   │   ├── ProductCard.js
    │   │   │   ├── ProductGallery.js
    │   │   │   └── FlashSaleTimer.js
    │   │   ├── checkout/
    │   │   └── admin/
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Shop.js
    │   │   ├── ProductDetail.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Cart.js
    │   │   ├── Checkout.js
    │   │   ├── OrderConfirmation.js
    │   │   ├── OrderTracking.js
    │   │   ├── Profile.js
    │   │   ├── Wishlist.js
    │   │   └── admin/
    │   │       ├── AdminDashboard.js
    │   │       ├── AdminProducts.js
    │   │       ├── AdminOrders.js
    │   │       ├── AdminReviews.js
    │   │       ├── AdminComplaints.js
    │   │       ├── AdminBanners.js
    │   │       └── AdminAnalytics.js
    │   ├── context/
    │   │   └── store.js             # Zustand state management
    │   ├── services/
    │   │   └── api.js               # API service layer
    │   ├── styles/
    │   │   └── index.css            # Tailwind + custom styles
    │   ├── App.js
    │   └── index.js
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

## Features

### User Panel
- Dynamic offer bar and hero banner carousel
- Product cards with color swatches and pricing
- 4-image gallery with hover zoom
- Size & dimensions guide popup
- Dynamic color variant selector with stock tracking
- Wishlist system
- Flash sale countdown timer
- Floating WhatsApp support button
- JWT authentication
- 4-step checkout (Review, Shipping, Payment, Confirm)
- Live order tracking pipeline
- Verified purchase reviews
- Complaint management

### Admin Panel
- Executive KPI dashboard
- Sales analytics with charts
- Product variant matrix management
- Low stock alerts
- Order fulfillment with status updates
- One-click PDF invoice generation
- Review moderation queue
- Complaint resolution interface
- Banner and site settings management

## Tech Stack

**Backend:**
- Node.js + Express.js
- PostgreSQL with relational schema
- JWT + bcrypt for auth
- Nodemailer for emails
- Twilio for SMS
- PDFKit for invoices
- Helmet, CORS, Rate Limiting for security

**Frontend:**
- React.js 18 (SPA)
- React Router v6
- Zustand for state management
- React Query for data fetching
- Tailwind CSS for styling
- Recharts for analytics
- Lucide React for icons

## Database Schema

### Tables
- `users` - Customer & admin accounts
- `products` - Product catalog with images
- `product_variants` - Color-wise inventory matrix
- `orders` - Order records with tracking
- `order_items` - Line items per order
- `reviews` - Verified purchase reviews
- `complaints` - Customer support tickets
- `wishlists` - User wishlist items
- `banners` - Homepage carousel images
- `site_settings` - Global configuration

## Setup Instructions

### 1. Database Setup
```bash
# Create PostgreSQL database
createdb leather_goods_db

# Run migrations
cd backend
npm install
npm run migrate

# Seed sample data
npm run seed
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Default Credentials
- **Admin:** admin@leathergoods.com / admin123
- **Customer:** john@example.com / customer123

## Environment Variables

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=leather_goods_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
TWILIO_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE=+1234567890
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | User registration |
| POST | /api/auth/login | User login |
| GET | /api/products | List products |
| GET | /api/products/:id | Product details |
| POST | /api/orders | Create order |
| GET | /api/orders/my-orders | User orders |
| GET | /api/orders/tracking/:id | Track order |
| POST | /api/reviews | Submit review |
| POST | /api/complaints | File complaint |
| GET | /api/wishlist | Get wishlist |
| GET | /api/settings | Site settings |
| GET | /api/analytics/dashboard | Admin stats |

## License
MIT
