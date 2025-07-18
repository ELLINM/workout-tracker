const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); // Assuming your User model path

const requireAuth = async (req, res, next) => {
  // Verify authentication
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1]; // Expects 'Bearer TOKEN'

  try {
    const { _id } = jwt.verify(token, process.env.SECRET); // Verify token with secret
    // Find user by _id and attach to request object (excluding password)
    req.user = await User.findOne({ _id }).select("_id");
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
