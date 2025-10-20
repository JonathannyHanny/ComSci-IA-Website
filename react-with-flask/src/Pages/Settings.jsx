import React from "react";
import Sidebar from '../components/Sidebar';
import CardHeader from '../components/CardHeader';
import { getCookie } from '../utils/cookies';
import { colors } from '../components/styles';
import Background from '../components/Background';
import { mainPanel, header as commonHeader, card as commonCard, cardBody, logoutButton } from '../components/styles';

const styles = { mainPanel, header: commonHeader, card: commonCard, cardBody, logoutButton };

export const SettingsPage = () => {
  const user = {
    email: getCookie('user_email'),
    first_name: getCookie('user_first_name'),
    last_name: getCookie('user_last_name'),
    user_id: getCookie('user_id')
  };

  React.useEffect(() => {
    if (getCookie('logged_in') !== 'true') {
      window.location.href = "/login";
    }
  }, []);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  React.useEffect(() => {
    const handleResize = () => setIsSidebarCollapsed(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    const cookies = ['logged_in', 'user_email', 'user_first_name', 'user_last_name', 'user_id'];
    cookies.forEach(cookie => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    window.location.href = '/login';
  };

  return (
    <Background>
      <div className="d-flex flex-row">
        <Sidebar user={user} isCollapsed={isSidebarCollapsed} onNavigate={p => window.location.href = p} active="settings" />

        <div className="flex-grow-1 d-flex flex-column" style={styles.mainPanel}>
          <div className="container-fluid">
            <div className="row mb-4">
              <div className="col-lg-12">
                <h1 style={styles.header}>Settings</h1>
              </div>
            </div>

            <div className="row mb-7">
              <div className="col-lg-7">
                <div className="card mb-5" style={styles.card}>
                  <CardHeader>Account Settings</CardHeader>
                  <div className="card-body" style={styles.cardBody}>
                    <div className="mb-3"><strong>Email:</strong> {user.email || "(not logged in)"}</div>
                    <div className="mb-3"><strong>Name:</strong> {`${user.first_name || "N/A"} ${user.last_name || ""}`}</div>
                    <button onClick={handleLogout} style={styles.logoutButton}>Log Out</button>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card mb-5" style={styles.card}>
                  <CardHeader>Preferences</CardHeader>
                  <div className="card-body" style={styles.cardBody}>
                    {/* Preference settings can be added here */}
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