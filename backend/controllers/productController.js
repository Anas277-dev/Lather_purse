const pool = require('../config/database');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, 
        COALESCE(json_agg(
          DISTINCT jsonb_build_object('id', pv.id, 'color', pv.color, 'colorHex', pv.color_hex, 'quantity', pv.quantity)
        ) FILTER (WHERE pv.id IS NOT NULL), '[]') as variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.is_active = true
    `;

    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM products WHERE is_active = true';
    const countParams = [];
    if (category) {
      countQuery += ' AND category = $1';
      countParams.push(category);
    }
    if (search) {
      countQuery += countParams.length ? ' AND' : ' AND';
      countQuery += ' (title ILIKE $' + (countParams.length + 1) + ' OR description ILIKE $' + (countParams.length + 1) + ')';
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const productResult = await pool.query(
      `SELECT p.*, 
        COALESCE(json_agg(
          DISTINCT jsonb_build_object('id', pv.id, 'color', pv.color, 'colorHex', pv.color_hex, 'quantity', pv.quantity)
        ) FILTER (WHERE pv.id IS NOT NULL), '[]') as variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.id = $1 AND p.is_active = true
      GROUP BY p.id`,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get reviews for this product
    const reviewsResult = await pool.query(
      `SELECT r.*, u.first_name, u.last_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1 AND r.is_approved = true
       ORDER BY r.created_at DESC`,
      [id]
    );

    const product = productResult.rows[0];
    product.reviews = reviewsResult.rows;

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, description, oldPrice, newPrice, category, dimensions, images, variants, isFlashSale, flashSaleEnd } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const productResult = await client.query(
        `INSERT INTO products (title, description, old_price, new_price, category, dimensions, images, is_flash_sale, flash_sale_end)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [title, description, oldPrice, newPrice, category, JSON.stringify(dimensions), images, isFlashSale, flashSaleEnd]
      );

      const product = productResult.rows[0];

      // Insert variants
      for (const variant of variants) {
        await client.query(
          'INSERT INTO product_variants (product_id, color, color_hex, quantity) VALUES ($1, $2, $3, $4)',
          [product.id, variant.color, variant.colorHex, variant.quantity]
        );
      }

      await client.query('COMMIT');
      res.status(201).json({ message: 'Product created successfully', product });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, oldPrice, newPrice, category, dimensions, images, variants, isActive, isFlashSale, flashSaleEnd } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE products SET title = $1, description = $2, old_price = $3, new_price = $4, 
         category = $5, dimensions = $6, images = $7, is_active = $8, is_flash_sale = $9, flash_sale_end = $10, updated_at = CURRENT_TIMESTAMP
         WHERE id = $11`,
        [title, description, oldPrice, newPrice, category, JSON.stringify(dimensions), images, isActive, isFlashSale, flashSaleEnd, id]
      );

      // Update variants - delete old and insert new
      await client.query('DELETE FROM product_variants WHERE product_id = $1', [id]);
      for (const variant of variants) {
        await client.query(
          'INSERT INTO product_variants (product_id, color, color_hex, quantity) VALUES ($1, $2, $3, $4)',
          [id, variant.color, variant.colorHex, variant.quantity]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Product updated successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE products SET is_active = false WHERE id = $1', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

exports.getFlashSaleProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
        COALESCE(json_agg(
          DISTINCT jsonb_build_object('id', pv.id, 'color', pv.color, 'colorHex', pv.color_hex, 'quantity', pv.quantity)
        ) FILTER (WHERE pv.id IS NOT NULL), '[]') as variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.is_flash_sale = true AND p.flash_sale_end > NOW() AND p.is_active = true
      GROUP BY p.id`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch flash sales', error: error.message });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.title, p.category, pv.color, pv.quantity
       FROM products p
       JOIN product_variants pv ON p.id = pv.product_id
       WHERE pv.quantity < 3 AND p.is_active = true
       ORDER BY pv.quantity ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch low stock', error: error.message });
  }
};
