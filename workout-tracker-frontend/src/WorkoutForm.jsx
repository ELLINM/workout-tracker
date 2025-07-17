// src/WorkoutForm.jsx

import React, { useState, useEffect } from "react"; // Add useEffect
import axios from "axios";

// Add editingWorkout, onWorkoutUpdated, onCancelEdit to props
function WorkoutForm({
  onNewWorkout,
  editingWorkout,
  onWorkoutUpdated,
  onCancelEdit,
}) {
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState([
    { setNumber: 1, repetitions: "", weight: "" },
  ]);
  const [message, setMessage] = useState("");

  // --- Start: useEffect to populate form when editingWorkout changes ---
  useEffect(() => {
    if (editingWorkout) {
      setExerciseName(editingWorkout.exerciseName);
      // Ensure sets are correctly formatted for state
      setSets(
        editingWorkout.sets.map((set) => ({
          setNumber: set.setNumber,
          repetitions: set.repetitions,
          weight: set.weight,
        }))
      );
      setMessage(""); // Clear any previous messages
    } else {
      // Reset form when not editing
      setExerciseName("");
      setSets([{ setNumber: 1, repetitions: "", weight: "" }]);
      setMessage("");
    }
  }, [editingWorkout]); // Re-run effect when editingWorkout changes
  // --- End: useEffect to populate form when editingWorkout changes ---

  const handleExerciseNameChange = (e) => {
    setExerciseName(e.target.value);
  };

  const handleSetChange = (index, e) => {
    const { name, value } = e.target;
    const newSets = [...sets];
    newSets[index][name] = Number(value);
    setSets(newSets);
  };

  const addSet = () => {
    setSets([
      ...sets,
      { setNumber: sets.length + 1, repetitions: "", weight: "" },
    ]);
  };

  const removeSet = (index) => {
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets.map((set, i) => ({ ...set, setNumber: i + 1 })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!exerciseName.trim()) {
      setMessage("Exercise name cannot be empty.");
      return;
    }
    if (sets.some((set) => set.repetitions === "" || set.weight === "")) {
      setMessage("All repetitions and weights must be filled for each set.");
      return;
    }

    try {
      const workoutData = {
        exerciseName,
        date: editingWorkout ? editingWorkout.date : new Date(), // Keep original date if editing, otherwise use new date
        sets,
      };

      let response;
      if (editingWorkout) {
        // --- Start: Update logic for editing ---
        response = await axios.put(
          `/api/workouts/${editingWorkout._id}`,
          workoutData
        );
        setMessage("Workout updated successfully!");
        console.log("Workout updated:", response.data);
        if (onWorkoutUpdated) {
          onWorkoutUpdated(); // Notify parent of update
        }
        // --- End: Update logic for editing ---
      } else {
        // --- Start: Create logic for new workout ---
        response = await axios.post("/api/workouts", workoutData);
        setMessage("Workout added successfully!");
        console.log("New workout added:", response.data);
        if (onNewWorkout) {
          onNewWorkout(); // Notify parent of new workout
        }
        // --- End: Create logic for new workout ---
      }

      // Form clear/reset is handled by useEffect when editingWorkout becomes null
    } catch (error) {
      setMessage(
        `Error ${editingWorkout ? "updating" : "adding"} workout: ${
          error.response?.data?.msg || error.message
        }`
      );
      console.error(
        `Error ${editingWorkout ? "updating" : "adding"} workout:`,
        error
      );
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="workout-form-container">
      <h2>{editingWorkout ? "Edit Workout Record" : "Add New Workout"}</h2>{" "}
      {/* Dynamic title */}
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
              step="0.5"
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

        {/* --- Start: Dynamic buttons for Add/Update/Cancel --- */}
        <button type="submit" className="submit-workout-btn">
          {editingWorkout ? "Update Workout" : "Add Workout"}{" "}
          {/* Dynamic button text */}
        </button>
        {editingWorkout && ( // Show Cancel button only when editing
          <button
            type="button"
            onClick={onCancelEdit}
            className="cancel-edit-btn"
          >
            Cancel Edit
          </button>
        )}
        {/* --- End: Dynamic buttons for Add/Update/Cancel --- */}
      </form>
    </div>
  );
}

export default WorkoutForm;
