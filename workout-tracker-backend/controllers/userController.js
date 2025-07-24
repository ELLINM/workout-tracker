// workout-tracker-backend/controllers/userController.js

const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);

    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// signup user
const signupUser = async (req, res) => {
  const { email, password } = req.body;

  // --- Password validation added here ---
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  }
  if (!/[A-Z]/.test(password)) {
    return res
      .status(400)
      .json({ error: "Password must contain at least one uppercase letter" });
  }
  if (!/[a-z]/.test(password)) {
    return res
      .status(400)
      .json({ error: "Password must contain at least one lowercase letter" });
  }
  if (!/[0-9]/.test(password)) {
    return res
      .status(400)
      .json({ error: "Password must contain at least one number" });
  }
  // Optional: Add special character validation
  // if (!/[!@#$%^&*]/.test(password)) {
  //   return res.status(400).json({ error: 'Password must contain at least one special character (!@#$%^&*)' });
  // }
  // --- End of Password validation ---

  try {
    const user = await User.signup(email, password);
    const token = createToken(user._id);

    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { signupUser, loginUser };
