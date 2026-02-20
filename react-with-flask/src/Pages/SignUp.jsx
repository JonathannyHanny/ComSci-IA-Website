// Sign-up page - create new account
// Collects name, email, password (twice for confirmation)

import React, { useState } from "react";
import image2 from "../assets/LogInBackground.png";
import { Link } from "react-router-dom";
import { colors, authCard, authBrand, authHeading, authInput, authButton } from '../components/styles';
import AuthBackground from '../components/AuthBackground';

export const SignUpPage = () => {
  // Track all the form fields the user needs to fill out
  const [form, setForm] = useState({
    email: "",
    password: "",
    password2: "", // We ask for password twice to make sure they didn't mistype it
    firstName: "",
    lastName: ""
  });
  // If something goes wrong (passwords don't match, email already exists, etc), we store the error here
  const [error, setError] = useState("");
  // If signup succeeds, show a success message
  const [success, setSuccess] = useState("");
  // While the signup request is happening, we set this to true (so we can show "signing up...")
  const [signingUp, setSigningUp] = useState(false);

  // Update our form state whenever the user types in any input field
  // This keeps all the text boxes in sync with our form state
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // When the user clicks "Sign Up", validate their input and send it to the backend
  async function handleSignUp(e) {
    e.preventDefault(); // Don't refresh the page (default form behavior)
    setError(""); // Clear any previous error message
    setSuccess(""); // Clear any previous success message
    setSigningUp(true); // Show loading state on the button
    
    // Client-side validation - make sure both password fields match
    // We check this before even sending to the server to save time
    if (form.password !== form.password2) {
      setError("Passwords do not match");
      setSigningUp(false);
      return; // Stop here, don't send the request
    }
    
    try {
      // Send a POST request to the backend to create the new account
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Tell Flask we're sending JSON
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          first_name: form.firstName,
          last_name: form.lastName
        })
      });
      const data = await response.json(); // Parse the backend's response
      if (response.ok) {
        // Account created successfully! Show success message and let them know they can log in now
        setSuccess("Sign up successful! You can now log in.");
      } else {
        // Something went wrong (maybe email already exists) - show the error from the backend
        setError(data.error || "Sign up failed");
      }
    } catch (err) {
      // If the fetch itself fails (network error, backend down, etc), show a generic error
      setError("Unknown error");
    }
    setSigningUp(false);
  };

  return (
    <AuthBackground image={image2}>
      <div className="d-flex align-items-stretch justify-content-end" style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0 }}>
        {/* Signup card - positioned on the right side of the screen */}
        <div className="card p-4 shadow d-flex flex-column justify-content-center rounded-0" style={authCard}>
          {/* App branding - "ClassBeyond" logo */}
          <div className="mb-2 text-start" style={authBrand}>
            <span className="fw-bold fs-1" style={{ color: '#212529' }}>Class</span>
            <span className="fw-bold fs-1" style={{ color: '#ff5f57' }}>Beyond</span>
          </div>
          {/* Page title and welcome message */}
          <div style={authBrand}>
            <h2 style={authHeading}>Sign Up</h2>
            <div className="text-muted mb-2 text-start">Welcome to ClassBeyond!</div>
          </div>
          {/* Signup form with name, email, and password fields */}
          <form onSubmit={handleSignUp}>
            <div className="d-flex flex-column align-items-center">
              {/* First name input */}
              <div className="mb-3 w-100 d-flex justify-content-center">
                <input
                  type="text"
                  className="form-control"
                  placeholder="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  style={authInput}
                />
              </div>
              {/* Last name input */}
              <div className="mb-3 w-100 d-flex justify-content-center">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  style={authInput}
                />
              </div>
              {/* Email input */}
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
              {/* Password input */}
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
              {/* Retype password input (to confirm) */}
              <div className="mb-3 w-100 d-flex justify-content-center">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Retype Password"
                  name="password2"
                  value={form.password2}
                  onChange={handleChange}
                  required
                  style={authInput}
                />
              </div>
              {/* Submit button - shows a loading message while signing up */}
              <button type="submit" className="btn mb-2" style={authButton} disabled={signingUp}>{signingUp ? 'Signing up, please wait' : 'Sign Up'}</button>
            </div>
          </form>
          {/* Show error or success messages under the form */}
          {error && <div className="alert alert-danger mt-2">{error}</div>}
          {success && <div className="alert alert-success mt-2">{success}</div>}
          {/* Link to the login page if they already have an account */}
          <div className="text-center mt-3">
            <span>Already have an account? </span>
            <Link to="/login" className="link-primary">Log In</Link>
          </div>
        </div>
      </div>
    </AuthBackground>
  );
};
