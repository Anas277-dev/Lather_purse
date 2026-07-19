const pool = require('../config/database');

exports.createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user.id;

    // Verify user purchased this product
    const orderCheck = await pool.query(
      `SELECT o.id FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1 AND oi.product_id = $2 AND o.id = $3 AND o.status = 'delivered'`,
      [userId, productId, orderId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(403).json({ message: 'You can only review products you have purchased and received' });
    }

    // Check if already reviewed
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2 AND order_id = $3',
      [userId, productId, orderId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(409).json({ message: 'You have already reviewed this product for this order' });
    }

    const result = await pool.query(
      `INSERT INTO reviews (product_id, user_id, order_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [productId, userId, orderId, rating, comment]
    );

    res.status(201).json({ message: 'Review submitted successfully', review: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit review', error: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await pool.query(
      `SELECT r.*, u.first_name, u.last_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1 AND r.is_approved = true
       ORDER BY r.created_at DESC`,
      [productId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

exports.getPendingReviews = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.first_name, u.last_name, p.title as product_title
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN products p ON r.product_id = p.id
       WHERE r.is_approved = false
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending reviews', error: error.message });
  }
};

exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE reviews SET is_approved = true WHERE id = $1', [id]);
    res.json({ message: 'Review approved' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve review', error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete review', error: error.message });
  }
};
