// workout-tracker-backend/controllers/workoutController.js

const Workout = require("../models/workout");
const mongoose = require("mongoose");

// get all workouts
const getWorkouts = async (req, res) => {
  const user_id = req.user._id;

  const workouts = await Workout.find({ user_id }).sort({ createdAt: -1 });
  res.status(200).json(workouts);
};

// get a single workout
const getWorkout = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such workout (Invalid ID)" });
  }

  const workout = await Workout.findById(id);

  if (!workout) {
    return res.status(404).json({ error: "No such workout" });
  }

  // Ensure the workout belongs to the authenticated user
  if (workout.user_id.toString() !== req.user._id.toString()) {
    return res
      .status(401)
      .json({ error: "Not authorized to view this workout" });
  }

  res.status(200).json(workout);
};

// create new workout
const createWorkout = async (req, res) => {
  const { exerciseName, date, sets } = req.body;

  let emptyFields = [];

  if (!exerciseName) {
    emptyFields.push("exerciseName");
  }
  if (!date) {
    emptyFields.push("date");
  }
  if (!sets || sets.length === 0) {
    emptyFields.push("sets");
  } else {
    // Check if any set details are missing
    for (const set of sets) {
      if (
        set.repetitions === undefined ||
        set.weight === undefined ||
        set.setNumber === undefined
      ) {
        emptyFields.push("sets_detail"); // Indicate specific set detail missing
        break;
      }
    }
  }

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the fields", emptyFields });
  }

  // add doc to db
  try {
    const user_id = req.user._id;
    const workout = await Workout.create({ exerciseName, date, sets, user_id });
    res.status(200).json(workout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete a workout
const deleteWorkout = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such workout (Invalid ID)" });
  }

  const workout = await Workout.findById(id);

  if (!workout) {
    return res.status(404).json({ error: "No such workout" });
  }

  // Ensure the workout belongs to the authenticated user before deleting
  if (workout.user_id.toString() !== req.user._id.toString()) {
    return res
      .status(401)
      .json({ error: "Not authorized to delete this workout" });
  }

  const deletedWorkout = await Workout.findOneAndDelete({ _id: id });

  res.status(200).json(deletedWorkout);
};

// update a workout - NEW FUNCTION
const updateWorkout = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such workout (Invalid ID)" });
  }

  // Find the workout to ensure it belongs to the authenticated user
  const workout = await Workout.findById(id);

  if (!workout) {
    return res.status(404).json({ error: "No such workout" });
  }

  // Ensure the workout belongs to the authenticated user before updating
  if (workout.user_id.toString() !== req.user._id.toString()) {
    return res
      .status(401)
      .json({ error: "Not authorized to update this workout" });
  }

  // Perform basic validation for required fields in the update request
  const { exerciseName, date, sets } = req.body;
  let emptyFields = [];

  if (!exerciseName) {
    emptyFields.push("exerciseName");
  }
  if (!date) {
    emptyFields.push("date");
  }
  if (!sets || sets.length === 0) {
    emptyFields.push("sets");
  } else {
    // Check if any set details are missing in the updated sets
    for (const set of sets) {
      if (
        set.repetitions === undefined ||
        set.weight === undefined ||
        set.setNumber === undefined
      ) {
        emptyFields.push("sets_detail");
        break;
      }
    }
  }

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the fields", emptyFields });
  }

  // Update the workout
  const updatedWorkout = await Workout.findOneAndUpdate(
    { _id: id },
    { ...req.body }, // Use spread operator to update all fields from req.body
    { new: true } // Return the updated document
  );

  res.status(200).json(updatedWorkout);
};

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkout,
  deleteWorkout,
  updateWorkout, // Export the new updateWorkout function
};
