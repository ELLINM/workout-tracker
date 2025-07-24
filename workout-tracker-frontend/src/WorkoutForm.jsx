// src/WorkoutForm.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";

const WorkoutForm = ({
  onNewWorkout,
  editingWorkout,
  onWorkoutUpdated,
  onCancelEdit,
}) => {
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState([
    { setNumber: 1, repetitions: "", weight: "" },
  ]);
  const [date, setDate] = useState("");
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (editingWorkout) {
      setExerciseName(editingWorkout.exerciseName);
      setSets(
        editingWorkout.sets.map((set) => ({
          ...set,
          repetitions: String(set.repetitions),
          weight: String(set.weight),
        }))
      );
      setDate(new Date(editingWorkout.date).toISOString().split("T")[0]);
    } else {
      setExerciseName("");
      setSets([{ setNumber: 1, repetitions: "", weight: "" }]);
      setDate("");
      setError(null);
      setEmptyFields([]);
      setSuccessMessage(null);
    }
  }, [editingWorkout]);

  const handleSetChange = (index, field, value) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const handleAddSet = () => {
    setSets([
      ...sets,
      { setNumber: sets.length + 1, repetitions: "", weight: "" },
    ]);
  };

  const handleRemoveSet = (index) => {
    if (sets.length > 1) {
      const newSets = sets
        .filter((_, i) => i !== index)
        .map((set, i) => ({ ...set, setNumber: i + 1 }));
      setSets(newSets);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setEmptyFields([]);
    setSuccessMessage(null);

    const workoutData = {
      exerciseName,
      sets: sets.map((set) => ({
        ...set,
        repetitions: Number(set.repetitions),
        weight: Number(set.weight),
      })),
      date,
    };

    let url = "/api/workouts";
    let method = "post";

    if (editingWorkout) {
      url = `/api/workouts/${editingWorkout._id}`;
      method = "patch";
    }

    try {
      let response;
      if (method === "post") {
        response = await axios.post(url, workoutData);
      } else {
        // patch
        response = await axios.patch(url, workoutData);
      }

      // --- 인위적인 지연 시간 추가 (개발/테스트용) ---
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5초 지연
      // --------------------------------------------------

      setIsLoading(false);
      setExerciseName("");
      setSets([{ setNumber: 1, repetitions: "", weight: "" }]);
      setDate("");
      setEmptyFields([]);

      if (editingWorkout) {
        onWorkoutUpdated();
        setSuccessMessage("Workout updated successfully!");
      } else {
        onNewWorkout();
        setSuccessMessage("Workout added successfully!");
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setIsLoading(false);
      const errorData = err.response?.data;
      if (errorData?.emptyFields) {
        setError(errorData.error);
        setEmptyFields(errorData.emptyFields);
      } else {
        setError(
          errorData?.error ||
            (editingWorkout
              ? "Failed to update workout."
              : "Failed to add workout.")
        );
      }
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <form className="create" onSubmit={handleSubmit}>
      <h3>{editingWorkout ? "Edit Workout Record" : "Add a New Workout"}</h3>

      <label>Exercise Name:</label>
      <input
        type="text"
        onChange={(e) => setExerciseName(e.target.value)}
        value={exerciseName}
        className={emptyFields.includes("exerciseName") ? "error" : ""}
        required
      />

      <label>Date:</label>
      <input
        type="date"
        onChange={(e) => setDate(e.target.value)}
        value={date}
        className={emptyFields.includes("date") ? "error" : ""}
        required
      />

      <h4>Sets:</h4>
      {sets.map((set, index) => (
        <div key={index} className="set-input-group">
          <span>Set {set.setNumber}:</span>
          <input
            type="number"
            placeholder="Reps"
            value={set.repetitions}
            onChange={(e) =>
              handleSetChange(index, "repetitions", e.target.value)
            }
            className={
              emptyFields.includes("sets") && !set.repetitions ? "error" : ""
            }
            required
            min="1"
          />
          <input
            type="number"
            placeholder="Weight (kg)"
            value={set.weight}
            onChange={(e) => handleSetChange(index, "weight", e.target.value)}
            className={
              emptyFields.includes("sets") && !set.weight ? "error" : ""
            }
            required
            min="0"
          />
          {sets.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveSet(index)}
              className="remove-set-btn"
            >
              Remove Set
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={handleAddSet} className="add-set-btn">
        Add Another Set
      </button>

      <button disabled={isLoading}>
        {isLoading
          ? editingWorkout
            ? "Updating..."
            : "Adding..."
          : editingWorkout
          ? "Update Workout"
          : "Add Workout"}
      </button>
      {editingWorkout && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="cancel-edit-btn"
          disabled={isLoading}
        >
          Cancel Edit
        </button>
      )}

      {error && <div className="error">{error}</div>}
      {successMessage && <div className="success">{successMessage}</div>}
    </form>
  );
};

export default WorkoutForm;
