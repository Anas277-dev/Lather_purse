const pool = require('../config/database');

exports.createComplaint = async (req, res) => {
  try {
    const { orderId, subject, description } = req.body;
    const userId = req.user.id;

    // Verify order belongs to user
    const orderCheck = await pool.query(
      'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Invalid order' });
    }

    const result = await pool.query(
      `INSERT INTO complaints (user_id, order_id, subject, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, orderId, subject, description]
    );

    res.status(201).json({ message: 'Complaint submitted successfully', complaint: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit complaint', error: error.message });
  }
};

exports.getUserComplaints = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, o.tracking_id
       FROM complaints c
       JOIN orders o ON c.order_id = o.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch complaints', error: error.message });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT c.*, u.first_name, u.last_name, u.email, o.tracking_id
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      JOIN orders o ON c.order_id = o.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE c.status = $1';
      params.push(status);
    }

    query += ' ORDER BY c.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch complaints', error: error.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body;

    await pool.query(
      'UPDATE complaints SET status = $1, admin_reply = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [status, adminReply, id]
    );

    res.json({ message: 'Complaint updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update complaint', error: error.message });
  }
};
