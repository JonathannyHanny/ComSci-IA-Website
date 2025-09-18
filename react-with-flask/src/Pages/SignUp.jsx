import React from "react";
import image2 from "../assets/LogInBackground.png";

import { Link } from "react-router-dom";
import "./Login.css";

export const SignUpPage = () => {
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
          Sign Up
        </button>

        <p className="sign-up">
          <span className="span">Already have an account? </span>
           <Link to="/login" className="text-wrapper-4">Log In</Link>
        </p>
      </div>

      <div className="bottom-footing" />
    </div>
  );
};
