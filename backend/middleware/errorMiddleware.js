const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  // Log error for server
  console.error(err.stack);

  res.status(statusCode);

  res.json({
    success: false,
    message: err.message,
    // Only show stack trace in development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
