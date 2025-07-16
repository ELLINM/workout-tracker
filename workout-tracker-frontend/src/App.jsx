// src/App.jsx (Updated)

import React, { useState, useEffect, useCallback } from "react"; // Add useCallback
import axios from "axios";
import WorkoutForm from "./WorkoutForm"; // Import WorkoutForm
import "./App.css";

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useCallback to memoize fetchWorkouts function
  // This prevents infinite loops if used in useEffect dependencies
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
  }, []); // Dependencies for useCallback: empty means it's created once

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]); // Depend on fetchWorkouts (which is memoized by useCallback)

  // Function to call when a new workout is added by WorkoutForm
  const handleNewWorkoutAdded = () => {
    setLoading(true); // Show loading state while refetching
    fetchWorkouts(); // Re-fetch workouts to update the list
  };

  if (loading) {
    return <div className="app-container">Loading workout records...</div>;
  }

  if (error) {
    return <div className="app-container error-message">{error}</div>;
  }

  return (
    <div className="app-container">
      <h1>My Workout Records</h1>
      {/* Render the WorkoutForm component */}
      <WorkoutForm onNewWorkout={handleNewWorkoutAdded} />
      <hr className="divider" /> {/* Optional divider */}
      <h2>All Recorded Workouts</h2>
      {workouts.length === 0 ? (
        <p>No workout records yet. Start adding some using the form above!</p>
      ) : (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
