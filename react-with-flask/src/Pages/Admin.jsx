import React from "react";
import "./Admin.css";

export const AdminPage = () => (
  <div className="container-fluid admin">
    <div className="row">
      <nav className="col-md-2 d-none d-md-block bg-dark sidebar py-4">
        <div className="sidebar-sticky">
          <h2 className="class-beyond-title text-center mb-4">
            <span className="text-wrapper">Class </span>
            <span className="span" style={{ color: '#ff5f57' }}>Beyond</span>
          </h2>
          <div className="name text-center mb-3">
            <div className="div">FNAME LNAME</div>
          </div>
          <div className="sidebar-line" />
          <ul className="nav flex-column">
            <li className="nav-item"><span className="div">Dashboard</span></li>
            <li className="nav-item"><span className="div">Profile</span></li>
            <li className="nav-item"><span className="div">Settings</span></li>
            <li className="nav-item"><span className="div">Admin</span></li>
          </ul>
        </div>
      </nav>
      <main className="col-md-10 ml-sm-auto px-4">
        <header className="header py-3 mb-4">
          <div className="back-ground-tint" />
          <h3 className="text-wrapper-2">Admin</h3>
        </header>
        <div className="content">
          <h4 className="text-wrapper-3 mb-3">Make an extracurricular</h4>
          <div className="group mb-3">
            <div className="rectangle" />
            <div className="text-wrapper-4">New Activity</div>
          </div>
          <div className="group-2 mb-3">
            <div className="rectangle-2" />
            <div className="rectangle-3" />
            <div className="text-wrapper-5">Tags</div>
            <div className="text-wrapper-6">Competencies</div>
          </div>
          <div className="group-3 mb-3">
            <div className="rectangle-4" />
            <div className="text-wrapper-7">Description</div>
          </div>
          <div className="group-4 mb-3">
            <div className="rectangle-5" />
            <div className="text-wrapper-8">SUBMIT</div>
          </div>
        </div>
      </main>
    </div>
  </div>
);
