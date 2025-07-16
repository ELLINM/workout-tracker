// server.js (Updated)

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define routes
// Import the workout routes
const workoutRoutes = require("./routes/workouts");

// Use the workout routes for /api/workouts path
app.use("/api/workouts", workoutRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Workout Tracker Backend API is running!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
