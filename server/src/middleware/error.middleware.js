
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Log for unexpected errors
  if (!err.isOperational) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    status: err.status || "error",
    message: err.isOperational
      ? err.message
      : "Something went wrong. Please try again later.",
  });
};

export default errorMiddleware;
