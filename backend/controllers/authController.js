const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { sendWelcomeEmail } = require('../utils/emailService');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, is_admin`,
      [firstName, lastName, email, passwordHash, phone]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    // Send welcome email asynchronously
    sendWelcomeEmail(email, firstName).catch(console.error);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT id, first_name, last_name, email, password_hash, is_admin FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, phone, avatar_url, default_address, is_admin FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      defaultAddress: user.default_address,
      isAdmin: user.is_admin
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, defaultAddress } = req.body;

    const result = await pool.query(
      `UPDATE users SET first_name = $1, last_name = $2, phone = $3, default_address = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING id, first_name, last_name, email, phone, default_address`,
      [firstName, lastName, phone, JSON.stringify(defaultAddress), req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};
