const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 100 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  handleValidationErrors
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const productValidation = [
  body('title').trim().notEmpty().withMessage('Product title is required'),
  body('newPrice').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').isIn(['men_purse', 'ladies_purse', 'gents_belt']).withMessage('Invalid category'),
  body('variants').isArray({ min: 1 }).withMessage('At least one variant is required'),
  handleValidationErrors
];

const orderValidation = [
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.fullName').trim().notEmpty(),
  body('shippingAddress.address').trim().notEmpty(),
  body('shippingAddress.city').trim().notEmpty(),
  body('shippingAddress.phone').trim().notEmpty(),
  body('paymentMethod').isIn(['cod', 'card']).withMessage('Invalid payment method'),
  body('items').isArray({ min: 1 }).withMessage('Order must contain items'),
  handleValidationErrors
];

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Review comment is required'),
  handleValidationErrors
];

const complaintValidation = [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  productValidation,
  orderValidation,
  reviewValidation,
  complaintValidation,
  handleValidationErrors
};
