const pool = require('../config/database');
const { generateInvoice } = require('../utils/pdfGenerator');

// Dashboard overview
exports.getDashboard = async (req, res, next) => {
  try {
    // Total stats
    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_admin = false) as total_customers,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled') as total_revenue,
        (SELECT COUNT(*) FROM orders WHERE status = 'placed') as pending_orders,
        (SELECT COUNT(*) FROM complaints WHERE status IN ('open', 'in_progress')) as open_complaints,
        (SELECT COUNT(*) FROM reviews WHERE is_approved = false) as pending_reviews,
        (SELECT COUNT(*) FROM product_variants WHERE quantity < 3) as low_stock_items
    `);

    // Recent orders
    const recentOrders = await pool.query(`
      SELECT o.*, u.first_name, u.last_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    // Revenue chart data (last 7 days)
    const revenueChart = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Top selling products
    const topProducts = await pool.query(`
      SELECT 
        p.id, p.title, p.images[1] as image,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // Color preference matrix
    const colorMatrix = await pool.query(`
      SELECT 
        pv.color,
        COUNT(*) as times_ordered,
        SUM(oi.quantity) as total_quantity
      FROM order_items oi
      JOIN product_variants pv ON oi.variant_id = pv.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY pv.color
      ORDER BY total_quantity DESC
    `);

    res.json({
      success: true,
      data: {
        stats: statsResult.rows[0],
        recentOrders: recentOrders.rows,
        revenueChart: revenueChart.rows,
        topProducts: topProducts.rows,
        colorMatrix: colorMatrix.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Generate invoice
exports.generateInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId]
    );

    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [order.user_id]
    );

    const invoice = await generateInvoice(order, itemsResult.rows, userResult.rows[0]);

    res.json({
      success: true,
      data: {
        fileUrl: `/uploads/invoices/${invoice.fileName}`,
        fileName: invoice.fileName
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let conditions = ['is_admin = false'];
    let params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const usersResult = await pool.query(
      `SELECT id, email, first_name, last_name, phone, is_active, created_at,
        (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as order_count
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Toggle user status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({
      success: true,
      message: `User ${result.rows[0].is_active ? 'activated' : 'deactivated'}.`,
      data: { user: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
};
