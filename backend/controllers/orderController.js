const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../utils/emailService');
const { sendOrderSMS } = require('../utils/smsService');
const { generateInvoice } = require('../utils/pdfGenerator');

exports.createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;
    const trackingId = 'LG-' + uuidv4().substring(0, 8).toUpperCase();

    // Calculate total and validate stock
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const productResult = await client.query(
        'SELECT new_price FROM products WHERE id = $1 AND is_active = true',
        [item.productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const variantResult = await client.query(
        'SELECT quantity, color FROM product_variants WHERE id = $1 AND product_id = $2',
        [item.variantId, item.productId]
      );

      if (variantResult.rows.length === 0) {
        throw new Error(`Variant not found for product ${item.productId}`);
      }

      const variant = variantResult.rows[0];
      if (variant.quantity < item.quantity) {
        throw new Error(`Insufficient stock for variant ${item.variantId}`);
      }

      const unitPrice = productResult.rows[0].new_price;
      totalAmount += unitPrice * item.quantity;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        color: variant.color
      });

      // Deduct stock
      await client.query(
        'UPDATE product_variants SET quantity = quantity - $1 WHERE id = $2',
        [item.quantity, item.variantId]
      );
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (tracking_id, user_id, total_amount, shipping_address, payment_method)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [trackingId, userId, totalAmount, JSON.stringify(shippingAddress), paymentMethod]
    );

    const order = orderResult.rows[0];

    // Create order items
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price, color)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.productId, item.variantId, item.quantity, item.unitPrice, item.color]
      );
    }

    await client.query('COMMIT');

    // Send notifications asynchronously
    const userResult = await pool.query('SELECT email, phone FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (user) {
      sendOrderConfirmation(user.email, { trackingId, totalAmount }).catch(console.error);
      if (user.phone) {
        sendOrderSMS(user.phone, trackingId, 'order_placed').catch(console.error);
      }
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: order.id,
        trackingId: order.tracking_id,
        status: order.status,
        totalAmount: order.total_amount,
        createdAt: order.created_at
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message || 'Failed to create order' });
  } finally {
    client.release();
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, 
        COALESCE(json_agg(
          jsonb_build_object(
            'id', oi.id, 'productId', oi.product_id, 'variantId', oi.variant_id,
            'quantity', oi.quantity, 'unitPrice', oi.unit_price, 'color', oi.color,
            'productTitle', p.title, 'productImage', p.images[0]
          )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

exports.getOrderByTrackingId = async (req, res) => {
  try {
    const { trackingId } = req.params;

    const result = await pool.query(
      `SELECT o.*, 
        COALESCE(json_agg(
          jsonb_build_object(
            'id', oi.id, 'productId', oi.product_id, 'variantId', oi.variant_id,
            'quantity', oi.quantity, 'unitPrice', oi.unit_price, 'color', oi.color,
            'productTitle', p.title, 'productImage', p.images[0]
          )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.tracking_id = $1
       GROUP BY o.id`,
      [trackingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = result.rows[0];

    // Send notifications
    const userResult = await pool.query('SELECT email, phone FROM users WHERE id = $1', [order.user_id]);
    const user = userResult.rows[0];

    if (user) {
      sendOrderStatusUpdate(user.email, { trackingId: order.tracking_id, status }).catch(console.error);
      if (user.phone) {
        sendOrderSMS(user.phone, order.tracking_id, status).catch(console.error);
      }
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.*, u.first_name, u.last_name, u.email,
        COALESCE(json_agg(
          jsonb_build_object(
            'id', oi.id, 'productId', oi.product_id, 'quantity', oi.quantity,
            'unitPrice', oi.unit_price, 'color', oi.color, 'productTitle', p.title
          )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
    `;

    const params = [];
    if (status) {
      query += ' WHERE o.status = $1';
      params.push(status);
    }

    query += ` GROUP BY o.id, u.first_name, u.last_name, u.email ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

exports.generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [order.user_id]);
    const user = userResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT oi.*, p.title FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1`,
      [id]
    );

    const pdfBuffer = await generateInvoice(order, user, itemsResult.rows);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.tracking_id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate invoice', error: error.message });
  }
};
