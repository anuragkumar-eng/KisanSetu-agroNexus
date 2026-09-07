/**
 * Basic Error Handling Middleware
 */

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle specific MongoDB errors in the future here
  // if (err.name === 'CastError' && err.kind === 'ObjectId') {
  //   statusCode = 404;
  //   message = 'Resource not found';
  // }

  res.status(statusCode).json({
    success: false,
    message,
    // Provide stack trace only in development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
