const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.code === '23505') {
    return res.status(409).json({ message: 'Duplicate entry - this record already exists' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced record does not exist' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
