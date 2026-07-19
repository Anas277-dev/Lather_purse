const pool = require('../config/database');

// Get active banners
exports.getBanners = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM banners 
       WHERE is_active = true 
       AND (start_date IS NULL OR start_date <= CURRENT_TIMESTAMP)
       AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)
       ORDER BY display_order ASC`
    );

    res.json({
      success: true,
      data: { banners: result.rows }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all banners
exports.getAllBanners = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM banners ORDER BY display_order ASC');

    res.json({
      success: true,
      data: { banners: result.rows }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create banner
exports.createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, imageUrl, linkUrl, displayOrder, isActive, startDate, endDate } = req.body;

    const result = await pool.query(
      `INSERT INTO banners (title, subtitle, image_url, link_url, display_order, is_active, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, subtitle, imageUrl, linkUrl, displayOrder || 0, isActive !== false, startDate, endDate]
    );

    res.status(201).json({
      success: true,
      message: 'Banner created successfully.',
      data: { banner: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update banner
exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, subtitle, imageUrl, linkUrl, displayOrder, isActive, startDate, endDate } = req.body;

    const result = await pool.query(
      `UPDATE banners 
       SET title = COALESCE($1, title),
           subtitle = COALESCE($2, subtitle),
           image_url = COALESCE($3, image_url),
           link_url = COALESCE($4, link_url),
           display_order = COALESCE($5, display_order),
           is_active = COALESCE($6, is_active),
           start_date = COALESCE($7, start_date),
           end_date = COALESCE($8, end_date)
       WHERE id = $9
       RETURNING *`,
      [title, subtitle, imageUrl, linkUrl, displayOrder, isActive, startDate, endDate, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

    res.json({
      success: true,
      message: 'Banner updated successfully.',
      data: { banner: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete banner
exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM banners WHERE id = $1', [id]);

    res.json({ success: true, message: 'Banner deleted.' });
  } catch (error) {
    next(error);
  }
};
