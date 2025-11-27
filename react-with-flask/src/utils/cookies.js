// Small cookie helper utilities used by the front-end.
// These are simple, synchronous helpers for demo usage.
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Set a cookie for `days` days. Simple wrapper used by the auth pages.
export function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

// Clear a cookie by setting it to the epoch.
export function clearCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

export default { getCookie, setCookie, clearCookie };
