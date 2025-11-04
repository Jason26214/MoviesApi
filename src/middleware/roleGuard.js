const { createLogger } = require('../utils/logger');

const logger = createLogger(__filename);

/**
 * "Factory function": used to generate a middleware for checking roles.
 * @param {string} role - The required role (e.g., 'admin')
 */
const roleGuard = (role) => {
  return (req, res, next) => {
    // 1. Check if authGuard has run successfully and attached req.user
    if (!req.user) {
      logger.error(
        'roleGuard must be used after authGuard. req.user is not defined.'
      );
      // This is a server-side configuration error, so return 500
      return res
        .status(500)
        .json({ message: 'Server permission configuration error' });
    }

    // 2. Core logic: Check if the user's role matches the required role
    if (req.user.role !== role) {
      logger.warn(
        `Permission denied: User ${req.user.id} (Role: ${req.user.role}) attempted to access a ${role}-only resource.`
      );
      // 403 Forbidden: The server understood the request, but refuses to authorize it.
      return res.status(403).json({
        message: 'Forbidden: You do not have permission to perform this action',
      });
    }

    // 3. Permission check passed!
    next();
  };
};

module.exports = roleGuard;
