// src/App.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import WorkoutForm from "./WorkoutForm";
import WeightChart from "./components/WeightChart"; // Import WeightChart
import VolumeChart from "./components/VolumeChart"; // Import VolumeChart
import "./App.css";

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [selectedExerciseForChart, setSelectedExerciseForChart] = useState("");
  // State to control which chart type is displayed ('weight' or 'volume')
  const [selectedChartType, setSelectedChartType] = useState("weight");

  const fetchWorkouts = useCallback(async () => {
    try {
      const response = await axios.get("/api/workouts");
      setWorkouts(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching workout records:", err);
      setError("Failed to load workout records.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const handleNewWorkoutAdded = () => {
    setLoading(true);
    fetchWorkouts();
    setEditingWorkout(null);
  };

  const handleDeleteWorkout = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this workout record?")
    ) {
      try {
        await axios.delete(`/api/workouts/${id}`);
        setWorkouts(workouts.filter((workout) => workout._id !== id));
        console.log(`Workout with ID ${id} deleted successfully.`);
        setEditingWorkout(null);
      } catch (err) {
        console.error(`Error deleting workout with ID ${id}:`, err);
        setError(`Failed to delete workout record: ${err.message}`);
      }
    }
  };

  const handleEditClick = (workout) => {
    setEditingWorkout(workout);
  };

  const handleWorkoutUpdated = () => {
    setEditingWorkout(null);
    setLoading(true);
    fetchWorkouts();
  };

  const handleCancelEdit = () => {
    setEditingWorkout(null);
  };

  // Handler for chart type selection (Weight or Volume)
  const handleChartTypeChange = (event) => {
    setSelectedChartType(event.target.value);
  };

  // Get unique exercise names for the dropdown
  const uniqueExerciseNames = [
    ...new Set(workouts.map((workout) => workout.exerciseName)),
  ];

  // Filter workouts based on selected exercise for chart and sort by date
  const filteredWorkoutsForChart = workouts
    .filter((workout) => workout.exerciseName === selectedExerciseForChart)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (loading) {
    return <div className="app-container">Loading workout records...</div>;
  }

  if (error) {
    return <div className="app-container error-message">{error}</div>;
  }

  return (
    <div className="app-container">
      <h1>My Workout Records</h1>
      <WorkoutForm
        onNewWorkout={handleNewWorkoutAdded}
        editingWorkout={editingWorkout}
        onWorkoutUpdated={handleWorkoutUpdated}
        onCancelEdit={handleCancelEdit}
      />
      <hr className="divider" />
      <h2>All Recorded Workouts</h2>
      {workouts.length === 0 ? (
        <p>No workout records yet. Start adding some using the form above!</p>
      ) : (
        <>
          {/* Section for Chart Selection and Display */}
          <h2 style={{ marginTop: "30px" }}>Workout Progress Chart</h2>
          <div className="chart-selection" style={{ marginBottom: "20px" }}>
            <label>
              <input
                type="radio"
                value="weight"
                checked={selectedChartType === "weight"}
                onChange={handleChartTypeChange}
              />
              Weight Change
            </label>
            <label style={{ marginLeft: "20px" }}>
              <input
                type="radio"
                value="volume"
                checked={selectedChartType === "volume"}
                onChange={handleChartTypeChange}
              />
              Volume Trend
            </label>
          </div>

          <div className="chart-selection" style={{ marginBottom: "20px" }}>
            <label htmlFor="exerciseSelect">Select Exercise:</label>
            <select
              id="exerciseSelect"
              value={selectedExerciseForChart}
              onChange={(e) => setSelectedExerciseForChart(e.target.value)}
              style={{
                marginLeft: "10px",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">-- Select an exercise --</option>
              {uniqueExerciseNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional rendering of WeightChart or VolumeChart */}
          {selectedExerciseForChart && filteredWorkoutsForChart.length > 0 ? (
            <>
              {selectedChartType === "weight" ? (
                <WeightChart
                  workoutData={filteredWorkoutsForChart}
                  exerciseName={selectedExerciseForChart}
                />
              ) : (
                <VolumeChart
                  workoutData={filteredWorkoutsForChart}
                  exerciseName={selectedExerciseForChart}
                />
              )}
            </>
          ) : selectedExerciseForChart &&
            filteredWorkoutsForChart.length === 0 ? (
            <p>
              No records found for "{selectedExerciseForChart}" to display
              chart.
            </p>
          ) : (
            <p>Please select an exercise to view its progress chart.</p>
          )}
          <hr className="divider" />

          {/* List of all recorded workouts */}
          <div className="workout-list">
            {workouts.map((workout) => (
              <div key={workout._id} className="workout-item">
                <h3>{workout.exerciseName}</h3>
                <p>
                  Date:{" "}
                  {new Date(workout.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <div className="sets-container">
                  <h4>Set Details:</h4>
                  {workout.sets.map((set, index) => (
                    <p key={index} className="set-item">
                      Set {set.setNumber}: {set.repetitions} reps @ {set.weight}{" "}
                      kg
                    </p>
                  ))}
                </div>
                <button
                  onClick={() => handleEditClick(workout)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteWorkout(workout._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
