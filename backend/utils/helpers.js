const { v4: uuidv4 } = require('uuid');

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LG-${timestamp}-${random}`;
};

// Generate tracking token
const generateTrackingToken = () => {
  return uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
};

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
};

// Format currency
const formatCurrency = (amount, symbol = '₹') => {
  return `${symbol}${parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Calculate discount percentage
const calculateDiscount = (oldPrice, newPrice) => {
  if (!oldPrice || oldPrice <= newPrice) return 0;
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
};

// Paginate results
const paginate = (query, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit: parseInt(limit) };
};

// Create paginated response
const createPaginatedResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: parseInt(total),
      itemsPerPage: parseInt(limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  };
};

// Sanitize user object (remove sensitive data)
const sanitizeUser = (user) => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

module.exports = {
  generateOrderNumber,
  generateTrackingToken,
  generateSlug,
  formatCurrency,
  calculateDiscount,
  paginate,
  createPaginatedResponse,
  sanitizeUser
};
