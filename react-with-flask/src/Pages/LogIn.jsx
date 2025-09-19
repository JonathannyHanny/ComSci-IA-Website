import React, { useState } from "react";
import image2 from "../assets/LogInBackground.png";
import "./Login.css";

import { Link } from "react-router-dom";

export const LogInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        alert("Login successful!");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="log-in-page">
      <img className="image" alt="Image" src={image2} />

      <div className="content-box">
        <div className="ClassBeyond">
          <span className="title-wrapper">Class</span>
          <span className="title-wrapper">Beyond</span>
        </div>

        <div className="title">
          <div className="text-wrapper">Log In</div>
        </div>

        <div className="sub-heading">Welcome back to ClassBeyond!</div>

        <form onSubmit={handleLogin}>
          <div className="email">
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="password">
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="log-in-button" type="submit">
            Log In
          </button>
        </form>
        {error && <div className="login-error">{error}</div>}

        <p className="sign-up">
          <span className="span">Don't have an account? </span>
          <Link to="/signup" className="text-wrapper-4">Sign up</Link>
        </p>
      </div>

      <div className="bottom-footing" />
    </div>
  );
};
