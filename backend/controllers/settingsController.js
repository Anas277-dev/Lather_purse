const pool = require('../config/database');

// Get all settings
exports.getSettings = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM site_settings ORDER BY key');

    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    next(error);
  }
};

// Update settings (Admin)
exports.updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      await pool.query(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, value]
      );
    }

    res.json({
      success: true,
      message: 'Settings updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Get single setting
exports.getSetting = async (req, res, next) => {
  try {
    const { key } = req.params;

    const result = await pool.query(
      'SELECT * FROM site_settings WHERE key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Setting not found.' });
    }

    res.json({
      success: true,
      data: { setting: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
};
