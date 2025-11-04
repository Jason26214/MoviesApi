const User = require('../models/user.model.js');
const { generateToken } = require('../utils/jwt');
const { createLogger } = require('../utils/logger');

const logger = createLogger(__filename);

/**
 * @swagger
 * /v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewUser'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthToken'
 *       400:
 *         description: Invalid request data (e.g., missing fields, duplicate username)
 */
const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1. Create a User instance (If password is undefined, it will be undefined here)
    const user = new User({ username, password });

    // 2. Save to the database
    // Mongoose will trigger the 'pre-save' hook here
    await user.save();

    // 3. Define the payload! (as we discussed)
    // We store the id and role in the token for subsequent permission checks
    const payload = {
      id: user._id,
      role: user.role, // role defaults to 'user'
    };

    // 4. Use the helper function from jwt.js to generate the token
    const token = generateToken(payload);

    // 5. Return 201 Created and the token
    res.status(201).json({ token });
  } catch (error) {
    logger.error('Registration failed', error);

    // Mongoose validation error (e.g., username not provided)
    if (error.name === 'ValidationError') {
      return res
        .status(400)
        .json({ message: 'Validation failed', error: error.message });
    }

    // This is a new and very important error handling!
    // "11000" is the error code for "unique key violation" in MongoDB
    // (because we set username: { unique: true } in user.model.js)
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Username already exists',
      });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res, next) => {
  // TODO:
};

module.exports = {
  register,
  login,
};
