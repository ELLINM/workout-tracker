// models/workout.js

const mongoose = require("mongoose");

// Define the schema for individual sets within an exercise
const SetSchema = new mongoose.Schema(
  {
    setNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    repetitions: {
      type: Number,
      required: true,
      min: 1,
    },
    weight: {
      type: Number,
      required: true,
      min: 0, // Weight can be 0 for bodyweight exercises
    },
  },
  { _id: false }
); // Do not create a separate _id for sub-documents (sets)

// Define the main schema for a workout record
const WorkoutSchema = new mongoose.Schema(
  {
    // It's good practice to include a userId for future authentication/user management
    // For now, we can omit it if not implementing user auth immediately, but keep in mind for scalability.
    // user_id field added here for linking workouts to specific users
    user_id: {
      type: String, // Store as String, as _id from Mongoose is String representation of ObjectId
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now, // Default to the current date/time when created
    },
    exerciseName: {
      type: String,
      required: true,
      trim: true, // Remove leading/trailing whitespace
    },
    sets: {
      type: [SetSchema], // Array of set objects defined by SetSchema
      required: true,
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt timestamps automatically
  }
);

// Create a Mongoose model from the schema
const Workout = mongoose.model("Workout", WorkoutSchema);

module.exports = Workout;
