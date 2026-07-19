const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth, adminOnly } = require('../middleware/auth');
const { reviewValidation } = require('../middleware/validation');

router.post('/', auth, reviewValidation, reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/pending', auth, adminOnly, reviewController.getPendingReviews);
router.put('/:id/approve', auth, adminOnly, reviewController.approveReview);
router.delete('/:id', auth, adminOnly, reviewController.deleteReview);

module.exports = router;
