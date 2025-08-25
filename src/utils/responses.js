const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    ...data
  });
};

const sendError = (res, message, statusCode = 400, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

module.exports = {
  sendSuccess,
  sendError
};