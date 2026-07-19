const express = require('express');
const router = express.Router();
const siteSettingsController = require('../controllers/siteSettingsController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', siteSettingsController.getSettings);
router.get('/banners', siteSettingsController.getBanners);
router.put('/', auth, adminOnly, siteSettingsController.updateSettings);
router.get('/banners/all', auth, adminOnly, siteSettingsController.getAllBanners);
router.post('/banners', auth, adminOnly, siteSettingsController.createBanner);
router.put('/banners/:id', auth, adminOnly, siteSettingsController.updateBanner);
router.delete('/banners/:id', auth, adminOnly, siteSettingsController.deleteBanner);

module.exports = router;
