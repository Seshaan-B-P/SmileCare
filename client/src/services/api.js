// REST API Client Service for Frontend
const FALLBACK_API_URL = 'https://smilecare-2bik.onrender.com/api';
const rawUrl = import.meta.env.VITE_API_URL || FALLBACK_API_URL;
const cleanUrl = rawUrl.replace(/\/+$/, '');
const API_BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

export const fetchApi = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return await res.json();
  } catch (err) {
    // If on localhost and primary failed, try local server on port 5000
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !API_BASE_URL.includes(':5000')) {
      try {
        const localRes = await fetch(`http://localhost:5000/api${endpoint}`, options);
        return await localRes.json();
      } catch (localErr) {
        // Both unreachable
      }
    }
    console.warn(`API Connection to ${endpoint} failed:`, err.message);
    return { success: false, error: err.message };
  }
};
