import React from "react";
import Sidebar from '../components/Sidebar';
import CardHeader from '../components/CardHeader';
import { getCookie } from '../utils/cookies';
import { colors, mainPanel, header as commonHeader, card as commonCard, formCardBody, deleteListCardBody, deleteListInner, deleteListItem } from '../components/styles';
import Background from '../components/Background';

// Admin page - create activities, delete them, and promote users
// Redirects non-admins to login

const styles = { mainPanel, header: commonHeader, card: commonCard, formCardBody, deleteListCardBody, deleteListInner, deleteListItem };

export const AdminPage = () => {
  // get user from cookies
  const user = {
    email: getCookie('user_email'),
    first_name: getCookie('user_first_name'),
    last_name: getCookie('user_last_name'),
    user_id: getCookie('user_id'),
    is_admin: getCookie('user_is_admin') === 'true'
  };

  // form state
  const [activity, setActivity] = React.useState({
    name: '',
    tags: '',
    competencies: '',
    description: ''
  });
  const [submitMsg, setSubmitMsg] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // activity list
  const [activities, setActivities] = React.useState([]);
  const [loadingActivities, setLoadingActivities] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // user list
  const [allUsers, setAllUsers] = React.useState([]);
  const [loadingUsers, setLoadingUsers] = React.useState(true);
  const [promotingId, setPromotingId] = React.useState(null);

  // redirect non-admins
  React.useEffect(() => {
    if (getCookie('logged_in') !== 'true' || !user.is_admin) {
      window.location.href = "/login";
    }
  }, [user.is_admin]);

  // collapse sidebar on small screens
  React.useEffect(() => {
    const handleResize = () => setIsSidebarCollapsed(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // load activities (and reload after submissions)
  React.useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const res = await fetch('/api/activities');
        const data = await res.json();
        if (res.ok) {
          setActivities(data.activities || []);
        }
      } catch (error) {}
      setLoadingActivities(false);
    };
    fetchActivities();
  }, [submitting]);

  // load users for promoting
  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch(`/api/users?user_id=${user.user_id}`);
        const data = await res.json();
        if (res.ok) {
          setAllUsers(data.users || []);
        }
      } catch (error) {}

      setLoadingUsers(false);
    };
    fetchUsers();
  }, [user.user_id]);

  const handleChange = (e) => {
    setActivity({ ...activity, [e.target.name]: e.target.value });
  };

  // submit new activity
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
    }
    setSubmitting(false);
  };

  // delete activity
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
    }
    setDeletingId(null);
  };

  // legacy promotion route
  const handlePromoteUser = async (userId) => {
    setPromotingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}/admin`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        setAllUsers(users => users.map(u => u.user_id === userId ? { ...u, is_admin: true } : u));
      } else {
        const data = await res.json();
        alert(data.error || 'Error promoting user');
      }
    } catch (err) {
      alert('Server error');
    }
    setPromotingId(null);
  };

  // secure promotion with requester check
  const handleMakeAdmin = async (userId) => {
    setPromotingId(userId);
    try {
      const res = await fetch(`/api/user/${userId}/make-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requester_id: user.user_id })
      });
      if (res.ok) {
        setAllUsers(users => users.map(u => u.user_id === userId ? { ...u, is_admin: true } : u));
      } else {
        const data = await res.json();
        alert(data.error || 'Error promoting user');
      }
    } catch (err) {
      alert('Server error');
    }
    setPromotingId(null);
  };

  return (
    <Background>
      <div className="d-flex flex-row">
        <Sidebar user={user} isCollapsed={isSidebarCollapsed} onNavigate={p => window.location.href = p} active="admin" />

        <div className="flex-grow-1 d-flex flex-column" style={styles.mainPanel}>
          <div className="container-fluid">
            <div className="row mb-4">
              <div className="col-lg-12">
                <h1 style={styles.header}>Admin</h1>
              </div>
            </div>

            <div className="row mb-7">
              {/* Left column: create activities + promote users */}
              <div className="col-lg-7">
                {/* Create activity card */}
                <div className="card mb-5" style={styles.card}>
                  <CardHeader>Make an Extracurricular</CardHeader>
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

                {/* Promote users to admin card */}
                <div className="card mb-5" style={styles.card}>
                  <CardHeader>Make User Admin</CardHeader>
                  <div className="card-body" style={styles.deleteListCardBody}>
                    <div style={styles.deleteListInner}>
                      {loadingUsers ? (
                        <div>Loading users...</div>
                      ) : allUsers.length === 0 ? (
                        <div>No users found.</div>
                      ) : (
                        allUsers.map(u => (
                          <div key={u.user_id} className="d-flex align-items-center justify-content-between mb-2" style={styles.deleteListItem}>
                            <div>
                              <div className="fw-bold">{u.first_name} {u.last_name}</div>
                              <div style={{ fontSize: '0.85em', color: '#666' }}>{u.email}</div>
                            </div>
                            <button 
                              className="btn btn-sm btn-warning" 
                              disabled={u.is_admin || promotingId === u.user_id}
                              onClick={() => handleMakeAdmin(u.user_id)}
                            >
                              {u.is_admin ? 'Admin' : promotingId === u.user_id ? 'Promoting...' : 'Promote'}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: delete activities */}
              <div className="col-lg-4">
                <div className="card mb-5" style={styles.card}>
                  <CardHeader>Delete Activities</CardHeader>
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
    </Background>
  );
};
