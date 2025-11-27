// Log-in page. Maintains local form state and sets simple cookies on
// successful login. This demo stores user info in non-HttpOnly cookies
// which is acceptable for a prototype but not recommended for production.
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoggingIn(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "ap0plication/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.ok) {
        document.cookie = `logged_in=true; path=/`;
        document.cookie = `user_email=${data.email}; path=/`;
        document.cookie = `user_first_name=${data.first_name || ''}; path=/`;
        document.cookie = `user_last_name=${data.last_name || ''}; path=/`;
        document.cookie = `user_id=${data.user_id}; path=/`;
        navigate("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Server error");
    }
    setLoggingIn(false);
  }

  return (
    <AuthBackground image={image2}>
      <div className="d-flex align-items-stretch justify-content-end" style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0 }}>
        <div className="card p-4 shadow d-flex flex-column justify-content-center rounded-0" style={authCard}>
          <div className="mb-2 text-start" style={authBrand}>
            <span className="fw-bold fs-1" style={{ color: '#212529' }}>Class</span>
            <span className="fw-bold fs-1" style={{ color: '#ff5f57' }}>Beyond</span>
          </div>
          <div style={authBrand}>
            <h2 style={authHeading}>Log In</h2>
            <div className="text-muted mb-2 text-start">Welcome back to ClassBeyond!</div>
          </div>
          <form onSubmit={handleLogin}>
            <div className="d-flex flex-column align-items-center">
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
              <button type="submit" className="btn mb-2" style={authButton} disabled={loggingIn}>{loggingIn ? 'Logging in, please wait' : 'Log In'}</button>
            </div>
          </form>
          {error && <div className="alert alert-danger mt-2">{error}</div>}
          <div className="text-center mt-3">
            <span>Don't have an account? </span>
            <Link to="/signup" className="link-primary">Sign up</Link>
          </div>
        </div>
      </div>
    </AuthBackground>
  );
};
