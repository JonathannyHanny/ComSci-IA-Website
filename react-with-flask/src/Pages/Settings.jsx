// Settings page - manage account and logout
// Shows user info and logout button

import React from "react";
import Sidebar from '../components/Sidebar';
import CardHeader from '../components/CardHeader';
import { getCookie } from '../utils/cookies';
import { colors } from '../components/styles';
import Background from '../components/Background';
import { mainPanel, header as commonHeader, card as commonCard, cardBody, logoutButton } from '../components/styles';

// Pull in the shared styles we use across all pages
const styles = { mainPanel, header: commonHeader, card: commonCard, cardBody, logoutButton };

export const SettingsPage = () => {
  // Grab the current user's info from cookies
  // We need this to show their name/email and check if they're logged in
  const user = {
    email: getCookie('user_email'),
    first_name: getCookie('user_first_name'),
    last_name: getCookie('user_last_name'),
    user_id: getCookie('user_id'),
    is_admin: getCookie('user_is_admin') === 'true' // Convert the string cookie value to a boolean
  };

  // Security check - redirect to login if not authenticated
  // This ensures only logged-in users can access settings
  React.useEffect(() => {
    if (getCookie('logged_in') !== 'true') {
      window.location.href = "/login";
    }
  }, []);

  // Track whether the sidebar should be collapsed (for mobile)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  React.useEffect(() => {
    // On small screens, collapse the sidebar automatically to save space
    const handleResize = () => setIsSidebarCollapsed(window.innerWidth <= 600);
    handleResize(); // Run once on mount
    window.addEventListener('resize', handleResize); // Re-run on window resize
    return () => window.removeEventListener('resize', handleResize); // Clean up listener on unmount
  }, []);

  // When the user clicks "Log Out", clear all their cookies and send them back to login
  // This effectively logs them out by removing all authentication data
  const handleLogout = () => {
    // List of all the cookies we set when someone logs in
    const cookies = ['logged_in', 'user_email', 'user_first_name', 'user_last_name', 'user_id', 'user_is_admin'];
    // Set each cookie to expire in the past, which deletes it
    cookies.forEach(cookie => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <Background>
      <div className="d-flex flex-row">
        {/* Sidebar with navigation links */}
        <Sidebar user={user} isCollapsed={isSidebarCollapsed} onNavigate={p => window.location.href = p} active="settings" />

        {/* Main content area */}
        <div className="flex-grow-1 d-flex flex-column" style={styles.mainPanel}>
          <div className="container-fluid">
            <div className="row mb-4">
              <div className="col-lg-12">
                <h1 style={styles.header}>Settings</h1>
              </div>
            </div>

            <div className="row mb-7">
              {/* Left side - account settings and logout */}
              <div className="col-lg-7">
                <div className="card mb-5" style={styles.card}>
                  <CardHeader>Account Settings</CardHeader>
                  <div className="card-body" style={styles.cardBody}>
                    {/* Show the user's email and name */}
                    <div className="mb-3"><strong>Email:</strong> {user.email || "(not logged in)"}</div>
                    <div className="mb-3"><strong>Name:</strong> {`${user.first_name || "N/A"} ${user.last_name || ""}`}</div>
                    {/* Logout button - clears all cookies and sends user back to login */}
                    <button onClick={handleLogout} style={styles.logoutButton}>Log Out</button>
                  </div>
                </div>
              </div>

              {/* Right side - reserved for future preference settings */}
              <div className="col-lg-4">
                <div className="card mb-5" style={styles.card}>
                  <CardHeader>Preferences</CardHeader>
                  <div className="card-body" style={styles.cardBody}>
                    {/* Empty for now, but could add theme settings, notification preferences, etc. later */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};