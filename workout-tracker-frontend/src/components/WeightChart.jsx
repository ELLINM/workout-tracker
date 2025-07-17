// src/components/WeightChart.jsx

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

function WeightChart({ workoutData, exerciseName }) {
  // Prepare data for Chart.js
  const data = {
    labels: workoutData.map((record) =>
      new Date(record.date).toLocaleDateString()
    ), // Dates for X-axis
    datasets: [
      {
        label: `${exerciseName} Max Weight (kg)`, // Label changed to Max Weight
        data: workoutData.map((record) => {
          // --- Start: Calculate max weight from all sets ---
          if (record.sets.length === 0) {
            return 0;
          }
          // Find the maximum weight among all sets for this workout record
          const maxWeight = Math.max(...record.sets.map((set) => set.weight));
          return maxWeight;
          // --- End: Calculate max weight from all sets ---
        }), // Max Weight for Y-axis
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.1, // Smooth lines
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `${exerciseName} Weight Progress Over Time (Max Weight)`, // Title changed
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Max Weight (kg)", // Y-axis title changed
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
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

export default WeightChart;
