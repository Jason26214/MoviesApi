const jwt = require('jsonwebtoken');
const config = require('./config');
const { logger } = require('./logger');

// Get the JWT_SECRET from config.js, which is defined in our .env file
const secret = config.JWT_SECRET;

/**
 * Generates a new JWT.
 * @param {object} payload - The data to store in the token (e.g., { id: user._id, role: user.role }).
 */
const generateToken = (payload) => {
  // jwt.sign() is a method from the 'jsonwebtoken' library.
  // Param 1: payload (data)
  // Param 2: secret (key)
  // Param 3: options, e.g., '1d' = expires in 1 day.
  return jwt.sign(payload, secret, { expiresIn: '1d' });
};

/**
 * Validates a JWT.
 * @param {string} token - The token sent from the client.
 * @returns {object | null} - Returns the payload if the token is valid; otherwise, returns null.
 */
const validateToken = (token) => {
  try {
    // jwt.verify() checks if the token has been tampered with or has expired.
    const payload = jwt.verify(token, secret);
    return payload;
  } catch (e) {
    logger.error('Token validation failed!', { error: e.message });

    return null;
  }
};

module.exports = {
  generateToken,
  validateToken,
};
