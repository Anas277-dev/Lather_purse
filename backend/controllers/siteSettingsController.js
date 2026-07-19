const pool = require('../config/database');

exports.getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_settings ORDER BY id LIMIT 1');
    if (result.rows.length === 0) {
      return res.json({ offerBarText: '', offerBarActive: false, whatsappNumber: '' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings', error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { offerBarText, offerBarActive, whatsappNumber } = req.body;

    const result = await pool.query(
      `INSERT INTO site_settings (id, offer_bar_text, offer_bar_active, whatsapp_number)
       VALUES (1, $1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         offer_bar_text = EXCLUDED.offer_bar_text,
         offer_bar_active = EXCLUDED.offer_bar_active,
         whatsapp_number = EXCLUDED.whatsapp_number,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [offerBarText, offerBarActive, whatsappNumber]
    );

    res.json({ message: 'Settings updated', settings: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings', error: error.message });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM banners WHERE is_active = true ORDER BY display_order'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch banners', error: error.message });
  }
};

exports.getAllBanners = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM banners ORDER BY display_order');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch banners', error: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const { title, imageUrl, linkUrl, displayOrder } = req.body;
    const result = await pool.query(
      'INSERT INTO banners (title, image_url, link_url, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, imageUrl, linkUrl, displayOrder]
    );
    res.status(201).json({ message: 'Banner created', banner: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create banner', error: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, imageUrl, linkUrl, displayOrder, isActive } = req.body;
    await pool.query(
      'UPDATE banners SET title = $1, image_url = $2, link_url = $3, display_order = $4, is_active = $5 WHERE id = $6',
      [title, imageUrl, linkUrl, displayOrder, isActive, id]
    );
    res.json({ message: 'Banner updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update banner', error: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM banners WHERE id = $1', [id]);
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete banner', error: error.message });
  }
};
