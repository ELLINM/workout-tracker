// src/pages/Signup.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/user/signup", {
        email,
        password,
      });
      const json = response.data;

      setIsLoading(false);
      console.log("User signed up:", json);
      navigate("/login"); // Redirect to login page
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.error || "Signup failed.");
      console.error("Signup error:", err.response?.data?.error || err.message);
    }
  };

  return (
    <form className="signup" onSubmit={handleSubmit}>
      <h3>Sign Up</h3>

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
      {/* Password requirements added here */}
      <div className="password-requirements">
        <small>Password must be at least 6 characters long.</small>
      </div>

      <button disabled={isLoading}>Sign Up</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default Signup;
