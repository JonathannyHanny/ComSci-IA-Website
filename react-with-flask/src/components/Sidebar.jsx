import React from 'react';

import { colors } from './styles';

const Sidebar = ({ user, isCollapsed, onNavigate, active = 'dashboard' }) => {
  const dynamicBtnStyle = { textAlign: isCollapsed ? 'center' : 'left' };
  const btn = (label, path, isActive) => (
    <button
      key={label}
      style={{
        background: isActive ? colors.danger : colors.sidebarBtn,
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        margin: '4px 0',
        padding: '10px 24px',
        fontWeight: 500,
        width: 'calc(100% - 50px)',
        cursor: isActive ? 'not-allowed' : 'pointer',
        opacity: isActive ? 0.8 : 1,
        ...dynamicBtnStyle
      }}
      disabled={isActive}
      onClick={() => !isActive && onNavigate && onNavigate(path)}
    >
      {isCollapsed ? label.charAt(0) : label}
    </button>
  );

  return (
  <div style={{ width: 'var(--sidebar-width, 260px)', minWidth: 50, maxWidth: 260, height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 1000, background: colors.sidebarBg, paddingTop: 16 }} className="text-white d-flex flex-column align-items-center justify-content-start py-4">
      {isCollapsed ? (
        <h2 className="fw-bold mb-4">CS</h2>
      ) : (
        <>
          <h2 className="fw-bold mb-4" style={{ marginTop: '32px', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '2rem', width: '100%', lineHeight: 1.1, marginBottom: 0 }}>Class</span>
            <span style={{ color: colors.accent, fontSize: '2.2rem', display: 'block', width: '100%', lineHeight: 1.1, marginTop: -4 }}>Beyond</span>
          </h2>
          <div className="mb-3">{`${user?.first_name || 'DebugFirst'} ${user?.last_name || 'DebugLast'}`}</div>
        </>
      )}

      <hr className="border-light w-100 mb-4" />
      <div className="w-100 d-flex flex-column align-items-center">
        {btn('Dashboard', '/dashboard', active === 'dashboard')}
        {btn('Profile', '/profile', active === 'profile')}
        {btn('Settings', '/settings', active === 'settings')}
        {btn('Admin', '/admin', active === 'admin')}
      </div>
    </div>
  );
};

export default Sidebar;
