import React, { useState, useContext } from "react";
import { UserContext } from "../UserContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import image2 from "../assets/LogInBackground.png";

export const LogInPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async e => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.ok) {
        setUser({
          email: data.email,
          user_id: data.user_id,
          first_name: data.first_name || "",
          last_name: data.last_name || ""
        });
        navigate("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Server error");
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
          <h3 className="mb-5 text-start" style={{ marginLeft: 115 }}>Log In</h3>
          <div className="text-muted mb-2 text-start" style={{ marginLeft: 115 }}>Welcome back to ClassBeyond!</div>
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
              <button
                type="submit"
                className="btn mb-2"
                style={{ maxWidth: 270, width: "100%", height: "5vh", backgroundColor: "#5CA4E8", color: "#fff", border: "none" }}
              >
                Log In
              </button>
            </div>
          </form>
          {error && <div className="alert alert-danger mt-2">{error}</div>}
          <div className="text-center mt-3">
            <span>Don't have an account? </span>
            <Link to="/signup" className="link-primary">Sign up</Link>
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
