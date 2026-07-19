const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, adminOnly } = require('../middleware/auth');
const { productValidation } = require('../middleware/validation');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/flash-sale', productController.getFlashSaleProducts);
router.get('/low-stock', auth, adminOnly, productController.getLowStockProducts);
router.get('/:id', productController.getProductById);

// Admin routes
router.post('/', auth, adminOnly, productValidation, productController.createProduct);
router.put('/:id', auth, adminOnly, productValidation, productController.updateProduct);
router.delete('/:id', auth, adminOnly, productController.deleteProduct);

module.exports = router;
