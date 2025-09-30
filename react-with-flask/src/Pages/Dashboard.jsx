
import React from "react";
import "./Dashboard.css";
import image2 from "../assets/LogInBackground.png";

export const DashboardPage = () => {
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  const user = {
    email: getCookie('user_email'),
    first_name: getCookie('user_first_name'),
    last_name: getCookie('user_last_name'),
    user_id: getCookie('user_id')
  };

  const [activities, setActivities] = React.useState([]);
  const [loadingActivities, setLoadingActivities] = React.useState(true);
  const [filterType, setFilterType] = React.useState('Alphabetical');
  const [search, setSearch] = React.useState('');
  const [signedUpActivityIds, setSignedUpActivityIds] = React.useState([]);

  React.useEffect(() => {
    if (getCookie('logged_in') !== 'true') {
      window.location.href = "/login";
    }
  }, []);

  React.useEffect(() => {
    async function fetchActivities() {
      setLoadingActivities(true);
      try {
        const res = await fetch('/api/activities');
        const data = await res.json();
        if (res.ok) {
          setActivities(data.activities || []);
        }
      } catch {}
      setLoadingActivities(false);
    }
    fetchActivities();
  }, []);

  // Fetch signed up activities for the user
  React.useEffect(() => {
    async function fetchSignedUp() {
      if (!user.user_id) return;
      try {
        const res = await fetch(`/api/user/${user.user_id}/activities`);
        if (res.ok) {
          const data = await res.json();
          setSignedUpActivityIds(data.activity_ids || []);
        }
      } catch {}
    }
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

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#ECECEC", overflowY: "auto", overflowX: "hidden", position: "relative" }}>
    <div className="dashboard-top-bg" style={{ position: "absolute", left: "var(--sidebar-width, 0px)", width: "100%", height: "500px" }}>
  <div style={{ width: "100%", height: "100%", backgroundImage: `url(${image2})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", paddingLeft: "900px", paddingTop: "1px" }} />
  <div style={{ width: "100%", height: "100%", backgroundImage: `url(${image2})`, backgroundSize: "cover", backgroundPosition: "60% 20%", backgroundRepeat: "no-repeat" }} />
  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100vh", background: "rgba(91, 56, 56, 0.5)", pointerEvents: "none", zIndex: 1 }} />
  <div style={{ position: "absolute", left: 0, bottom: "-100vh", width: "100%", height: "100vh", background: "#ECECEC", zIndex: 2 }} />
    </div>
    <div className="d-flex flex-row" style={{ height: "calc(100vh - 220px)", width: "100vw" }}>
      <div className="dashboard-sidebar text-white d-flex flex-column align-items-center justify-content-start py-4" style={{ width: "var(--sidebar-width, 260px)", minWidth: 50, maxWidth: 260, height: "100vh", position: "fixed", left: 0, top: 0, zIndex: 1000, background: "rgb(21,34,89)" }}>
        {(() => {
          const collapsed = typeof window !== 'undefined' && window.innerWidth <= 600;
          return collapsed ? (
            <h2 className="fw-bold mb-4">CS</h2>
          ) : (
            <>
              <h2 className="fw-bold mb-4" style={{ marginTop: '32px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '2rem', width: '100%', lineHeight: '1.1', marginBottom: '0px' }}>Class</span>
                <span style={{ color: "#ff5f57", fontSize: '2.2rem', display: 'block', width: '100%', lineHeight: '1.1', marginTop: '-4px' }}>Beyond</span>
              </h2>
              <div className="mb-3">{
                user && (user.first_name || user.last_name)
                  ? `${user.first_name || "DebugFirst"} ${user.last_name || "DebugLast"}`
                  : "FNAME LNAME (debug)"
              }</div>
            </>
          );
        })()}
        <hr className="border-light w-100 mb-4" />
        <div className="w-100 d-flex flex-column align-items-center">
          {(() => {
            const collapsed = typeof window !== 'undefined' && window.innerWidth <= 600;
            const btnStyle = {
              background: "#3A498B",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              margin: "4px 0",
              padding: "10px 24px",
              fontWeight: "500",
              width: "calc(100% - 50px)",
              textAlign: collapsed ? "center" : "left",
              cursor: "pointer"
            };
            const activeStyle = {
              background: "rgb(255, 95, 87)",
              color: "#fff",
              borderRadius: 6,
              margin: "4px 0",
              padding: "10px 24px",
              fontWeight: "500",
              width: "calc(100% - 50px)",
              textAlign: collapsed ? "center" : "left",
              cursor: "not-allowed",
              opacity: 0.8
            };
            return (
              <>
                <button className="sidebar-btn" style={activeStyle} disabled>{collapsed ? "D" : "Dashboard"}</button>
                <button className="sidebar-btn" style={btnStyle} onClick={() => window.location.href = "/profile"} >{collapsed ? "P" : "Profile"}</button>
                <button className="sidebar-btn" style={btnStyle} onClick={() => window.location.href = "/settings"} >{collapsed ? "S" : "Settings"}</button>
                <button className="sidebar-btn" style={btnStyle} onClick={() => window.location.href = "/admin"} >{collapsed ? "A" : "Admin"}</button>
              </>
            );
          })()}
        </div>
      </div>
  <div className="dashboard-main flex-grow-1 d-flex flex-column" style={{ height: "100%", overflow: "visible", marginLeft: "max(var(--sidebar-width, 300px), 32px)", minWidth: 0, marginTop: "140px", zIndex: 3 }}>
        <div className="container-fluid">
          <div className="row mb-4">
            <div className="col-lg-12">
              {(() => {
                const collapsed = typeof window !== 'undefined' && window.innerWidth <= 600;
                return (
                  <h1 style={{ color: "#fff", fontWeight: "bold", fontSize: 65, margin: "32px 0 24px 0", letterSpacing: 2 }}>
                    {collapsed ? 'Dash Board' : 'DashBoard'}
                  </h1>
                );
              })()}
            </div>
          </div>
          <div className="row mb-7">
            <div className="col-lg-7">
              <div className="card mb-5" style={{ minHeight: '450px', paddingBottom: '48px', border: 'none', borderRadius: '12px' }}>
                <div className="card-header bg-primary text-white" style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '1px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>Top Picks</div>
                <div className="card-body" style={{ background: '#E7E7E7', height: '220px', margin: '24px', overflowY: 'auto', borderRadius: '8px' }}>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card mb-5" style={{ minHeight: '450px', paddingBottom: '48px', border: 'none', borderRadius: '12px' }}>
                <div className="card-header bg-primary text-white" style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '1px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>Your Activities</div>
                <div className="card-body" style={{ background: '#E7E7E7', height: '220px', margin: '24px', overflowY: 'auto', borderRadius: '8px' }}>
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-lg-11">
              <div className="card mb-4" style={{ border: 'none', borderRadius: '12px' }}>
                <div className="card-header bg-primary text-white" style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '1px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>Activities</div>
                <div style={{ padding: '16px' }}>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="input-group">
                        <input type="text" className="form-control" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
                      </div>
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
                <div className="card-body" style={{ background: '#E7E7E7', height: '220px', margin: '24px', marginTop: '-10px', overflowY: 'auto', borderRadius: '8px', padding: 0 }}>
                  <div style={{ height: '220px', overflowY: 'auto', background: '#f5f5f5', borderRadius: '8px', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08)', margin: 0, padding: 16 }}>
                    {loadingActivities ? (
                      <div>Loading activities...</div>
                    ) : filteredActivities.length === 0 ? (
                      <div>No activities found.</div>
                    ) : (
                      filteredActivities.map(act => (
                        <div key={act.activity_id} style={{ background: '#fff', borderRadius: 6, padding: '12px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', marginBottom: 12 }}>
                          <div style={{ fontWeight: 600, fontSize: 18 }}>{act.name}</div>
                          {act.description && <div style={{ color: '#444', fontSize: 15, margin: '4px 0 6px 0' }}>{act.description}</div>}
                          {act.tags && act.tags.length > 0 && (
                            <div style={{ fontSize: 14, color: '#2d5c8a', marginBottom: 2 }}>
                              <span style={{ fontWeight: 500 }}>Tags:</span> {act.tags.join(', ')}
                            </div>
                          )}
                          {act.competencies && act.competencies.length > 0 && (
                            <div style={{ fontSize: 14, color: '#8a2d5c' }}>
                              <span style={{ fontWeight: 500 }}>Competencies:</span> {act.competencies.join(', ')}
                            </div>
                          )}
                          <div className="d-flex justify-content-end mt-2">
                            {signedUpActivityIds.includes(act.activity_id) ? (
                              <button className="btn btn-success btn-sm" disabled>Signed Up</button>
                            ) : (
                              <button
                                className="btn btn-primary btn-sm"
                                disabled={act.signingUp}
                                onClick={async () => {
                                  const userId = user.user_id;
                                  if (!userId) return;
                                  act.signingUp = true;
                                  try {
                                    const res = await fetch(`/api/activities/${act.activity_id}/signup`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ user_id: userId })
                                    });
                                    if (res.ok) {
                                      setSignedUpActivityIds(ids => [...ids, act.activity_id]);
                                      alert('Signed up!');
                                    } else {
                                      const data = await res.json();
                                      alert(data.error || 'Error signing up');
                                    }
                                  } catch {
                                    alert('Server error');
                                  }
                                  act.signingUp = false;
                                }}
                              >
                                Sign Up
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
}