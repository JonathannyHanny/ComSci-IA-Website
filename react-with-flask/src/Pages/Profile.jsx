import React from "react";
import Sidebar from '../components/Sidebar';
import CardHeader from '../components/CardHeader';
import { getCookie } from '../utils/cookies';
import { colors } from '../components/styles';
import Background from '../components/Background';
import { mainPanel, header as commonHeader, card as commonCard, cardBody } from '../components/styles';

const styles = { mainPanel, header: commonHeader, card: commonCard, cardBody };

export const ProfilePage = () => {
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

  return (
    <Background>
      <div className="d-flex flex-row">
        <Sidebar user={user} isCollapsed={isSidebarCollapsed} onNavigate={p => window.location.href = p} active="profile" />

        <div className="flex-grow-1 d-flex flex-column" style={styles.mainPanel}>
          <div className="container-fluid">
            <div className="row mb-4">
              <div className="col-lg-12">
                <h1 style={styles.header}>Profile</h1>
              </div>
            </div>

            <div className="row mb-7">
              <div className="col-lg-7">
                <div className="card mb-5" style={styles.card}>
                  <CardHeader>User Info</CardHeader>
                  <div className="card-body" style={styles.cardBody}>
                    <div className="mb-3"><strong>Email:</strong> {user.email || "(not logged in)"}</div>
                    <div className="mb-3"><strong>Name:</strong> {`${user.first_name || "N/A"} ${user.last_name || ""}`}</div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card mb-5" style={styles.card}>
                  <CardHeader>Profile Actions</CardHeader>
                  <div className="card-body" style={styles.cardBody}>
                    
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