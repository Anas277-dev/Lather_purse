const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, adminOnly } = require('../middleware/auth');
const { orderValidation } = require('../middleware/validation');

router.post('/', auth, orderValidation, orderController.createOrder);
router.get('/my-orders', auth, orderController.getUserOrders);
router.get('/tracking/:trackingId', auth, orderController.getOrderByTrackingId);
router.get('/all', auth, adminOnly, orderController.getAllOrders);
router.put('/:id/status', auth, adminOnly, orderController.updateOrderStatus);
router.get('/:id/invoice', auth, adminOnly, orderController.generateInvoice);

module.exports = router;
