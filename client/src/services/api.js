// REST API Client Service for Frontend

const API_BASE_URL = 'http://localhost:5000/api';

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
