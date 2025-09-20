import React, { useState } from "react";
import image2 from "../assets/LogInBackground.png";
import { Link } from "react-router-dom";

export const SignUpPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    password2: "",
    firstName: "",
    lastName: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignUp = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.password2) {
      setError("Passwords do not match");
      return;
    }
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          first_name: form.firstName,
          last_name: form.lastName
        })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Sign up successful! You can now log in.");
      } else {
        setError(data.error || "Sign up failed");
      }
    } catch (err) {
      setError("Unknown error");
    }
  };

  return (
    <div
      className="min-vh-100 position-relative"
      style={{
        backgroundImage: `url(${image2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
        overflow: "hidden"
      }}
    >
      <div
        className="d-flex align-items-stretch justify-content-end"
        style={{ height: "100vh", width: "100vw", position: "absolute", top: 0, left: 0 }}
      >
        <div
          className="card p-4 shadow d-flex flex-column justify-content-center rounded-0"
          style={{ maxWidth: 550, width: "100%", height: "100vh", background: "rgba(255,255,255,0.975)", borderRadius: "1rem 0 0 1rem" }}
        >
          <div className="mb-2 text-start" style={{ marginLeft: 115 }}>
            <span className="fw-bold fs-1" style={{ color: "#212529" }}>Class</span>
            <span className="fw-bold fs-1" style={{ color: "#ff5f57" }}>Beyond</span>
          </div>
          <h3 className="mb-5 text-start" style={{ marginLeft: 115 }}>Sign Up</h3>
          <div className="text-muted mb-2 text-start" style={{ marginLeft: 115 }}>Welcome to ClassBeyond!</div>
          <form onSubmit={handleSignUp}>
            <div className="d-flex flex-column align-items-center">
              <div className="mb-3 w-100 d-flex justify-content-center">
                <input
                  type="text"
                  className="form-control"
                  placeholder="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  style={{ maxWidth: 270, height: "5vh" }}
                />
              </div>
              <div className="mb-3 w-100 d-flex justify-content-center">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  style={{ maxWidth: 270, height: "5vh" }}
                />
              </div>
              <div className="mb-3 w-100 d-flex justify-content-center">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{ maxWidth: 270, height: "5vh" }}
                />
              </div>
              <div className="mb-3 w-100 d-flex justify-content-center">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ maxWidth: 270, height: "5vh" }}
                />
              </div>
              <div className="mb-3 w-100 d-flex justify-content-center">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Retype Password"
                  name="password2"
                  value={form.password2}
                  onChange={handleChange}
                  required
                  style={{ maxWidth: 270, height: "5vh" }}
                />
              </div>
              <button
                type="submit"
                className="btn mb-2"
                style={{ maxWidth: 270, width: "100%", height: "5vh", backgroundColor: "#5CA4E8", color: "#fff", border: "none" }}
              >
                Sign Up
              </button>
            </div>
          </form>
          {error && <div className="alert alert-danger mt-2">{error}</div>}
          {success && <div className="alert alert-success mt-2">{success}</div>}
          <div className="text-center mt-3">
            <span>Already have an account? </span>
            <Link to="/login" className="link-primary">Log In</Link>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100vw",
          height: "35px",
          background: "rgba(236, 236, 236, 1)"
        }}
      />
    </div>
  );
};
