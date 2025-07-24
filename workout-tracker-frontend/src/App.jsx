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

// date-fns for formatting dates
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale"; // Import Korean locale for date-fns

import "./App.css";

// Home component (MODIFIED to correctly handle props and render edit button/date/sets)
const Home = ({
  workouts,
  loading,
  error,
  editingWorkout,
  selectedExerciseForChart,
  setSelectedExerciseForChart,
  selectedChartType,
  setSelectedChartType,
  handleNewWorkoutAdded, // Renamed from handleWorkoutChange for clarity
  handleDeleteWorkout,
  handleEditClick, // Passed from App component
  handleWorkoutUpdated, // Passed from App component
  handleCancelEdit, // Passed from App component
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

          {/* Workout List Rendering - MODIFIED */}
          <div className="workout-list">
            {workouts.map((workout) => (
              <div key={workout._id} className="workout-item workout-details">
                {" "}
                {/* Added workout-details class for consistent styling */}
                <h4>{workout.exerciseName}</h4>
                <p>
                  <strong>Date: </strong>
                  {new Date(workout.date).toLocaleDateString("ko-KR")}{" "}
                  {/* Use ko-KR for date */}
                </p>
                <div className="sets-container">
                  <strong>Set Details:</strong>
                  <ul>
                    {" "}
                    {/* Changed to unordered list for sets */}
                    {workout.sets.map((set, index) => (
                      <li key={index} className="set-item">
                        Set {set.setNumber}: {set.repetitions} reps @{" "}
                        {set.weight} kg
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Action Buttons - MODIFIED to use material icons */}
                <span
                  className="material-symbols-outlined delete-icon"
                  onClick={() => handleDeleteWorkout(workout._id)}
                >
                  delete
                </span>
                <span
                  className="material-symbols-outlined edit-icon"
                  onClick={() => handleEditClick(workout)}
                >
                  edit
                </span>
                {/* Original buttons were here:
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
                */}
                <p className="time-ago">
                  {" "}
                  {/* Added class for time ago styling */}
                  {formatDistanceToNow(new Date(workout.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </p>
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
  const [editingWorkout, setEditingWorkout] = useState(null); // State to hold the workout being edited
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
  }, [user]);

  const fetchWorkouts = useCallback(async () => {
    setLoading(true); // Start loading before fetch
    setError(null); // Clear previous errors

    if (!user) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("/api/workouts");
      // --- 인위적인 지연 시간 추가 (개발/테스트용) ---
      // This part should be removed in production
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 지연
      // --------------------------------------------------
      setWorkouts(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching workout records:", err);
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
  }, [authDispatch, navigate, user]);

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    } else {
      setWorkouts([]);
      setLoading(false);
    }
  }, [fetchWorkouts, user]);

  const handleNewWorkoutAdded = () => {
    setEditingWorkout(null); // Clear editing state when new workout is added
    fetchWorkouts(); // Re-fetch all workouts
  };

  const handleDeleteWorkout = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this workout record?")
    ) {
      try {
        await axios.delete(`/api/workouts/${id}`);
        // No need to filter workouts here, fetchWorkouts will refresh
        // setWorkouts(workouts.filter((workout) => workout._id !== id));
        console.log(`Workout with ID ${id} deleted successfully.`);
        setEditingWorkout(null); // Clear editing state if deleted workout was being edited
        fetchWorkouts(); // Re-fetch to update the list and clear cache
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
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top for form
  };

  const handleWorkoutUpdated = () => {
    setEditingWorkout(null);
    fetchWorkouts(); // Re-fetch to update the list
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
                  setEditingWorkout={setEditingWorkout} // Not used directly in Home, but passed for consistency
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
