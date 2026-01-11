// Dashboard - main page where students browse activities
// Shows top picks, your activities, and a full list of everything

import React from 'react';
import PageLayout from '../components/PageLayout';
import CardHeader from '../components/CardHeader';
import { getCookie } from '../utils/cookies';
import { colors, mainPanel, card, cardBody, header, activityItem, signedUpActivityItem, signedUpActivityName, signedUpActivityDesc, activityName, activityDesc, activityTags, activityCompetencies, tagLabel } from '../components/styles';

// Bundle up all the styling constants so we can use them easily throughout the component
const styles = {
  mainPanel,
  dashboardHeader: header,
  card,
  cardBodyOuter: cardBody,
  cardBody,
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
  // Grab user from cookies
  const user = { email: getCookie('user_email'), first_name: getCookie('user_first_name'), last_name: getCookie('user_last_name'), user_id: getCookie('user_id'), is_admin: getCookie('user_is_admin') === 'true' };

  // state
  const [activities, setActivities] = React.useState([]);
  const [loadingActivities, setLoadingActivities] = React.useState(true);
  const [filterType, setFilterType] = React.useState('Alphabetical');
  const [search, setSearch] = React.useState('');
  const [signedUpActivityIds, setSignedUpActivityIds] = React.useState([]);
  const [signingUpId, setSigningUpId] = React.useState(null);
  const [unsigningId, setUnsigningId] = React.useState(null);
  const [recommendations, setRecommendations] = React.useState({ top_picks: [], content: [], collaborative: [], reverse: [] });
  const [recsLoading, setRecsLoading] = React.useState(false);

  // redirect if not logged in
  React.useEffect(() => { if (getCookie('logged_in') !== 'true') window.location.href = '/login'; }, []);

  // fetch activities on load
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

  // fetch user's signups and recommendations
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

    // get recommendations
    // The backend will run 4 different recommendation algorithms for us
    const fetchRecs = async () => {
      if (!user.user_id) return;
      setRecsLoading(true);
      try {
        const res = await fetch(`/api/recommendations/user/${user.user_id}`);
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data || { top_picks: [], content: [], collaborative: [], reverse: [] });
        }
      } catch (err) {}
      setRecsLoading(false);
    };
    fetchRecs();
  }, [user.user_id]);

  // filter by search box - checks name, tags, competencies
  const filteredActivities = React.useMemo(() => {
    let acts = [...activities];
    if (search) {
      const q = search.toLowerCase();
      acts = acts.filter(a => {
        const inName = a.name?.toLowerCase().includes(q);
        const inTags = Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(q));
        const inComps = Array.isArray(a.competencies) && a.competencies.some(c => c.toLowerCase().includes(q));
        return inName || inTags || inComps;
      });
    }
    if (filterType === 'Alphabetical') acts.sort((a, b) => a.name.localeCompare(b.name));
    return acts;
  }, [activities, search, filterType]);

  // get activity objects from IDs
  const signedUpActivities = React.useMemo(() => signedUpActivityIds.map(id => activities.find(a => a.activity_id === id)).filter(Boolean), [signedUpActivityIds, activities]);

  // score activities by how many rec systems picked them
  // content & collaborative get 2 points, others get 1
  const getActivityScore = React.useCallback((activityId) => {
    if (!recommendations) return 0;
    let score = 0;
    if (recommendations.collaborative?.some(r => (r.activity_id || r.id) === activityId)) score += 2;
    if (recommendations.content?.some(r => (r.activity_id || r.id) === activityId)) score += 2;
    if (recommendations.reverse?.some(r => (r.activity_id || r.id) === activityId)) score += 1;
    if (recommendations.top_picks?.some(r => (r.activity_id || r.id) === activityId)) score += 1;
    return score;
  }, [recommendations]);

  // filter activities by the dropdown selection
  const preferenceOrderedActivities = React.useMemo(() => {
    let acts = [...filteredActivities];
    
    if (filterType === 'Similar to what you\'ve done') {
      const recs = (recommendations && recommendations.content && recommendations.content.length) ? recommendations.content : [];
      if (recs && recs.length > 0) {
        const recIds = new Set(recs.map(r => r.activity_id || r.id));
        acts = acts.filter(a => recIds.has(a.activity_id));
        acts.sort((a, b) => getActivityScore(b.activity_id) - getActivityScore(a.activity_id));
      } else {
        acts = [];
      }
    } else if (filterType === 'What people like you enjoy') {
      const recs = (recommendations && recommendations.collaborative && recommendations.collaborative.length) ? recommendations.collaborative : [];
      if (recs && recs.length > 0) {
        const recIds = new Set(recs.map(r => r.activity_id || r.id));
        acts = acts.filter(a => recIds.has(a.activity_id));
        acts.sort((a, b) => getActivityScore(b.activity_id) - getActivityScore(a.activity_id));
      } else {
        acts = [];
      }
    } else if (filterType === 'Try something new') {
      const recs = (recommendations && recommendations.reverse && recommendations.reverse.length) ? recommendations.reverse : [];
      if (recs && recs.length > 0) {
        const recIds = new Set(recs.map(r => r.activity_id || r.id));
        acts = acts.filter(a => recIds.has(a.activity_id));
        acts.sort((a, b) => getActivityScore(b.activity_id) - getActivityScore(a.activity_id));
      } else {
        acts = []; // No reverse recommendations available
      }
    } else if (filterType === 'Alphabetical') {
      // Alphabetical is already sorted - don't do anything
    } else {
      acts.sort((a, b) => getActivityScore(b.activity_id) - getActivityScore(a.activity_id));
    }
    
    return acts;
  }, [filteredActivities, filterType, recommendations, getActivityScore]);

  // map activities to their recommendation categories for badges
  const recByActivityId = React.useMemo(() => {
    const map = {};
    if (!recommendations) return map;
    Object.entries(recommendations).forEach(([category, list]) => {
      if (!Array.isArray(list)) return;
      list.forEach((it) => {
        const id = it && (it.activity_id || it.id);
        if (!id) return;
        map[id] = map[id] || new Set();
        map[id].add(category);
      });
    });
    return map;
  }, [recommendations]);

  // top 3 picks - exclude signed up, sort by score
  const topPickActivities = React.useMemo(() => {
    const scored = activities
      .filter(a => !signedUpActivityIds.includes(a.activity_id))
      .map(a => ({ activity: a, score: getActivityScore(a.activity_id) }));
    const topScored = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 3); // Get top 3 with non-zero scores
    return topScored.map(s => s.activity);
  }, [activities, getActivityScore, signedUpActivityIds]);

  // signup handler
  const handleSignUp = async (activityId) => {
    if (!user.user_id) return;
    setSigningUpId(activityId);
    try {
      const res = await fetch(`/api/activities/${activityId}/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.user_id }) });
      if (res.ok) setSignedUpActivityIds(ids => [...ids, activityId]);
    } catch (err) {}
    setSigningUpId(null);
  };

  // unsign handler
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

  // page layout with sidebar
  return (
    <PageLayout user={user} active="dashboard">
      {/* Page header */}
      <div className="row mb-4">
        <div className="col-lg-12">
          <h1 style={styles.dashboardHeader}>DashBoard</h1>
        </div>
      </div>

      {/* Top section: Top Picks (left) and Your Activities (right) */}
      <div className="row mb-7">
        {/* Top Picks card - shows 3 recommended activities */}
        <div className="col-lg-7">
          <div className="card mb-5" style={styles.card}>
            <CardHeader>Top Picks</CardHeader>
            <div className="card-body" style={styles.cardBodyOuter}>
              <div style={{padding: '16px', maxHeight: 300, overflowY: 'auto' }}>
                {recsLoading ? (
                  <div>Loading recommendations...</div>
                ) : topPickActivities.length > 0 ? (
                  topPickActivities.map(a => (
                    <div key={a.activity_id} style={{ padding: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600 }}>{a.name}</div>
                        <div>
                          {/* Show "Signed" if already signed up, otherwise show "Sign up" button */}
                          {signedUpActivityIds.includes(a.activity_id) ? (
                            <button className="btn btn-success btn-sm" disabled>Signed</button>
                          ) : (
                            <button className="btn btn-primary btn-sm" disabled={signingUpId === a.activity_id || unsigningId === a.activity_id} onClick={() => handleSignUp(a.activity_id)}>{signingUpId === a.activity_id ? 'Signing...' : 'Sign up'}</button>
                          )}
                        </div>
                      </div>
                      {a.description && <div style={{ color: '#444', fontSize: 13 }}>{a.description}</div>}
                    </div>
                  ))
                ) : (
                  <div>No recommendations yet. Sign up for more activities to get personalized picks!</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Your Activities card - shows what you're currently signed up for */}
        <div className="col-lg-4">
          <div className="card mb-5" style={styles.card}>
            <CardHeader>Your Activities</CardHeader>
            <div className="card-body" style={styles.cardBodyOuter}>
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
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
                          {/* Show "Unsign" button so people can remove themselves */}
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

      {/* Main activities list - searchable and filterable */}
      <div className="row mb-4">
        <div className="col-lg-11">
          <div className="card mb-4" style={styles.card}>
            <CardHeader>Activities</CardHeader>
            {/* Search bar and filter dropdown */}
            <div style={{ padding: '16px' }}>
              <div className="row mb-4">
                <div className="col-md-6">
                  {/* Search box - searches names, tags, and competencies */}
                  <input type="text" className="form-control" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="col-md-6">
                  {/* Filter dropdown - changes how activities are sorted/filtered */}
                  <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="Alphabetical">Alphabetical</option>
                    <option value="Similar to what you've done">Similar to what you've done</option>
                    <option value="What people like you enjoy">What people like you enjoy</option>
                    <option value="Try something new">Try something new</option>
                  </select>
                </div>
              </div>
            </div>
            {/* The actual list of activities */}
            <div className="card-body" style={{ ...styles.cardBodyOuter, marginTop: '-10px', padding: 0 }}>
              <div style={{padding: '16px', maxHeight: 520, overflowY: 'auto' }}>
                {loadingActivities ? <div>Loading activities...</div> : preferenceOrderedActivities.length === 0 ? <div>No activities found.</div> : preferenceOrderedActivities.map(act => {
                  // For each activity, figure out which recommendation badges to show
                  const badges = recByActivityId[act.activity_id];
                  const badgeArray = badges ? Array.from(badges) : [];
                  return (
                    <div key={act.activity_id} style={styles.activityItem}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div style={styles.activityName}>{act.name}</div>
                        <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                          {/* Show colored badges for each recommendation type */}
                          {badgeArray.map((cat) => {
                            let color = '#dfe6e9';
                            let label = '';
                            if (cat === 'top_picks') { color = '#ffd54f'; label = 'Top'; }
                            if (cat === 'content') { color = '#5CA4E8'; label = 'Similar'; }
                            if (cat === 'collaborative') { color = '#8BC34A'; label = 'Peers'; }
                            if (cat === 'reverse') { color = '#FF8A65'; label = 'Try it out'; }
                            return (
                              <small key={cat} style={{ background: color, padding: '4px 8px', borderRadius: 8, fontWeight: 600, color: '#111' }}>{label}</small>
                            );
                          })}
                        </div>
                      </div>
                      {/* Show description if it exists */}
                      {act.description && <div style={styles.activityDesc}>{act.description}</div>}
                      {/* Show tags if any */}
                      {act.tags?.length > 0 && <div style={styles.activityTags}><span style={styles.tagLabel}>Tags:</span> {act.tags.join(', ')}</div>}
                      {/* Show competencies if any */}
                      {act.competencies?.length > 0 && <div style={styles.activityCompetencies}><span style={styles.tagLabel}>Competencies:</span> {act.competencies.join(', ')}</div>}
                      {/* Sign up button (or "Signed Up" if already signed up) */}
                      <div className="d-flex justify-content-end mt-2">
                        {signedUpActivityIds.includes(act.activity_id) ? (
                          <button className="btn btn-success btn-sm" disabled>Signed Up</button>
                        ) : (
                          <button className="btn btn-primary btn-sm" disabled={signingUpId === act.activity_id || unsigningId === act.activity_id} onClick={() => handleSignUp(act.activity_id)}>{signingUpId === act.activity_id ? 'Signing up...' : 'Sign up'}</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
