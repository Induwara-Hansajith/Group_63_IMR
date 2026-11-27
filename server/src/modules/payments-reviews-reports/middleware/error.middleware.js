function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error.';

  // Map MS SQL Server constraint errors to clean HTTP status codes
  if (err.number === 2627 || err.number === 2601) {
    statusCode = 409;
    message = 'Duplicate record violates a unique constraint.';
  } else if (err.number === 547) {
    statusCode = 400;
    message = 'Database constraint violation (invalid reference or value).';
  }
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error ${statusCode}]`, err.message);
  }
  return res.status(statusCode).json({
    success: false,
    message,
    data: err.details || null,
  });
}
module.exports = { errorHandler };