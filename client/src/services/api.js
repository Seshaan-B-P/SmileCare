// REST API Client Service for Frontend

const FALLBACK_API_URL = 'https://smilecare-2bik.onrender.com/api';
const rawUrl = import.meta.env.VITE_API_URL || FALLBACK_API_URL;
const cleanUrl = rawUrl.replace(/\/+$/, '');
const API_BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

export const fetchApi = async (endpoint, method = 'GET', body = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return await res.json();
  } catch (err) {
    console.warn(`API Connection to ${endpoint} failed, falling back to local state sync.`);
    return { success: false, error: err.message };
  }
};
