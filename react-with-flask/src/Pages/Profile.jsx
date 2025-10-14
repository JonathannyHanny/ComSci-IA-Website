import React from "react";
import image2 from "../assets/LogInBackground.png";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    width: '100vw',
    background: '#ECECEC',
    overflowX: 'hidden',
    position: 'relative',
  },
  topBg: {
    position: 'absolute',
    left: 'var(--sidebar-width, 0px)',
    width: '100%',
    height: '500px',
  },
  topBgImage: {
    width: '100%',
    height: '100%',
    backgroundImage: `url(${image2})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  topBgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    background: 'rgba(91, 56, 56, 0.5)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  topBgBottomCover: {
    position: 'absolute',
    left: 0,
    bottom: '-100vh',
    width: '100%',
    height: '100vh',
    background: '#ECECEC',
    zIndex: 2,
  },
  sidebar: {
    width: 'var(--sidebar-width, 260px)',
    minWidth: 50,
    maxWidth: 260,
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 1000,
    background: 'rgb(21,34,89)',
  },
  logoContainer: {
    marginTop: '32px',
    textAlign: 'center',
  },
  logoLine1: {
    display: 'block',
    fontSize: '2rem',
    width: '100%',
    lineHeight: 1.1,
    marginBottom: '0px',
  },
  logoLine2: {
    color: '#ff5f57',
    fontSize: '2.2rem',
    display: 'block',
    width: '100%',
    lineHeight: 1.1,
    marginTop: '-4px',
  },
  sidebarBtn: {
    background: '#3A498B',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    margin: '4px 0',
    padding: '10px 24px',
    fontWeight: 500,
    width: 'calc(100% - 50px)',
    textAlign: 'left',
    cursor: 'pointer',
  },
  activeSidebarBtn: {
    background: 'rgb(255, 95, 87)',
    color: '#fff',
    borderRadius: 6,
    margin: '4px 0',
    padding: '10px 24px',
    fontWeight: 500,
    width: 'calc(100% - 50px)',
    textAlign: 'left',
    cursor: 'not-allowed',
    opacity: 0.8,
  },
  mainPanel: {
    height: '100%',
    overflow: 'visible',
    marginLeft: 'max(var(--sidebar-width, 300px), 32px)',
    minWidth: 0,
    marginTop: '140px',
    zIndex: 3,
  },
  header: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 56,
    margin: "32px 0 24px 0",
    letterSpacing: 2,
  },
  card: {
    minHeight: '450px',
    paddingBottom: '48px',
    border: 'none',
    borderRadius: '12px',
  },
  cardHeader: {
    backgroundColor: 'rgb(58, 73, 139)',
    color: '#fff',
    fontSize: '1.5rem',
    fontWeight: 500,
    letterSpacing: '1px',
    padding: '1rem 1rem',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
  },
  cardBody: {
    background: '#E7E7E7',
    minHeight: '220px',
    margin: '24px',
    padding: '16px',
    overflowY: 'auto',
    borderRadius: '8px',
  }
};

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

  return (
    <div style={styles.pageContainer}>
      <div style={styles.topBg}>
        <div style={styles.topBgImage} />
        <div style={styles.topBgOverlay} />
        <div style={styles.topBgBottomCover} />
      </div>

      <div className="d-flex flex-row">
        <div className="text-white d-flex flex-column align-items-center justify-content-start py-4" style={styles.sidebar}>
          <h2 className="fw-bold mb-4" style={styles.logoContainer}>
            <span style={styles.logoLine1}>Class</span>
            <span style={styles.logoLine2}>Beyond</span>
          </h2>
          <div className="mb-3">{`${user.first_name || "DebugFirst"} ${user.last_name || "DebugLast"}`}</div>
          <hr className="border-light w-100 mb-4" />
          <div className="w-100 d-flex flex-column align-items-center">
            <button style={styles.sidebarBtn} onClick={() => window.location.href = "/dashboard"}>Dashboard</button>
            <button style={styles.activeSidebarBtn} disabled>Profile</button>
            <button style={styles.sidebarBtn} onClick={() => window.location.href = "/settings"}>Settings</button>
            <button style={styles.sidebarBtn} onClick={() => window.location.href = "/admin"}>Admin</button>
          </div>
        </div>

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
                  <div style={styles.cardHeader}>User Info</div>
                  <div className="card-body" style={styles.cardBody}>
                    <div className="mb-3"><strong>Email:</strong> {user.email || "(not logged in)"}</div>
                    <div className="mb-3"><strong>Name:</strong> {`${user.first_name || "N/A"} ${user.last_name || ""}`}</div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card mb-5" style={styles.card}>
                  <div style={styles.cardHeader}>Profile Actions</div>
                  <div className="card-body" style={styles.cardBody}>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};