const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/dashboard', auth, adminOnly, analyticsController.getDashboardStats);
router.get('/revenue', auth, adminOnly, analyticsController.getMonthlyRevenue);
router.get('/categories', auth, adminOnly, analyticsController.getCategorySales);
router.get('/colors', auth, adminOnly, analyticsController.getColorPreferences);

module.exports = router;
