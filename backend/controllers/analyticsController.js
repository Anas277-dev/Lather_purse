const pool = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    // Total revenue
    const revenueResult = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status != 'cancelled'"
    );

    // Total orders
    const ordersResult = await pool.query('SELECT COUNT(*) as total_orders FROM orders');

    // Pending orders
    const pendingResult = await pool.query(
      "SELECT COUNT(*) as pending_orders FROM orders WHERE status IN ('order_placed', 'dispatched')"
    );

    // Open complaints
    const complaintsResult = await pool.query(
      "SELECT COUNT(*) as open_complaints FROM complaints WHERE status = 'open'"
    );

    // Low stock count
    const lowStockResult = await pool.query(
      'SELECT COUNT(DISTINCT product_id) as low_stock FROM product_variants WHERE quantity < 3'
    );

    res.json({
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue),
      totalOrders: parseInt(ordersResult.rows[0].total_orders),
      pendingOrders: parseInt(pendingResult.rows[0].pending_orders),
      openComplaints: parseInt(complaintsResult.rows[0].open_complaints),
      lowStockProducts: parseInt(lowStockResult.rows[0].low_stock)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};

exports.getMonthlyRevenue = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as order_count
       FROM orders
       WHERE status != 'cancelled' AND created_at >= NOW() - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch revenue data', error: error.message });
  }
};

exports.getCategorySales = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.category, COUNT(*) as sales_count, SUM(oi.quantity * oi.unit_price) as revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status != 'cancelled'
       GROUP BY p.category`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category sales', error: error.message });
  }
};

exports.getColorPreferences = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT oi.color, COUNT(*) as count
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status != 'cancelled' AND oi.color IS NOT NULL
       GROUP BY oi.color
       ORDER BY count DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch color preferences', error: error.message });
  }
};
