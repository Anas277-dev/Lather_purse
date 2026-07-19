const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create admin user
    const salt = await bcrypt.genSalt(12);
    const adminHash = await bcrypt.hash('admin123', salt);

    await client.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, is_admin)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['Admin', 'User', 'admin@leathergoods.com', adminHash, true]
    );

    // Create demo customer
    const customerHash = await bcrypt.hash('customer123', salt);
    await client.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['John', 'Doe', 'john@example.com', customerHash, '+1234567890']
    );

    // Insert sample products
    const products = [
      {
        title: 'Classic Men\'s Leather Wallet',
        description: 'Premium full-grain leather wallet with multiple card slots and bill compartment. Handcrafted with attention to detail.',
        old_price: 89.99,
        new_price: 69.99,
        category: 'men_purse',
        dimensions: { height: '3.5"', width: '4.5"', depth: '0.5"' },
        images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800', 'https://images.unsplash.com/photo-1606503825008-909a6184f56b?w=800', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800'],
        variants: [
          { color: 'Black', color_hex: '#000000', quantity: 15 },
          { color: 'Brown', color_hex: '#8B4513', quantity: 12 },
          { color: 'Tan', color_hex: '#D2691E', quantity: 8 }
        ]
      },
      {
        title: 'Elegant Ladies\' Crossbody Purse',
        description: 'Stylish crossbody bag made from genuine Italian leather. Features adjustable strap and secure zip closure.',
        old_price: 149.99,
        new_price: 119.99,
        category: 'ladies_purse',
        dimensions: { height: '8"', width: '10"', depth: '3"' },
        images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800'],
        variants: [
          { color: 'Black', color_hex: '#000000', quantity: 10 },
          { color: 'Red', color_hex: '#DC143C', quantity: 5 },
          { color: 'Navy', color_hex: '#000080', quantity: 7 }
        ]
      },
      {
        title: 'Premium Gents\' Leather Belt',
        description: 'Handcrafted genuine leather belt with solid brass buckle. Available in classic sizes for the perfect fit.',
        old_price: 59.99,
        new_price: 44.99,
        category: 'gents_belt',
        dimensions: { sizes: ['32', '34', '36', '38', '40'] },
        images: ['https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800', 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=800', 'https://images.unsplash.com/photo-1606503825008-909a6184f56b?w=800', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
        is_flash_sale: true,
        flash_sale_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        variants: [
          { color: 'Black', color_hex: '#000000', quantity: 20 },
          { color: 'Brown', color_hex: '#8B4513', quantity: 15 },
          { color: 'Cognac', color_hex: '#9A463D', quantity: 2 }
        ]
      },
      {
        title: 'Vintage Ladies\' Clutch',
        description: 'Elegant evening clutch with magnetic snap closure. Perfect for formal occasions and night outs.',
        old_price: 79.99,
        new_price: 59.99,
        category: 'ladies_purse',
        dimensions: { height: '5"', width: '9"', depth: '1.5"' },
        images: ['https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
        variants: [
          { color: 'Gold', color_hex: '#FFD700', quantity: 6 },
          { color: 'Silver', color_hex: '#C0C0C0', quantity: 4 },
          { color: 'Black', color_hex: '#000000', quantity: 9 }
        ]
      }
    ];

    for (const product of products) {
      const productResult = await client.query(
        `INSERT INTO products (title, description, old_price, new_price, category, dimensions, images, is_flash_sale, flash_sale_end)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [product.title, product.description, product.old_price, product.new_price, 
         product.category, JSON.stringify(product.dimensions), product.images, 
         product.is_flash_sale || false, product.flash_sale_end || null]
      );

      if (productResult.rows.length > 0) {
        const productId = productResult.rows[0].id;
        for (const variant of product.variants) {
          await client.query(
            `INSERT INTO product_variants (product_id, color, color_hex, quantity)
             VALUES ($1, $2, $3, $4)`,
            [productId, variant.color, variant.color_hex, variant.quantity]
          );
        }
      }
    }

    // Insert sample banners
    await client.query(
      `INSERT INTO banners (title, image_url, link_url, display_order)
       VALUES 
         ('Summer Collection', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200', '/shop', 1),
         ('Premium Belts', 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=1200', '/category/gents_belt', 2)
       ON CONFLICT DO NOTHING`
    );

    // Insert site settings
    await client.query(
      `INSERT INTO site_settings (id, offer_bar_text, offer_bar_active, whatsapp_number)
       VALUES (1, 'Free shipping on orders over $100 | Use code: PREMIUM10', true, '+1234567890')
       ON CONFLICT (id) DO NOTHING`
    );

    await client.query('COMMIT');
    console.log('Seed data inserted successfully!');
    console.log('Admin: admin@leathergoods.com / admin123');
    console.log('Customer: john@example.com / customer123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
