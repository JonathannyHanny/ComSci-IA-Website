import React from 'react';
import { colors } from './styles';
import image2 from '../assets/LogInBackground.png';

const Background = ({ image, tint = 'rgba(91,56,56,0.5)', children }) => {
  const useImage = image || image2;
  const bgImageStyle = useImage
    ? { backgroundImage: `url(${useImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    : { background: colors.pageBg };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', position: 'relative', overflowX: 'hidden' }}>
      <div style={{ position: 'absolute', left: 'var(--sidebar-width, 0px)', width: '100%', height: 500 }}>
        <div style={{ width: '100%', height: '100%', ...bgImageStyle }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', background: tint, pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', left: 0, bottom: '-100vh', width: '100%', height: '100vh', background: '#ECECEC', zIndex: 2 }} />
      </div>
      <div style={{ position: 'relative', zIndex: 3 }}>{children}</div>
    </div>
  );
};

export default Background;
