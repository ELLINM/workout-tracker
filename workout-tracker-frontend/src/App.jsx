// src/App.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import WorkoutForm from "./WorkoutForm";
import WeightChart from "./components/WeightChart";
import VolumeChart from "./components/VolumeChart";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import "./App.css";

// Home component (unchanged - as provided in previous steps)
const Home = ({
  workouts,
  loading,
  error,
  editingWorkout,
  setEditingWorkout,
  selectedExerciseForChart,
  setSelectedExerciseForChart,
  selectedChartType,
  setSelectedChartType,
  handleNewWorkoutAdded,
  handleDeleteWorkout,
  handleEditClick,
  handleWorkoutUpdated,
  handleCancelEdit,
  uniqueExerciseNames,
  handleChartTypeChange,
}) => {
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
};

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [selectedExerciseForChart, setSelectedExerciseForChart] = useState("");
  const [selectedChartType, setSelectedChartType] = useState("weight");

  const { user, dispatch: authDispatch } = useAuthContext();
  const navigate = useNavigate();

  // Axios interceptor to add Authorization header
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Clean up interceptor on component unmount or user change
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [user]); // Re-run effect when user object changes

  const fetchWorkouts = useCallback(async () => {
    try {
      const response = await axios.get("/api/workouts");
      setWorkouts(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching workout records:", err);
      // Handle 401 Unauthorized errors (e.g., token expired)
      if (err.response && err.response.status === 401) {
        authDispatch({ type: "LOGOUT" });
        localStorage.removeItem("user");
        navigate("/login");
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to load workout records.");
      }
      setLoading(false);
    }
  }, [authDispatch, navigate]); // Add authDispatch and navigate to dependencies

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    } else {
      // If user logs out or is not logged in, clear workouts and stop loading
      setWorkouts([]);
      setLoading(false);
    }
  }, [fetchWorkouts, user]);

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
        if (err.response && err.response.status === 401) {
          authDispatch({ type: "LOGOUT" });
          localStorage.removeItem("user");
          navigate("/login");
          setError("Session expired. Please log in again to delete workouts.");
        } else {
          setError(`Failed to delete workout record: ${err.message}`);
        }
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

  const handleChartTypeChange = (event) => {
    setSelectedChartType(event.target.value);
  };

  const uniqueExerciseNames = [
    ...new Set(workouts.map((workout) => workout.exerciseName)),
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    authDispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <>
      <nav>
        <Link to="/">
          <h1>Workout Tracker</h1>
        </Link>
        <div>
          {user ? (
            <>
              <span>{user.email}</span>
              <button onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </div>
      </nav>
      <div className="pages">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Home
                  workouts={workouts}
                  loading={loading}
                  error={error}
                  editingWorkout={editingWorkout}
                  setEditingWorkout={setEditingWorkout}
                  selectedExerciseForChart={selectedExerciseForChart}
                  setSelectedExerciseForChart={setSelectedExerciseForChart}
                  selectedChartType={selectedChartType}
                  setSelectedChartType={setSelectedChartType}
                  handleNewWorkoutAdded={handleNewWorkoutAdded}
                  handleDeleteWorkout={handleDeleteWorkout}
                  handleEditClick={handleEditClick}
                  handleWorkoutUpdated={handleWorkoutUpdated}
                  handleCancelEdit={handleCancelEdit}
                  uniqueExerciseNames={uniqueExerciseNames}
                  handleChartTypeChange={handleChartTypeChange}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/" replace /> : <Signup />}
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
