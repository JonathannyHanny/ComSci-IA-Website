import React, { useState } from "react";
import image2 from "../assets/LogInBackground.png";

import { Link } from "react-router-dom";
import "./Login.css";

export const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Sign up successful! You can now log in.");
      } else {
        setError(data.error || "Sign up failed");
      }
    } catch (err) {
      setError(err?.message || JSON.stringify(err) || "Unknown error");
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
          <div className="text-wrapper">Sign Up</div>
        </div>

        <div className="sub-heading">Welcome to ClassBeyond!</div>

        <form onSubmit={handleSignUp}>
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
            Sign Up
          </button>
        </form>
  {error && <div className="signup-error">{error}</div>}
  {success && <div className="signup-success">{success}</div>}

        <p className="sign-up">
          <span className="span">Already have an account? </span>
           <Link to="/login" className="text-wrapper-4">Log In</Link>
        </p>
      </div>

      <div className="bottom-footing" />
    </div>
  );
};
