export const colors = {
  primary: '#39498b',
  sidebarBg: 'rgb(21,34,89)',
  sidebarBtn: '#3A498B',
  danger: 'rgb(255,95,87)',
  accent: '#ff5f57',
  blue: '#5CA4E8',
  pageBg: '#ECECEC',
  cardBg: '#E7E7E7'
};

export const spacing = { small: 8, medium: 16, large: 24 };

export const mainPanel = { height: '100%', overflow: 'visible', marginLeft: 'max(var(--sidebar-width, 300px), 32px)', minWidth: 0, marginTop: '140px', zIndex: 3 };

export const header = { color: '#fff', fontWeight: 'bold', fontSize: 56, margin: '32px 0 24px 0', letterSpacing: 2 };

export const card = { minHeight: '450px', paddingBottom: '48px', border: 'none', borderRadius: '12px' };

export const cardBody = { background: '#E7E7E7', minHeight: '220px', margin: '24px', padding: '16px', overflowY: 'auto', borderRadius: '8px' };

export const formCardBody = cardBody;

export const deleteListCardBody = { background: '#E7E7E7', minHeight: '220px', margin: '24px', borderRadius: '8px', padding: 0 };

export const deleteListInner = { height: '350px', overflowY: 'auto', background: '#f5f5f5', borderRadius: '8px', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08)', margin: 0, padding: 16 };

export const deleteListItem = { background: '#fff', borderRadius: 6, padding: '8px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' };

export const logoutButton = { marginTop: 16, background: '#E85C5C', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: '500', cursor: 'pointer' };

// Auth page shared styles
export const authCard = { maxWidth: 550, width: '100%', height: '100vh', background: 'rgba(255,255,255,0.975)', borderRadius: '1rem 0 0 1rem' };
export const authBrand = { marginLeft: 115, width: 270 };
export const authHeading = { margin: 0, padding: 0, color: colors.primary, fontWeight: 600, fontSize: '1.75rem' };
export const authInput = { maxWidth: 270, height: '5vh' };
export const authButton = { maxWidth: 270, width: '100%', height: '5vh', backgroundColor: colors.blue, color: '#fff', border: 'none' };

export const cardBodyInner = { height: '100%', overflowY: 'auto', background: '#f5f5f5', borderRadius: '8px', padding: 16, boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08)' };
export const activityItem = { background: '#fff', borderRadius: 6, padding: '12px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', marginBottom: 12 };
export const signedUpActivityItem = { background: '#fff', borderRadius: 6, padding: '8px 12px', marginBottom: 8 };
export const signedUpActivityName = { fontWeight: 600 };
export const signedUpActivityDesc = { color: '#444', fontSize: 13 };
export const activityName = { fontWeight: 600, fontSize: 18 };
export const activityDesc = { color: '#444', fontSize: 15, margin: '4px 0 6px 0' };
export const activityTags = { fontSize: 14, color: '#2d5c8a', marginBottom: 2 };
export const activityCompetencies = { fontSize: 14, color: '#8a2d5c' };
export const tagLabel = { fontWeight: 500 };

export default { colors, spacing };
