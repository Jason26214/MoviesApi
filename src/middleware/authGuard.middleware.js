const { validateToken } = require('../utils/jwt');
const { createLogger } = require('../utils/logger');

const logger = createLogger(__filename);

module.exports = (req, res, next) => {
  // 1. Get 'Authorization' from the request header
  const authorization = req.header('Authorization');

  // 2. Check 1: Does it exist?
  if (!authorization) {
    logger.warn('Missing authorization header');
    return res.status(401).json({ message: 'Missing authorization header' });
  }

  // 3. Check 2: Is the format correct?
  // The format should be "Bearer <token>"
  const [type, token] = authorization.split(' ');
  if (type !== 'Bearer' || !token) {
    logger.warn('Invalid token format');
    return res.status(401).json({ message: 'Invalid token format' });
  }

  // 4. Check 3: Is the token valid? (using our jwt.js utility)
  const payload = validateToken(token);
  if (!payload) {
    logger.warn('Invalid token');
    return res.status(401).json({ message: 'Invalid token' });
  }

  // 5. Success!
  // Attach the payload (i.e., { id: '...', role: '...' }) to req.user
  req.user = payload;

  // 6. Proceed, let the request continue to the next middleware or route handler
  next();
};
