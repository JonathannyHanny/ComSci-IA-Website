import React from 'react';
import PageLayout from '../components/PageLayout';
import CardHeader from '../components/CardHeader';
import { getCookie } from '../utils/cookies';
import { colors, mainPanel, card, cardBody, header, cardBodyInner, activityItem, signedUpActivityItem, signedUpActivityName, signedUpActivityDesc, activityName, activityDesc, activityTags, activityCompetencies, tagLabel } from '../components/styles';

const styles = {
  mainPanel,
  dashboardHeader: header,
  card,
  cardBodyOuter: cardBody,
  cardBodyInner,
  signedUpActivityItem,
  signedUpActivityName,
  signedUpActivityDesc,
  activityItem,
  activityName,
  activityDesc,
  activityTags,
  activityCompetencies,
  tagLabel
};

export const DashboardPage = () => {
  const user = { email: getCookie('user_email'), first_name: getCookie('user_first_name'), last_name: getCookie('user_last_name'), user_id: getCookie('user_id') };

  const [activities, setActivities] = React.useState([]);
  const [loadingActivities, setLoadingActivities] = React.useState(true);
  const [filterType, setFilterType] = React.useState('Alphabetical');
  const [search, setSearch] = React.useState('');
  const [signedUpActivityIds, setSignedUpActivityIds] = React.useState([]);
  const [signingUpId, setSigningUpId] = React.useState(null);
  const [unsigningId, setUnsigningId] = React.useState(null);

  React.useEffect(() => { if (getCookie('logged_in') !== 'true') window.location.href = '/login'; }, []);

  React.useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const res = await fetch('/api/activities');
        const data = await res.json();
        if (res.ok) setActivities(data.activities || []);
      } catch (err) {}
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
      } catch (err) {}
    };
    fetchSignedUp();
  }, [user.user_id]);

  const filteredActivities = React.useMemo(() => {
    let acts = [...activities];
    if (search) acts = acts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
    if (filterType === 'Alphabetical') acts.sort((a, b) => a.name.localeCompare(b.name));
    return acts;
  }, [activities, search, filterType]);

  const signedUpActivities = React.useMemo(() => signedUpActivityIds.map(id => activities.find(a => a.activity_id === id)).filter(Boolean), [signedUpActivityIds, activities]);

  const handleSignUp = async (activityId) => {
    if (!user.user_id) return;
    setSigningUpId(activityId);
    try {
      const res = await fetch(`/api/activities/${activityId}/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.user_id }) });
      if (res.ok) setSignedUpActivityIds(ids => [...ids, activityId]);
    } catch (err) {}
    setSigningUpId(null);
  };

  const handleUnsign = async (activityId) => {
    if (!user.user_id) return;
    setUnsigningId(activityId);
    try {
      const res = await fetch(`/api/activities/${activityId}/signup`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.user_id }) });
      if (res.ok) {
        setSignedUpActivityIds(ids => ids.filter(id => id !== activityId));
      } else {
        const data = await res.json();
        alert(data.error || 'Error removing signup');
      }
    } catch (err) {
      alert('Server error');
    }
    setUnsigningId(null);
  };

  return (
    <PageLayout user={user} active="dashboard">
      <div className="row mb-4">
        <div className="col-lg-12">
          <h1 style={styles.dashboardHeader}>DashBoard</h1>
        </div>
      </div>

      <div className="row mb-7">
        <div className="col-lg-7">
          <div className="card mb-5" style={styles.card}>
            <CardHeader>Top Picks</CardHeader>
            <div className="card-body" style={styles.cardBodyOuter}>
              <div style={styles.cardBodyInner}>Top picks will appear here.</div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card mb-5" style={styles.card}>
            <CardHeader>Your Activities</CardHeader>
            <div className="card-body" style={styles.cardBodyOuter}>
              <div style={styles.cardBodyInner}>
                {loadingActivities ? (
                  <div>Loading your activities...</div>
                ) : signedUpActivities.length === 0 ? (
                  <div>You have not signed up for any activities yet.</div>
                ) : (
                  signedUpActivities.map(a => (
                    <div key={a.activity_id} style={styles.signedUpActivityItem}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={styles.signedUpActivityName}>{a.name}</div>
                        <div>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleUnsign(a.activity_id)} disabled={unsigningId === a.activity_id}>{unsigningId === a.activity_id ? 'Removing...' : 'Unsign'}</button>
                        </div>
                      </div>
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
            <CardHeader>Activities</CardHeader>
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
                {loadingActivities ? <div>Loading activities...</div> : filteredActivities.length === 0 ? <div>No activities found.</div> : filteredActivities.map(act => (
                  <div key={act.activity_id} style={styles.activityItem}>
                    <div style={styles.activityName}>{act.name}</div>
                    {act.description && <div style={styles.activityDesc}>{act.description}</div>}
                    {act.tags?.length > 0 && <div style={styles.activityTags}><span style={styles.tagLabel}>Tags:</span> {act.tags.join(', ')}</div>}
                    {act.competencies?.length > 0 && <div style={styles.activityCompetencies}><span style={styles.tagLabel}>Competencies:</span> {act.competencies.join(', ')}</div>}
                    <div className="d-flex justify-content-end mt-2">
                      {signedUpActivityIds.includes(act.activity_id) ? (
                        <button className="btn btn-success btn-sm" disabled>Signed Up</button>
                      ) : (
                        <button className="btn btn-primary btn-sm" disabled={signingUpId === act.activity_id || unsigningId === act.activity_id} onClick={() => handleSignUp(act.activity_id)}>{signingUpId === act.activity_id ? 'Signing up...' : 'Sign up'}</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};