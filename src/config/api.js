/**
 * Global API Configuration
 * Resolves the backend server base URL using VITE_SERVER_URL.
 * In production on Render: resolves to https://coophub-backend-production-60ba.up.railway.app
 * In local development / fallback: defaults to '' (proxied by Vite/Render)
 */
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocal
  ? (import.meta.env?.VITE_SERVER_URL || 'http://localhost:5000').replace(/\/+$/, '')
  : ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_SERVER_URL)
      ? import.meta.env.VITE_SERVER_URL.replace(/\/+$/, '')
      : '');

export function getApiUrl(path = '') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export default {
  API_BASE_URL,
  getApiUrl
};
