const User = require('../models/user.model.js');
const { generateToken } = require('../utils/jwt');
const ConflictsException = require('../exceptions/conflicts.exception');

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

  // 5. Return 201 Created and the token using standardized success response
  res.success(201, { token });
  } catch (error) {
    // Mongoose "unique key violation"
    if (error.code === 11000) {
      return next(new ConflictsException('Username already exists'));
    }

    next(error);
  }
};

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthToken'
 *       401:
 *         description: Invalid username or password
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1. Find the user by username
    const user = await User.findOne({ username });

    // 2. Check 1: Does the user exist?
    // For security reasons, we don't tell the user whether it was the "username" or "password" that was wrong
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid username or password' });
    }

    // 3. Check 2: Does the password match?
    // Use the instance method we defined in user.model.js
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid username or password' });
    }

    // 4. Login successful! Define the payload (including role, for RBAC preparation)
    const payload = {
      id: user._id,
      role: user.role,
    };

    // 5. Generate the token
    const token = generateToken(payload);

  // 6. Return the token using standardized success response
  res.success(200, { token });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
