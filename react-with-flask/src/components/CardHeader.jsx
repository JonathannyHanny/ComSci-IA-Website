// Small, reusable header for cards that enforces the app color token.
// Used across many pages to keep a consistent card heading style.
import React from 'react';
import { colors } from './styles';

const CardHeader = ({ children }) => (
  <div style={{ backgroundColor: colors.primary, color: '#fff', fontSize: '1.5rem', fontWeight: 500, letterSpacing: '1px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: '12px 16px' }}>
    {children}
  </div>
);

export default CardHeader;
