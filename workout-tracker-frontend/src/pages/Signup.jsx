// src/pages/Signup.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post("/api/user/signup", {
        email,
        password,
      });

      // --- 인위적인 지연 시간 추가 (개발/테스트용) ---
      // This part should be removed in production
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // --------------------------------------------------

      const json = response.data;

      setIsLoading(false);
      setSuccessMessage("Signup successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 500);
      console.log("User signed up:", json);
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err.response?.data?.error || "Signup failed.";
      setError(errorMessage);
      console.error("Signup error:", errorMessage);
      setTimeout(() => setError(null), 5000);
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
      {/* Updated Password Requirements */}
      <div className="password-requirements">
        <small>Password must be:</small>
        <ul>
          <li>
            <small>At least 8 characters long</small>
          </li>
          <li>
            <small>Include at least one uppercase letter (A-Z)</small>
          </li>
          <li>
            <small>Include at least one lowercase letter (a-z)</small>
          </li>
          <li>
            <small>Include at least one number (0-9)</small>
          </li>
          {/* Optional: if you uncommented the special char validation in backend */}
          {/* <li><small>Include at least one special character (!@#$%^&*)</small></li> */}
        </ul>
      </div>

      <button disabled={isLoading}>
        {isLoading ? "Signing up..." : "Sign Up"}
      </button>
      {error && <div className="error">{error}</div>}
      {successMessage && <div className="success">{successMessage}</div>}
    </form>
  );
};

export default Signup;
