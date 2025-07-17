// src/components/VolumeChart.jsx

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function VolumeChart({ workoutData, exerciseName }) {
  // Prepare data for Chart.js
  const data = {
    // Labels for the X-axis (dates of workouts)
    labels: workoutData.map((record) =>
      new Date(record.date).toLocaleDateString()
    ),
    datasets: [
      {
        // Label for the dataset in the legend
        label: `${exerciseName} Volume (kg * reps * sets)`,
        // Data points for the Y-axis (calculated total volume for each workout)
        data: workoutData.map((record) => {
          let totalVolume = 0;
          // Calculate total volume for each workout record by summing up volume of all sets
          record.sets.forEach((set) => {
            // Volume for a single set = weight * repetitions * setNumber (if setNumber reflects actual sets,
            // or just 1 if setNumber is just an index)
            // Assuming setNumber in sets array is just an index (1, 2, 3...) not actual set count
            // So, volume per set = weight * repetitions
            totalVolume += set.weight * set.repetitions;
          });
          return totalVolume;
        }),
        // Styling for the line chart
        borderColor: "rgb(54, 162, 235)", // Blue color
        backgroundColor: "rgba(54, 162, 235, 0.5)", // Transparent blue fill
        tension: 0.1, // Smoothness of the line
      },
    ],
  };

  // Options for the Chart.js chart
  const options = {
    responsive: true, // Make chart responsive to container size
    plugins: {
      legend: {
        position: "top", // Position the legend at the top
      },
      title: {
        display: true, // Display chart title
        text: `${exerciseName} Volume Progress Over Time`, // Chart title text
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Start Y-axis at zero
        title: {
          display: true, // Display Y-axis title
          text: "Volume (kg * reps)", // Y-axis title text. Changed from (kg * reps * sets)
        },
      },
      x: {
        title: {
          display: true, // Display X-axis title
          text: "Date", // X-axis title text
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", maxWidth: "700px", margin: "20px auto" }}>
      <Line data={data} options={options} />
    </div>
  );
}

export default VolumeChart;
