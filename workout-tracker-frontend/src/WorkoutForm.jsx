// src/WorkoutForm.jsx

import React, { useState } from "react";
import axios from "axios";

function WorkoutForm({ onNewWorkout }) {
  // onNewWorkout prop to notify parent of new record
  const [exerciseName, setExerciseName] = useState("");
  // sets is an array of objects, each representing a set
  const [sets, setSets] = useState([
    { setNumber: 1, repetitions: "", weight: "" },
  ]);
  const [message, setMessage] = useState(""); // To display success or error messages

  // Handle changes in exercise name input
  const handleExerciseNameChange = (e) => {
    setExerciseName(e.target.value);
  };

  // Handle changes in individual set inputs
  const handleSetChange = (index, e) => {
    const { name, value } = e.target;
    const newSets = [...sets];
    newSets[index][name] = Number(value); // Convert to number
    setSets(newSets);
  };

  // Add a new set row
  const addSet = () => {
    setSets([
      ...sets,
      { setNumber: sets.length + 1, repetitions: "", weight: "" },
    ]);
  };

  // Remove a set row
  const removeSet = (index) => {
    const newSets = sets.filter((_, i) => i !== index);
    // Re-index setNumbers after removal
    setSets(newSets.map((set, i) => ({ ...set, setNumber: i + 1 })));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Basic validation
    if (!exerciseName.trim()) {
      setMessage("Exercise name cannot be empty.");
      return;
    }
    if (sets.some((set) => set.repetitions === "" || set.weight === "")) {
      setMessage("All repetitions and weights must be filled for each set.");
      return;
    }

    try {
      const newWorkout = {
        exerciseName,
        date: new Date(), // Use current date for the record
        sets,
      };

      // Send POST request to backend API
      const response = await axios.post("/api/workouts", newWorkout);
      setMessage("Workout added successfully!");
      console.log("New workout added:", response.data);

      // Clear the form
      setExerciseName("");
      setSets([{ setNumber: 1, repetitions: "", weight: "" }]);

      // Notify parent component that a new workout was added
      if (onNewWorkout) {
        onNewWorkout();
      }
    } catch (error) {
      setMessage(
        `Error adding workout: ${error.response?.data?.msg || error.message}`
      );
      console.error("Error adding workout:", error);
    } finally {
      setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
    }
  };

  return (
    <div className="workout-form-container">
      <h2>Add New Workout</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="exerciseName">Exercise Name:</label>
          <input
            type="text"
            id="exerciseName"
            value={exerciseName}
            onChange={handleExerciseNameChange}
            placeholder="e.g., Bench Press, Squat"
            required
          />
        </div>

        <h3>Sets:</h3>
        {sets.map((set, index) => (
          <div key={index} className="set-input-group">
            <label>Set {set.setNumber}:</label>
            <input
              type="number"
              name="repetitions"
              value={set.repetitions}
              onChange={(e) => handleSetChange(index, e)}
              placeholder="Reps"
              min="1"
              required
            />
            <input
              type="number"
              name="weight"
              value={set.weight}
              onChange={(e) => handleSetChange(index, e)}
              placeholder="Weight (kg)"
              min="0"
              step="0.5" // Allow decimal for weight
              required
            />
            {sets.length > 1 && (
              <button
                type="button"
                onClick={() => removeSet(index)}
                className="remove-set-btn"
              >
                Remove Set
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addSet} className="add-set-btn">
          Add Another Set
        </button>

        {message && (
          <p
            className={`form-message ${
              message.startsWith("Error") ? "error" : "success"
            }`}
          >
            {message}
          </p>
        )}

        <button type="submit" className="submit-workout-btn">
          Add Workout
        </button>
      </form>
    </div>
  );
}

export default WorkoutForm;
