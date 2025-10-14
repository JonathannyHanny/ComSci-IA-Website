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
    padding: '1rem 1.25rem',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
  },
  formCardBody: {
    background: '#E7E7E7',
    minHeight: '220px',
    margin: '24px',
    padding: '16px',
    overflowY: 'auto',
    borderRadius: '8px',
  },
  deleteListCardBody: {
    background: '#E7E7E7',
    minHeight: '220px',
    margin: '24px',
    borderRadius: '8px',
    padding: 0
  },
  deleteListInner: {
    height: '350px',
    overflowY: 'auto',
    background: '#f5f5f5',
    borderRadius: '8px',
    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08)',
    margin: 0,
    padding: 16
  },
  deleteListItem: {
    background: '#fff',
    borderRadius: 6,
    padding: '8px 12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  }
};

export const AdminPage = () => {
  const user = {
    email: getCookie('user_email'),
    first_name: getCookie('user_first_name'),
    last_name: getCookie('user_last_name'),
    user_id: getCookie('user_id')
  };

  const [activity, setActivity] = React.useState({
    name: '',
    tags: '',
    competencies: '',
    description: ''
  });
  const [submitMsg, setSubmitMsg] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const [activities, setActivities] = React.useState([]);
  const [loadingActivities, setLoadingActivities] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState(null);

  React.useEffect(() => {
    if (getCookie('logged_in') !== 'true') {
      window.location.href = "/login";
    }
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
  }, [submitting]); // Refetch activities after a successful submission

  const handleChange = (e) => {
    setActivity({ ...activity, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
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
      const data = await res.json();
      if (res.ok) {
        setSubmitMsg('Activity submitted successfully!');
        setActivity({ name: '', tags: '', competencies: '', description: '' });
      } else {
        setSubmitMsg(data.error || 'Error submitting activity');
      }
    } catch (err) {
      setSubmitMsg('Server error');
      console.error("Submission error:", err);
    }
    setSubmitting(false);
  };

  const handleDeleteActivity = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setActivities(acts => acts.filter(a => a.activity_id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Error deleting activity');
      }
    } catch (err) {
      alert('Server error');
      console.error("Deletion error:", err);
    }
    setDeletingId(null);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.topBg}>
        <div style={{...styles.topBgImage, backgroundPosition: "center" }} />
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
            <button style={styles.sidebarBtn} onClick={() => window.location.href = "/profile"}>Profile</button>
            <button style={styles.sidebarBtn} onClick={() => window.location.href = "/settings"}>Settings</button>
            <button style={styles.activeSidebarBtn} disabled>Admin</button>
          </div>
        </div>

        <div className="flex-grow-1 d-flex flex-column" style={styles.mainPanel}>
          <div className="container-fluid">
            <div className="row mb-4">
              <div className="col-lg-12">
                <h1 style={styles.header}>Admin</h1>
              </div>
            </div>

            <div className="row mb-7">
              <div className="col-lg-7">
                <div className="card mb-5" style={styles.card}>
                  <div style={styles.cardHeader}>Make an Extracurricular</div>
                  <div className="card-body" style={styles.formCardBody}>
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
                        {submitting ? 'Submitting...' : 'SUBMIT'}
                      </button>
                      {submitMsg && <div className={`mt-3 ${submitMsg.includes('Error') ? 'text-danger' : 'text-success'}`}>{submitMsg}</div>}
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card mb-5" style={styles.card}>
                  <div style={styles.cardHeader}>Delete Activities</div>
                  <div className="card-body" style={styles.deleteListCardBody}>
                    <div style={styles.deleteListInner}>
                      {loadingActivities ? (
                        <div>Loading activities...</div>
                      ) : activities.length === 0 ? (
                        <div>No activities found.</div>
                      ) : (
                        activities.map(act => (
                          <div key={act.activity_id} className="d-flex align-items-center justify-content-between mb-2" style={styles.deleteListItem}>
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