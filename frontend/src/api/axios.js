import axios from 'axios';

// Base URL configurable via Vite env (see frontend/.env). Falls back to localhost.
const baseURL =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/+$/, '')) ||
  'http://127.0.0.1:8000/api';

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Keep true if you ever switch to cookie-based auth; Bearer tokens still work.
  withCredentials: true,
});

// Attach Bearer token (Sanctum personal access token) automatically.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers = config.headers || {};
  config.headers.Accept = 'application/json';
  return config;
});

export default API;
