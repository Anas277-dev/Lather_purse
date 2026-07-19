const pool = require('../config/database');

const migrations = [
  // Users Table
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    default_address JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Site Settings Table
  `CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    offer_bar_text VARCHAR(500),
    offer_bar_active BOOLEAN DEFAULT FALSE,
    whatsapp_number VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Banners Table
  `CREATE TABLE IF NOT EXISTS banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    image_url TEXT NOT NULL,
    link_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Products Table
  `CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    old_price NUMERIC(10,2),
    new_price NUMERIC(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('men_purse', 'ladies_purse', 'gents_belt')),
    dimensions JSONB,
    images TEXT[] DEFAULT '{}',
    is_flash_sale BOOLEAN DEFAULT FALSE,
    flash_sale_end TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Product Variants Table
  `CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    color VARCHAR(50) NOT NULL,
    color_hex VARCHAR(7),
    quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Wishlist Table
  `CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
  )`,

  // Orders Table
  `CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    tracking_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'order_placed' CHECK (status IN ('order_placed', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled')),
    total_amount NUMERIC(10,2) NOT NULL,
    shipping_address JSONB NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cod', 'card')),
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Order Items Table
  `CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    variant_id INT REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Reviews Table
  `CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Complaints Table
  `CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    admin_reply TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Indexes
  `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
  `CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)`,
  `CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlists(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`
];

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const migration of migrations) {
      await client.query(migration);
      console.log('Executed:', migration.substring(0, 50) + '...');
    }
    await client.query('COMMIT');
    console.log('All migrations completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

runMigrations().then(() => process.exit(0)).catch(() => process.exit(1));
