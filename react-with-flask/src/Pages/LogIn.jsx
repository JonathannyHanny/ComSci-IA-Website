// Login page - enter email/password to authenticate
// Stores user info in cookies and redirects to dashboard

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import image2 from "../assets/LogInBackground.png";
import { colors, authCard, authBrand, authHeading, authInput, authButton } from '../components/styles';
import AuthBackground from '../components/AuthBackground';

export const LogInPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const navigate = useNavigate();

  // Update our form state whenever the user types in an input field
  // This keeps the text boxes in sync with the form state
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // When the user clicks "Log In", send their credentials to the backend
  async function handleLogin(e) {
    e.preventDefault(); // Don't refresh the page (default form behavior)
    setError(""); // Clear any previous error message
    setLoggingIn(true); // Show loading state on the button
    try {
      // Send a POST request to the backend with email and password
      const response = await fetch("/api/login", {
        method: "POST",
        // We need to set Content-Type to application/json so Flask knows how to parse the request
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form) // Convert our form object to JSON string
      });
      const data = await response.json(); // Parse the backend's response
      if (response.ok) {
        // Login succeeded! Store all the user info in cookies so we can access it on other pages
        // These cookies persist until the user logs out or closes their browser
        document.cookie = `logged_in=true; path=/`;
        document.cookie = `user_email=${data.email}; path=/`;
        document.cookie = `user_first_name=${data.first_name || ''}; path=/`;
        document.cookie = `user_last_name=${data.last_name || ''}; path=/`;
        document.cookie = `user_id=${data.user_id}; path=/`;
        // Store admin status as a string 'true' or 'false' (cookies can only store strings)
        document.cookie = `user_is_admin=${data.is_admin ? 'true' : 'false'}; path=/`;
        // Redirect to the dashboard - login is complete!
        navigate("/dashboard");
      } else {
        // Login failed - show the error message from the backend
        setError(data.error || "Login failed");
      }
    } catch {
      // If the fetch itself fails (network error, backend down, etc), show a generic error
      setError("Server error");
    }
    setLoggingIn(false); // Clear the loading state
  }

  return (
    <AuthBackground image={image2}>
      <div className="d-flex align-items-stretch justify-content-end" style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0 }}>
        {/* Login card - positioned on the right side of the screen */}
        <div className="card p-4 shadow d-flex flex-column justify-content-center rounded-0" style={authCard}>
          {/* App branding - "ClassBeyond" with styled text */}
          <div className="mb-2 text-start" style={authBrand}>
            <span className="fw-bold fs-1" style={{ color: '#212529' }}>Class</span>
            <span className="fw-bold fs-1" style={{ color: '#ff5f57' }}>Beyond</span>
          </div>
          {/* Page title and welcome message */}
          <div style={authBrand}>
            <h2 style={authHeading}>Log In</h2>
            <div className="text-muted mb-2 text-start">Welcome back to ClassBeyond!</div>
          </div>
          {/* Login form with email and password fields */}
          <form onSubmit={handleLogin}>
            <div className="d-flex flex-column align-items-center">
              {/* Email input field */}
              <div className="mb-3 w-100 d-flex justify-content-center">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={authInput}
                />
              </div>
              {/* Password input field */}
              <div className="mb-3 w-100 d-flex justify-content-center">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={authInput}
                />
              </div>
              {/* Submit button - shows "Logging in..." while the request is happening */}
              <button type="submit" className="btn mb-2" style={authButton} disabled={loggingIn}>{loggingIn ? 'Logging in, please wait' : 'Log In'}</button>
            </div>
          </form>
          {/* Show error message if login fails */}
          {error && <div className="alert alert-danger mt-2">{error}</div>}
          {/* Link to signup page for new users */}
          <div className="text-center mt-3">
            <span>Don't have an account? </span>
            <Link to="/signup" className="link-primary">Sign up</Link>
          </div>
        </div>
      </div>
    </AuthBackground>
  );
};
