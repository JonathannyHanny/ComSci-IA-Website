// PageLayout provides the app chrome (Sidebar + Background) and a
// content area where pages render their UI. It also handles a simple
// responsive collapse behaviour for the sidebar.
import React from 'react';
import Sidebar from './Sidebar';
import Background from './Background';
import { colors, mainPanel } from './styles';

const PageLayout = ({ user, active = 'dashboard', children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  React.useEffect(() => {
    const handleResize = () => setIsSidebarCollapsed(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Background>
      <div className="d-flex flex-row">
        <Sidebar user={user} isCollapsed={isSidebarCollapsed} onNavigate={p => window.location.href = p} active={active} />
        <div className="flex-grow-1 d-flex flex-column" style={mainPanel}>
          <div className="container-fluid">
            {children}
          </div>
        </div>
      </div>
    </Background>
  );
};

export default PageLayout;
