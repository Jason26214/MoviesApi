const successResponseMiddleware = (req, res, next) => {
  /**
   * Add a `.success()` method to the `res` object for sending a standardized success response.
   * @param {number} statusCode - HTTP status code (e.g., 200, 201).
   * @param {object | array | string} data - The JSON payload to include in the 'data' field.
   */
  res.success = function (statusCode, data) {
    return res.status(statusCode).json({
      success: true,
      data: data,
    });
  };

  next();
};

module.exports = successResponseMiddleware;
