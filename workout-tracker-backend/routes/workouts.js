// routes/workouts.js

const express = require("express");
const router = express.Router();
const Workout = require("../models/Workout"); // Import the Workout model

// --- API Endpoints ---

// GET /api/workouts
// Get all workout records
router.get("/", async (req, res) => {
  try {
    const workouts = await Workout.find().sort({ date: -1 }); // Sort by date descending
    res.json(workouts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET /api/workouts/:id
// Get a single workout record by ID
router.get("/:id", async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ msg: "Workout record not found" });
    }
    res.json(workout);
  } catch (err) {
    console.error(err.message);
    // Handle cases where the ID format is invalid
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid Workout ID format" });
    }
    res.status(500).send("Server Error");
  }
});

// POST /api/workouts
// Create a new workout record
router.post("/", async (req, res) => {
  const { date, exerciseName, sets } = req.body;

  // Basic validation
  if (!exerciseName || !sets || sets.length === 0) {
    return res
      .status(400)
      .json({ msg: "Please enter all required fields: exerciseName and sets" });
  }

  // Validate sets array structure
  for (const set of sets) {
    if (
      typeof set.setNumber !== "number" ||
      typeof set.repetitions !== "number" ||
      typeof set.weight !== "number"
    ) {
      return res
        .status(400)
        .json({
          msg: "Each set must contain setNumber, repetitions, and weight as numbers.",
        });
    }
  }

  try {
    const newWorkout = new Workout({
      date,
      exerciseName,
      sets,
    });

    const workout = await newWorkout.save();
    res.status(201).json(workout); // 201 Created status for successful resource creation
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// PUT /api/workouts/:id
// Update a workout record by ID
router.put("/:id", async (req, res) => {
  const { date, exerciseName, sets } = req.body;

  // Build workout object
  const workoutFields = {};
  if (date) workoutFields.date = date;
  if (exerciseName) workoutFields.exerciseName = exerciseName;
  if (sets) workoutFields.sets = sets;

  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ msg: "Workout record not found" });
    }

    // Update the workout record
    workout = await Workout.findByIdAndUpdate(
      req.params.id,
      { $set: workoutFields },
      { new: true } // Return the updated document
    );

    res.json(workout);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid Workout ID format" });
    }
    res.status(500).send("Server Error");
  }
});

// DELETE /api/workouts/:id
// Delete a workout record by ID
router.delete("/:id", async (req, res) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id); // Use findByIdAndDelete for simpler code

    if (!workout) {
      return res.status(404).json({ msg: "Workout record not found" });
    }

    res.json({ msg: "Workout record removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid Workout ID format" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
