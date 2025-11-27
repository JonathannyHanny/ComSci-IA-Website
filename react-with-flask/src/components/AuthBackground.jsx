// AuthBackground is a page-level wrapper used by authentication pages
// (Log in / Sign up). It renders the background image with a subtle
// dark overlay so auth cards are readable.
import React from 'react';
import image2 from '../assets/LogInBackground.png';
import { colors } from './styles';

const AuthBackground = ({ children, image = image2 }) => {
  return (
    <div style={{ minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'hidden', backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.18)' }} />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100vw', height: 35, background: 'rgba(236,236,236,1)' }} />
    </div>
  );
};

export default AuthBackground;
