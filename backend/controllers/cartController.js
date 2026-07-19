const pool = require('../config/database');

// Get cart
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT c.*, p.title, p.new_price, p.old_price, p.images[1] as image,
        pv.color, pv.color_hex, pv.quantity as stock_quantity
       FROM carts c
       JOIN products p ON c.product_id = p.id
       LEFT JOIN product_variants pv ON c.variant_id = pv.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );

    const cartItems = result.rows;
    const subtotal = cartItems.reduce((sum, item) => sum + (item.new_price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        items: cartItems,
        subtotal,
        itemCount,
        shipping: subtotal >= 999 ? 0 : 99
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add to cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Check if product exists and is active
    const productResult = await pool.query(
      'SELECT id, is_active FROM products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0 || !productResult.rows[0].is_active) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable.' });
    }

    // Check variant stock if variantId provided
    if (variantId) {
      const variantResult = await pool.query(
        'SELECT quantity FROM product_variants WHERE id = $1 AND product_id = $2',
        [variantId, productId]
      );

      if (variantResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Variant not found.' });
      }

      if (variantResult.rows[0].quantity < quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${variantResult.rows[0].quantity} items available in stock.` 
        });
      }
    }

    // Check if item already in cart
    const existingResult = await pool.query(
      'SELECT id, quantity FROM carts WHERE user_id = $1 AND product_id = $2 AND variant_id = $3',
      [userId, productId, variantId]
    );

    if (existingResult.rows.length > 0) {
      // Update quantity
      const newQuantity = existingResult.rows[0].quantity + quantity;
      await pool.query(
        'UPDATE carts SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newQuantity, existingResult.rows[0].id]
      );
    } else {
      // Insert new
      await pool.query(
        'INSERT INTO carts (user_id, product_id, variant_id, quantity) VALUES ($1, $2, $3, $4)',
        [userId, productId, variantId, quantity]
      );
    }

    res.json({ success: true, message: 'Item added to cart.' });
  } catch (error) {
    next(error);
  }
};

// Update cart quantity
exports.updateCartQuantity = async (req, res, next) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    // Check stock
    const cartResult = await pool.query(
      `SELECT c.*, pv.quantity as stock_quantity 
       FROM carts c 
       LEFT JOIN product_variants pv ON c.variant_id = pv.id 
       WHERE c.id = $1 AND c.user_id = $2`,
      [cartItemId, userId]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    if (cartResult.rows[0].stock_quantity !== null && quantity > cartResult.rows[0].stock_quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${cartResult.rows[0].stock_quantity} items available.` 
      });
    }

    await pool.query(
      'UPDATE carts SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [quantity, cartItemId]
    );

    res.json({ success: true, message: 'Cart updated.' });
  } catch (error) {
    next(error);
  }
};

// Remove from cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const { cartItemId } = req.params;
    const userId = req.user.id;

    await pool.query(
      'DELETE FROM carts WHERE id = $1 AND user_id = $2',
      [cartItemId, userId]
    );

    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    next(error);
  }
};

// Clear cart
exports.clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await pool.query('DELETE FROM carts WHERE user_id = $1', [userId]);
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
};
