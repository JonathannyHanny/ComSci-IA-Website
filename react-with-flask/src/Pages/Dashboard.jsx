import React from "react";
import image2 from "../assets/LogInBackground.png";
import "bootstrap/dist/css/bootstrap.min.css";

export const DashboardPage = () => {
  return (
    <div
      className="min-vh-100 position-relative"
      style={{
        backgroundImage: `url(${image2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div
        className="d-flex align-items-stretch justify-content-end"
        style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0 }}
      >
        <div
          className="card p-4 shadow d-flex flex-column justify-content-center rounded-0"
          style={{ maxWidth: 550, width: '100%', height: '100vh', background: 'rgba(255,255,255,0.975)', borderRadius: '1rem 0 0 1rem' }}
        >
          <div className="mb-2 text-start" style={{ marginLeft: 115 }}>
            <span className="fw-bold fs-1" style={{ color: '#212529' }}>Class</span>
            <span className="fw-bold fs-1" style={{ color: '#ff5f57' }}>Beyond</span>
          </div>
          <h3 className="mb-5 text-start" style={{ marginLeft: 115 }}>Dashboard</h3>
          <div className="text-muted mb-2 text-start" style={{ marginLeft: 115 }}>Welcome to your dashboard!</div>
          {/* Dashboard content can be added here, styled as needed */}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100vw',
          height: '35px',
          background: 'rgba(199, 199, 199, 1)',
        }}
      />
    </div>
  );
};
