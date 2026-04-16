function notFound(req, res, _next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
}

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
}

export { notFound, errorHandler };