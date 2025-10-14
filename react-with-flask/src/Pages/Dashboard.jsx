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
  dashboardHeader: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 65,
    margin: '32px 0 24px 0',
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
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
  },
  cardBodyOuter: {
    background: '#E7E7E7',
    height: '220px',
    margin: '24px',
    overflowY: 'auto',
    borderRadius: '8px',
  },
  cardBodyInner: {
    height: '100%',
    overflowY: 'auto',
    background: '#f5f5f5',
    borderRadius: '8px',
    padding: 16,
    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08)',
  },
  signedUpActivityItem: {
    background: '#fff',
    borderRadius: 6,
    padding: '8px 12px',
    marginBottom: 8,
  },
  signedUpActivityName: {
    fontWeight: 600,
  },
  signedUpActivityDesc: {
    color: '#444',
    fontSize: 13,
  },
  activityItem: {
    background: '#fff',
    borderRadius: 6,
    padding: '12px 16px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    marginBottom: 12,
  },
  activityName: {
    fontWeight: 600,
    fontSize: 18,
  },
  activityDesc: {
    color: '#444',
    fontSize: 15,
    margin: '4px 0 6px 0',
  },
  activityTags: {
    fontSize: 14,
    color: '#2d5c8a',
    marginBottom: 2,
  },
  activityCompetencies: {
    fontSize: 14,
    color: '#8a2d5c',
  },
  tagLabel: {
    fontWeight: 500,
  },
};

export const DashboardPage = () => {
  const user = {
    email: getCookie('user_email'),
    first_name: getCookie('user_first_name'),
    last_name: getCookie('user_last_name'),
    user_id: getCookie('user_id'),
  };

  const [activities, setActivities] = React.useState([]);
  const [loadingActivities, setLoadingActivities] = React.useState(true);
  const [filterType, setFilterType] = React.useState('Alphabetical');
  const [search, setSearch] = React.useState('');
  const [signedUpActivityIds, setSignedUpActivityIds] = React.useState([]);
  const [signingUpId, setSigningUpId] = React.useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = () => {
      if (getCookie('logged_in') !== 'true') {
        window.location.href = "/login";
      }
    };
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth <= 600);
    };

    checkAuth();
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const res = await fetch('/api/activities');
        const data = await res.json();
        if (res.ok) {
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      }
      setLoadingActivities(false);
    };
    fetchActivities();
  }, []);

  React.useEffect(() => {
    const fetchSignedUp = async () => {
      if (!user.user_id) return;
      try {
        const res = await fetch(`/api/user/${user.user_id}/activities`);
        if (res.ok) {
          const data = await res.json();
          setSignedUpActivityIds(data.activity_ids || []);
        }
      } catch (error) {
        console.error("Failed to fetch signed up activities:", error);
      }
    };
    fetchSignedUp();
  }, [user.user_id]);

  const filteredActivities = React.useMemo(() => {
    let acts = [...activities];
    if (search) {
      acts = acts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (filterType === 'Alphabetical') {
      acts.sort((a, b) => a.name.localeCompare(b.name));
    }
    return acts;
  }, [activities, search, filterType]);

  const signedUpActivities = React.useMemo(() => {
    return signedUpActivityIds
      .map(id => activities.find(a => a.activity_id === id))
      .filter(Boolean);
  }, [signedUpActivityIds, activities]);

  const handleSignUp = async (activityId) => {
    if (!user.user_id) return;
    setSigningUpId(activityId);
    try {
      const res = await fetch(`/api/activities/${activityId}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id })
      });
      if (res.ok) {
        setSignedUpActivityIds(ids => [...ids, activityId]);
        alert('Signed up!');
      } else {
        const data = await res.json();
        alert(data.error || 'Error signing up');
      }
    } catch {
      alert('Server error');
    }
    setSigningUpId(null);
  };

  const dynamicBtnStyle = { textAlign: isSidebarCollapsed ? 'center' : 'left' };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.topBg}>
        <div style={styles.topBgImage} />
        <div style={styles.topBgOverlay} />
        <div style={styles.topBgBottomCover} />
      </div>

      <div className="d-flex flex-row">
        <div className="text-white d-flex flex-column align-items-center justify-content-start py-4" style={styles.sidebar}>
          {isSidebarCollapsed ? (
            <h2 className="fw-bold mb-4">CS</h2>
          ) : (
            <>
              <h2 className="fw-bold mb-4" style={styles.logoContainer}>
                <span style={styles.logoLine1}>Class</span>
                <span style={styles.logoLine2}>Beyond</span>
              </h2>
              <div className="mb-3">
                {`${user.first_name || "DebugFirst"} ${user.last_name || "DebugLast"}`}
              </div>
            </>
          )}

          <hr className="border-light w-100 mb-4" />

          <div className="w-100 d-flex flex-column align-items-center">
            <button style={{ ...styles.activeSidebarBtn, ...dynamicBtnStyle }} disabled>{isSidebarCollapsed ? "D" : "Dashboard"}</button>
            <button style={{ ...styles.sidebarBtn, ...dynamicBtnStyle }} onClick={() => window.location.href = "/profile"}>{isSidebarCollapsed ? "P" : "Profile"}</button>
            <button style={{ ...styles.sidebarBtn, ...dynamicBtnStyle }} onClick={() => window.location.href = "/settings"}>{isSidebarCollapsed ? "S" : "Settings"}</button>
            <button style={{ ...styles.sidebarBtn, ...dynamicBtnStyle }} onClick={() => window.location.href = "/admin"}>{isSidebarCollapsed ? "A" : "Admin"}</button>
          </div>
        </div>

        <div className="flex-grow-1 d-flex flex-column" style={styles.mainPanel}>
          <div className="container-fluid">
            <div className="row mb-4">
              <div className="col-lg-12">
                <h1 style={styles.dashboardHeader}>
                  {isSidebarCollapsed ? 'Dash Board' : 'DashBoard'}
                </h1>
              </div>
            </div>

            <div className="row mb-7">
              <div className="col-lg-7">
                <div className="card mb-5" style={styles.card}>
                  <div className="card-header" style={styles.cardHeader}>Top Picks</div>
                  <div className="card-body" style={styles.cardBodyOuter}>
                    <div style={styles.cardBodyInner}>
                      <div>Top picks will appear here.</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card mb-5" style={styles.card}>
                  <div className="card-header" style={styles.cardHeader}>Your Activities</div>
                  <div className="card-body" style={styles.cardBodyOuter}>
                    <div style={styles.cardBodyInner}>
                      {loadingActivities ? (
                        <div>Loading your activities...</div>
                      ) : signedUpActivities.length === 0 ? (
                        <div>You have not signed up for any activities yet.</div>
                      ) : (
                        signedUpActivities.map(a => (
                          <div key={a.activity_id} style={styles.signedUpActivityItem}>
                            <div style={styles.signedUpActivityName}>{a.name}</div>
                            {a.description && <div style={styles.signedUpActivityDesc}>{a.description}</div>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-lg-11">
                <div className="card mb-4" style={styles.card}>
                  <div className="card-header" style={styles.cardHeader}>Activities</div>
                  <div style={{ padding: '16px' }}>
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <input type="text" className="form-control" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                          <option value="Alphabetical">Alphabetical</option>
                          <option value="Similiar">Similiar to what you've done</option>
                          <option value="New">Try something new</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="card-body" style={{ ...styles.cardBodyOuter, marginTop: '-10px', padding: 0 }}>
                    <div style={styles.cardBodyInner}>
                      {loadingActivities ? (
                        <div>Loading activities...</div>
                      ) : filteredActivities.length === 0 ? (
                        <div>No activities found.</div>
                      ) : (
                        filteredActivities.map(act => (
                          <div key={act.activity_id} style={styles.activityItem}>
                            <div style={styles.activityName}>{act.name}</div>
                            {act.description && <div style={styles.activityDesc}>{act.description}</div>}
                            {act.tags?.length > 0 && (
                              <div style={styles.activityTags}>
                                <span style={styles.tagLabel}>Tags:</span> {act.tags.join(', ')}
                              </div>
                            )}
                            {act.competencies?.length > 0 && (
                              <div style={styles.activityCompetencies}>
                                <span style={styles.tagLabel}>Competencies:</span> {act.competencies.join(', ')}
                              </div>
                            )}
                            <div className="d-flex justify-content-end mt-2">
                              {signedUpActivityIds.includes(act.activity_id) ? (
                                <button className="btn btn-success btn-sm" disabled>Signed Up</button>
                              ) : (
                                <button
                                  className="btn btn-primary btn-sm"
                                  disabled={signingUpId === act.activity_id}
                                  onClick={() => handleSignUp(act.activity_id)}
                                >
                                  {signingUpId === act.activity_id ? 'Signing up...' : 'Sign Up'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
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