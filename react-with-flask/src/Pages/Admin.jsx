  import React from "react";
  import "./Dashboard.css";
  import image2 from "../assets/LogInBackground.png";

  export const AdminPage = () => {
    // Cookie helpers
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    }

    // User info
    const user = {
      email: getCookie('user_email'),
      first_name: getCookie('user_first_name'),
      last_name: getCookie('user_last_name'),
      user_id: getCookie('user_id')
    };

    // Activity creation state
    const [activity, setActivity] = React.useState({
      name: '',
      tags: '',
      competencies: '',
      description: ''
    });
    const [submitMsg, setSubmitMsg] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    // Activities list for delete
    const [activities, setActivities] = React.useState([]);
    const [loadingActivities, setLoadingActivities] = React.useState(true);
    const [deletingId, setDeletingId] = React.useState(null);

    // Auth check
    React.useEffect(() => {
      if (getCookie('logged_in') !== 'true') {
        window.location.href = "/login";
      }
    }, []);

    // Fetch activities for delete list
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

    // Form change handler
    function handleChange(e) {
      setActivity({ ...activity, [e.target.name]: e.target.value });
    }

    // Form submit handler
    async function handleSubmit(e) {
      e.preventDefault();
      setSubmitMsg('');
      setSubmitting(true);
      try {
        const res = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: activity.name,
            description: activity.description,
            tags: activity.tags.split(',').map(t => t.trim()).filter(Boolean),
            competencies: activity.competencies.split(',').map(c => c.trim()).filter(Boolean)
          })
        });
        if (res.ok) {
          setSubmitMsg('Activity submitted!');
          setActivity({ name: '', tags: '', competencies: '', description: '' });
        } else {
          const data = await res.json();
          setSubmitMsg(data.error || 'Error submitting activity');
        }
      } catch (err) {
        setSubmitMsg('Server error');
      }
      setSubmitting(false);
    }

    // Delete activity handler (API not yet implemented)
    async function handleDeleteActivity(id) {
      setDeletingId(id);
      try {
        const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setActivities(acts => acts.filter(a => a.activity_id !== id));
        } else {
          const data = await res.json();
          alert(data.error || 'Error deleting activity');
        }
      } catch {
        alert('Server error');
      }
      setDeletingId(null);
    }
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
          <h2 className="fw-bold mb-4" style={{ marginTop: '32px', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '2rem', width: '100%', lineHeight: '1.1', marginBottom: '0px' }}>Class</span>
            <span style={{ color: "#ff5f57", fontSize: '2.2rem', display: 'block', width: '100%', lineHeight: '1.1', marginTop: '-4px' }}>Beyond</span>
          </h2>
          <div className="mb-3">{user && (user.first_name || user.last_name) ? `${user.first_name || "DebugFirst"} ${user.last_name || "DebugLast"}` : "FNAME LNAME (debug)"}</div>
          <hr className="border-light w-100 mb-4" />
          <div className="w-100 d-flex flex-column align-items-center">
            {(() => {
              const btnStyle = {
                background: "#3A498B",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                margin: "4px 0",
                padding: "10px 24px",
                fontWeight: "500",
                width: "calc(100% - 50px)",
                textAlign: "left",
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
                textAlign: "left",
                cursor: "not-allowed",
                opacity: 0.8
              };
              return (
                <>
                  <button className="sidebar-btn" style={btnStyle} onClick={() => window.location.href = "/dashboard"}>Dashboard</button>
                  <button className="sidebar-btn" style={btnStyle} onClick={() => window.location.href = "/profile"}>Profile</button>
                  <button className="sidebar-btn" style={btnStyle} onClick={() => window.location.href = "/settings"}>Settings</button>
                  <button className="sidebar-btn" style={activeStyle} disabled>Admin</button>
                </>
              );
            })()}
          </div>
        </div>
        <div className="dashboard-main flex-grow-1 d-flex flex-column" style={{ height: "100%", overflow: "visible", marginLeft: "max(var(--sidebar-width, 300px), 32px)", minWidth: 0, marginTop: "140px", zIndex: 3 }}>
          <div className="container-fluid">
            <div className="row mb-4">
              <div className="col-lg-12">
                <h1 style={{ color: "#fff", fontWeight: "bold", fontSize: 56, margin: "32px 0 24px 0", letterSpacing: 2 }}>Admin</h1>
              </div>
            </div>
            <div className="row mb-7">
              <div className="col-lg-7">
                <div className="card mb-5" style={{ minHeight: '450px', paddingBottom: '48px', border: 'none', borderRadius: '12px' }}>
                  <div className="card-header bg-primary text-white" style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '1px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>Make an Extracurricular</div>
                  <div className="card-body" style={{ background: '#E7E7E7', minHeight: '220px', margin: '24px', overflowY: 'auto', borderRadius: '8px' }}>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">New Activity Name</label>
                        <input type="text" className="form-control" name="name" value={activity.name} onChange={handleChange} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Tags (comma separated)</label>
                        <input type="text" className="form-control" name="tags" value={activity.tags} onChange={handleChange} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Competencies (comma separated)</label>
                        <input type="text" className="form-control" name="competencies" value={activity.competencies} onChange={handleChange} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Description</label>
                        <textarea className="form-control" name="description" value={activity.description} onChange={handleChange} rows={3} />
                      </div>
                      <button className="btn btn-danger" type="submit" disabled={submitting}>
                        {submitting ? 'Submitting, please wait' : 'SUBMIT'}
                      </button>
                      {submitMsg && <div className="mt-3 text-success">{submitMsg}</div>}
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card mb-5" style={{ minHeight: '450px', paddingBottom: '48px', border: 'none', borderRadius: '12px' }}>
                  <div className="card-header bg-primary text-white" style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '1px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>Delete Activities</div>
                  <div className="card-body" style={{ background: '#E7E7E7', minHeight: '220px', margin: '24px', borderRadius: '8px', padding: 0 }}>
                    <div style={{ height: '350px', overflowY: 'auto', background: '#f5f5f5', borderRadius: '8px', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08)', margin: 0, padding: 16 }}>
                      {loadingActivities ? (
                        <div>Loading activities...</div>
                      ) : activities.length === 0 ? (
                        <div>No activities found.</div>
                      ) : (
                        activities.map(act => (
                          <div key={act.activity_id} className="d-flex align-items-center justify-content-between mb-2" style={{ background: '#fff', borderRadius: 6, padding: '8px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                            <span>{act.name}</span>
                            <button className="btn btn-sm btn-danger" disabled={deletingId === act.activity_id} onClick={() => handleDeleteActivity(act.activity_id)}>
                              {deletingId === act.activity_id ? 'Deleting...' : 'Delete'}
                            </button>
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
