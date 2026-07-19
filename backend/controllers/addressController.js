const pool = require('../config/database');

// Get addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    res.json({
      success: true,
      data: { addresses: result.rows }
    });
  } catch (error) {
    next(error);
  }
};

// Create address
exports.createAddress = async (req, res, next) => {
  try {
    const { label, fullName, streetAddress, city, state, postalCode, country, phone, isDefault } = req.body;
    const userId = req.user.id;

    // If setting as default, unset others
    if (isDefault) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    }

    const result = await pool.query(
      `INSERT INTO addresses (user_id, label, full_name, street_address, city, state, postal_code, country, phone, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, label || 'Home', fullName, streetAddress, city, state, postalCode, country || 'India', phone, isDefault || false]
    );

    res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      data: { address: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Update address
exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, fullName, streetAddress, city, state, postalCode, country, phone, isDefault } = req.body;
    const userId = req.user.id;

    if (isDefault) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    }

    const result = await pool.query(
      `UPDATE addresses 
       SET label = COALESCE($1, label),
           full_name = COALESCE($2, full_name),
           street_address = COALESCE($3, street_address),
           city = COALESCE($4, city),
           state = COALESCE($5, state),
           postal_code = COALESCE($6, postal_code),
           country = COALESCE($7, country),
           phone = COALESCE($8, phone),
           is_default = COALESCE($9, is_default)
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [label, fullName, streetAddress, city, state, postalCode, country, phone, isDefault, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    res.json({
      success: true,
      message: 'Address updated successfully.',
      data: { address: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Delete address
exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [id, userId]);

    res.json({ success: true, message: 'Address deleted.' });
  } catch (error) {
    next(error);
  }
};
