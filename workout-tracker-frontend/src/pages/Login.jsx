// src/pages/Login.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext"; // Import the hook

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useAuthContext(); // Use the auth context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting axios.post...");
      const response = await axios.post("/api/user/login", { email, password });
      const json = response.data;
      console.log("Axios post successful, response:", response);

      // Save the user to local storage
      localStorage.setItem("user", JSON.stringify(json));
      // Update the auth context state
      dispatch({ type: "LOGIN", payload: json });

      setIsLoading(false);
      navigate("/"); // Redirect to home page
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.error || "Login failed.");
      console.error("Login error:", err.response?.data?.error || err.message);
    }
  };

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h3>Login</h3>
      <label>Email:</label>
      <input
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        required
      />
      <label>Password:</label>
      <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        required
      />
      <button disabled={isLoading}>Login</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default Login;
