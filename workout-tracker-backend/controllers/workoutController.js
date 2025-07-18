const Workout = require("../models/workout");
const mongoose = require("mongoose");

// GET all workouts
const getWorkouts = async (req, res) => {
  const user_id = req.user._id; // Get user_id from the authenticated request
  const workouts = await Workout.find({ user_id }).sort({ date: -1 }); // Find workouts by user_id
  res.status(200).json(workouts);
};

// GET a single workout (unchanged - assumes ID is unique across users or handled by _id check)
const getWorkout = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such workout" });
  }

  const workout = await Workout.findById(id);

  if (!workout) {
    return res.status(404).json({ error: "No such workout" });
  }

  // Ensure only the authenticated user can access their workout
  if (workout.user_id.toString() !== req.user._id.toString()) {
    return res
      .status(401)
      .json({ error: "Not authorized to access this workout" });
  }

  res.status(200).json(workout);
};

// POST a new workout
const createWorkout = async (req, res) => {
  const { exerciseName, sets, date } = req.body;

  let emptyFields = [];

  if (!exerciseName) emptyFields.push("exerciseName");
  if (!sets || sets.length === 0) emptyFields.push("sets");
  if (!date) emptyFields.push("date");

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the fields", emptyFields });
  }

  try {
    const user_id = req.user._id; // Get user_id from the authenticated request
    const workout = await Workout.create({ exerciseName, sets, date, user_id }); // Include user_id
    res.status(200).json(workout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE a workout
const deleteWorkout = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such workout" });
  }

  const workout = await Workout.findById(id);

  if (!workout) {
    return res.status(404).json({ error: "No such workout" });
  }

  // Ensure only the authenticated user can delete their workout
  if (workout.user_id.toString() !== req.user._id.toString()) {
    return res
      .status(401)
      .json({ error: "Not authorized to delete this workout" });
  }

  const deletedWorkout = await Workout.findOneAndDelete({ _id: id });

  res.status(200).json(deletedWorkout);
};

// UPDATE a workout
const updateWorkout = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such workout" });
  }

  const workout = await Workout.findById(id);

  if (!workout) {
    return res.status(404).json({ error: "No such workout" });
  }

  // Ensure only the authenticated user can update their workout
  if (workout.user_id.toString() !== req.user._id.toString()) {
    return res
      .status(401)
      .json({ error: "Not authorized to update this workout" });
  }

  const updatedWorkout = await Workout.findOneAndUpdate(
    { _id: id },
    { ...req.body },
    { new: true }
  );

  res.status(200).json(updatedWorkout);
};

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkout,
  deleteWorkout,
  updateWorkout,
};
