const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// We use a 'pre-save' hook, which will automatically execute before .save() is called.
// Note: We must use the function() keyword here, not an arrow function (=>), because we need 'this'.
userSchema.pre('save', async function (next) {
  // 'this' refers to the user document that is about to be saved.
  const user = this;

  // 1. Check if the password field has been modified (it is 'modified' on new registration).
  // If the password has not been modified (e.g., user is just updating their username), we don't need to re-hash.
  // Prevent re-hashing an already hashed password when "updating user information."
  if (!user.isModified('password')) {
    return next(); // Skip hashing and proceed to the next step.
  }

  // 2. If the password has been modified, perform hashing.
  try {
    // The second argument is the salt round, 12 is a strong value.
    user.password = await bcrypt.hash(user.password, 12);
    next(); // Hashing complete, proceed to the next step (the actual save).
  } catch (error) {
    next(error); // If hashing fails, pass the error to the .save() catch block.
  }
});

// Instance method to validate password
userSchema.methods.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = model('User', userSchema);
