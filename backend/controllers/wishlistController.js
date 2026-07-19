const pool = require('../config/database');

exports.getWishlist = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
        COALESCE(json_agg(
          DISTINCT jsonb_build_object('id', pv.id, 'color', pv.color, 'colorHex', pv.color_hex, 'quantity', pv.quantity)
        ) FILTER (WHERE pv.id IS NOT NULL), '[]') as variants
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       LEFT JOIN product_variants pv ON p.id = pv.product_id
       WHERE w.user_id = $1 AND p.is_active = true
       GROUP BY p.id`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    await pool.query(
      'INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, productId]
    );

    res.status(201).json({ message: 'Added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add to wishlist', error: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    await pool.query(
      'DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove from wishlist', error: error.message });
  }
};
