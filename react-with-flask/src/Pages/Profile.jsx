// Profile page - shows user info (name and email)

import React from "react";
import Sidebar from '../components/Sidebar';
import CardHeader from '../components/CardHeader';
import { getCookie } from '../utils/cookies';
import { colors } from '../components/styles';
import Background from '../components/Background';
import { mainPanel, header as commonHeader, card as commonCard, cardBody } from '../components/styles';

// Grab the shared styles use across all pages
const styles = { mainPanel, header: commonHeader, card: commonCard, cardBody };

export const ProfilePage = () => {
  // Get the logged-in user's info from cookies
  // We saved these when they logged in, so we can show their name and email
  const user = {
    email: getCookie('user_email'),
    first_name: getCookie('user_first_name'),
    last_name: getCookie('user_last_name'),
    user_id: getCookie('user_id'),
    is_admin: getCookie('user_is_admin') === 'true' // Convert the string to a proper boolean
  };

  // Security check - if you're not logged in, send you back to the login page
  // This prevents people from accessing their profile when they're not authenticated
  React.useEffect(() => {
    if (getCookie('logged_in') !== 'true') {
      window.location.href = "/login";
    }
  }, []);

  // Track whether the sidebar should be collapsed (for mobile responsiveness)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  React.useEffect(() => {
    // On small screens (like phones), automatically collapse the sidebar so there's more room
    const handleResize = () => setIsSidebarCollapsed(window.innerWidth <= 600);
    handleResize(); // Check the size when the page first loads
    window.addEventListener('resize', handleResize); // Check again whenever the window size changes
    return () => window.removeEventListener('resize', handleResize); // Clean up the listener when this component unmounts
  }, []);

  return (
    <Background>
      <div className="d-flex flex-row">
        {/* The sidebar with navigation links */}
        <Sidebar user={user} isCollapsed={isSidebarCollapsed} onNavigate={p => window.location.href = p} active="profile" />

        {/* Main content area */}
        <div className="flex-grow-1 d-flex flex-column" style={styles.mainPanel}>
          <div className="container-fluid">
            <div className="row mb-4">
              <div className="col-lg-12">
                <h1 style={styles.header}>Profile</h1>
              </div>
            </div>

            <div className="row mb-7">
              {/* Left side - shows user information */}
              <div className="col-lg-7">
                <div className="card mb-5" style={styles.card}>
                  <CardHeader>User Info</CardHeader>
                  <div className="card-body" style={styles.cardBody}>
                    {/* Display the user's email and full name */}
                    <div className="mb-3"><strong>Email:</strong> {user.email || "(not logged in)"}</div>
                    <div className="mb-3"><strong>Name:</strong> {`${user.first_name || "N/A"} ${user.last_name || ""}`}</div>
                  </div>
                </div>
              </div>

              {/* Right side - reserved for future profile actions (like edit profile, change password, etc.) */}
              <div className="col-lg-4">
                <div className="card mb-5" style={styles.card}>
                  <CardHeader>Profile Actions</CardHeader>
                  <div className="card-body" style={styles.cardBody}>
                    {/* Empty for now, but we could add edit/update features here later */}
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