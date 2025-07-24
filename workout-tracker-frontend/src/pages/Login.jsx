// src/pages/Login.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post("/api/user/login", { email, password });

      // --- 인위적인 지연 시간 추가 (개발/테스트용) ---
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5초 지연
      // --------------------------------------------------

      const json = response.data;

      localStorage.setItem("user", JSON.stringify(json));
      dispatch({ type: "LOGIN", payload: json });

      setIsLoading(false);
      setSuccessMessage("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 500);
      console.log("User logged in:", json);
    } catch (err) {
      setIsLoading(false);
      const errorMessage =
        err.response?.data?.error ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      console.error("Login error:", errorMessage);
      setTimeout(() => setError(null), 5000); // Clear error message after 5 seconds
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
      <button disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
      {error && <div className="error">{error}</div>}
      {successMessage && <div className="success">{successMessage}</div>}
    </form>
  );
};

export default Login;
