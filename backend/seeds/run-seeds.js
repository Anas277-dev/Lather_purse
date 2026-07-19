const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Seed Admin User
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@leathergoods.com', adminPassword, 'Admin', 'User', '+91-9876543210', true]);

    // Seed Products
    const products = [
      {
        title: 'Classic Men's Leather Wallet',
        slug: 'classic-mens-leather-wallet',
        description: 'Handcrafted from premium full-grain leather, this classic men's wallet features multiple card slots, a clear ID window, and a spacious bill compartment. The rich patina develops beautifully with age.',
        short_description: 'Premium full-grain leather wallet with RFID protection',
        old_price: 2499.00,
        new_price: 1899.00,
        category: 'men_purse',
        dimensions: JSON.stringify({ height: '9.5 cm', width: '11.5 cm', depth: '1.5 cm' }),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800',
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
          'https://images.unsplash.com/photo-1606503825008-909a6184afac?w=800',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'
        ])
      },
      {
        title: 'Elegant Ladies' Crossbody Bag',
        slug: 'elegant-ladies-crossbody-bag',
        description: 'A sophisticated crossbody bag designed for the modern woman. Features adjustable strap, gold-tone hardware, and organized interior compartments for everyday essentials.',
        short_description: 'Stylish crossbody with gold-tone hardware',
        old_price: 4999.00,
        new_price: 3499.00,
        category: 'ladies_purse',
        dimensions: JSON.stringify({ height: '20 cm', width: '25 cm', depth: '8 cm' }),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
          'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'
        ])
      },
      {
        title: 'Gents' Premium Leather Belt',
        slug: 'gents-premium-leather-belt',
        description: 'A timeless leather belt crafted from vegetable-tanned leather with a brushed metal buckle. Available in classic sizes with precise hole spacing for the perfect fit.',
        short_description: 'Vegetable-tanned leather with brushed metal buckle',
        old_price: 1999.00,
        new_price: 1499.00,
        category: 'gents_belt',
        dimensions: JSON.stringify({ sizes: ['32', '34', '36', '38', '40'] }),
        size_chart: JSON.stringify({
          '32': { waist: '81-84 cm', length: '105 cm' },
          '34': { waist: '86-89 cm', length: '110 cm' },
          '36': { waist: '91-94 cm', length: '115 cm' },
          '38': { waist: '97-100 cm', length: '120 cm' },
          '40': { waist: '102-105 cm', length: '125 cm' }
        }),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800',
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
          'https://images.unsplash.com/photo-1606503825008-909a6184afac?w=800',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'
        ])
      },
      {
        title: 'Executive Men's Briefcase',
        slug: 'executive-mens-briefcase',
        description: 'Professional briefcase with padded laptop compartment, multiple organizer pockets, and detachable shoulder strap. Perfect for the corporate gentleman.',
        short_description: 'Professional briefcase with laptop compartment',
        old_price: 8999.00,
        new_price: 6999.00,
        category: 'men_purse',
        dimensions: JSON.stringify({ height: '30 cm', width: '40 cm', depth: '10 cm' }),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
          'https://images.unsplash.com/photo-1606503825008-909a6184afac?w=800',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
          'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800'
        ])
      },
      {
        title: 'Ladies' Evening Clutch',
        slug: 'ladies-evening-clutch',
        description: 'Elegant evening clutch with metallic finish and detachable chain strap. Features magnetic closure and satin-lined interior.',
        short_description: 'Metallic finish evening clutch with chain strap',
        old_price: 3499.00,
        new_price: 2499.00,
        category: 'ladies_purse',
        dimensions: JSON.stringify({ height: '12 cm', width: '22 cm', depth: '4 cm' }),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'
        ])
      }
    ];

    for (const product of products) {
      const result = await pool.query(`
        INSERT INTO products (title, slug, description, short_description, old_price, new_price, category, dimensions, size_chart, images)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `, [product.title, product.slug, product.description, product.short_description, 
          product.old_price, product.new_price, product.category, 
          product.dimensions, product.size_chart || null, product.images]);

      if (result.rows.length > 0) {
        const productId = result.rows[0].id;

        // Seed variants based on category
        const variants = product.category === 'gents_belt' 
          ? [
              { color: 'Black', color_hex: '#1a1a1a', quantity: 15 },
              { color: 'Brown', color_hex: '#8B4513', quantity: 12 },
              { color: 'Tan', color_hex: '#D2B48C', quantity: 8 },
              { color: 'Navy', color_hex: '#000080', quantity: 5 }
            ]
          : [
              { color: 'Black', color_hex: '#1a1a1a', quantity: 20 },
              { color: 'Brown', color_hex: '#8B4513', quantity: 15 },
              { color: 'Tan', color_hex: '#D2B48C', quantity: 10 },
              { color: 'Burgundy', color_hex: '#800020', quantity: 2 }
            ];

        for (const variant of variants) {
          await pool.query(`
            INSERT INTO product_variants (product_id, color, color_hex, quantity, sku)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (product_id, color) DO NOTHING
          `, [productId, variant.color, variant.color_hex, variant.quantity, 
              `${product.slug}-${variant.color.toLowerCase()}`]);
        }
      }
    }

    // Seed Banners
    await pool.query(`
      INSERT INTO banners (title, subtitle, image_url, link_url, display_order, is_active)
      VALUES 
        ('New Collection 2026', 'Discover Premium Leather Craftsmanship', 'https://images.unsplash.com/photo-1485230905346-71acb9518d9c?w=1600', '/shop', 1, true),
        ('Summer Sale', 'Up to 40% Off on Selected Items', 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=1600', '/sale', 2, true),
        ('Handcrafted Excellence', 'Every Piece Tells a Story', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1600', '/about', 3, true)
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
