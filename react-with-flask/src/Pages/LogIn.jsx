import React from "react";
import image2 from "../assets/LogInBackground.png";
import "./Login.css";

import { Link } from "react-router-dom";

export const LogInPage = () => {
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

        {/* Email Input */}
        <div className="email">
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            name="email"
          />
        </div>

        {/* Password Input */}
        <div className="password">
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            name="password"
          />
        </div>

        {/* Login Button */}
        <button className="log-in-button" type="submit">
          Log In
        </button>

        <p className="sign-up">
          <span className="span">Don't have an account? </span>
          <Link to="/signup" className="text-wrapper-4">Sign up</Link>
        </p>

      </div>

      <div className="bottom-footing" />
    </div>
  );
};
