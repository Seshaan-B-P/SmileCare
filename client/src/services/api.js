// REST API Client Service for Frontend
const RENDER_API_URL = 'https://smilecare-2bik.onrender.com/api';
const LOCAL_API_URL = 'http://localhost:5000/api';

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Primary URL: If on localhost, use local port 5000 first; otherwise use env variable or Render
const rawEnvUrl = import.meta.env.VITE_API_URL;
const PRIMARY_URL = isLocalhost 
  ? LOCAL_API_URL 
  : (rawEnvUrl ? (rawEnvUrl.endsWith('/api') ? rawEnvUrl : `${rawEnvUrl.replace(/\/+$/, '')}/api`) : RENDER_API_URL);

export const fetchApi = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);

  // Candidate URLs in priority order
  const candidates = isLocalhost
    ? [LOCAL_API_URL, RENDER_API_URL]
    : [PRIMARY_URL, LOCAL_API_URL, RENDER_API_URL];

  const uniqueCandidates = Array.from(new Set(candidates));

  for (let i = 0; i < uniqueCandidates.length; i++) {
    const baseUrl = uniqueCandidates[i];
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, options);
      const data = await res.json();

      // If route not found on this server (e.g. newly added route on local server not yet deployed to Render)
      if (res.status === 404 && data?.error === 'Route not found' && i < uniqueCandidates.length - 1) {
        continue;
      }
      return data;
    } catch (err) {
      if (i < uniqueCandidates.length - 1) {
        continue;
      }
      console.warn(`API Connection to ${endpoint} failed:`, err.message);
      return { success: false, error: err.message };
    }
  }
};

// Clinic Status & Closure Notification API Helpers
export const getClinicStatus = () => fetchApi('/clinic/status', 'GET');

export const updateClinicStatus = (status, reason, recipientPolicy, closedBy) =>
  fetchApi('/clinic/status', 'POST', { status, reason, recipientPolicy, closedBy });

export const updateClinicScheduleConfig = (config) =>
  fetchApi('/clinic/schedule-config', 'PUT', config);

export const sendTestClosureEmail = (testEmail, patientName) =>
  fetchApi('/clinic/test-closure-email', 'POST', { testEmail, patientName });

export const getClosureHistory = () => fetchApi('/clinic/closure-history', 'GET');

// Profile Image API Helpers
export const uploadAvatar = ({ base64Data, targetType, targetId, requesterId, requesterRole, originalName }) =>
  fetchApi('/upload/avatar', 'POST', { base64Data, targetType, targetId, requesterId, requesterRole, originalName });

export const removeAvatar = ({ targetType, targetId, requesterId, requesterRole }) =>
  fetchApi('/upload/avatar', 'DELETE', { targetType, targetId, requesterId, requesterRole });

// PDF Document API Helpers
export const uploadPdfDocument = (docPayload) =>
  fetchApi('/documents/upload', 'POST', docPayload);

export const getPatientDocuments = (patientId, requesterId, requesterRole) =>
  fetchApi(`/documents/patient/${patientId}?requesterId=${requesterId || ''}&requesterRole=${requesterRole || 'Doctor'}`, 'GET');

export const deletePdfDocument = (docId, requesterId, requesterRole) =>
  fetchApi(`/documents/${docId}`, 'DELETE', { requesterId, requesterRole });

// Doctor–Patient Communication API Helpers
export const getConversations = (userId, role) =>
  fetchApi(`/conversations?userId=${userId || ''}&role=${role || 'Doctor'}`, 'GET');

export const createOrGetConversation = (doctorId, patientId, requesterId, requesterRole) =>
  fetchApi('/conversations', 'POST', { doctorId, patientId, requesterId, requesterRole });

export const getMessages = (conversationId, userId, role) =>
  fetchApi(`/messages?conversationId=${conversationId}&userId=${userId || ''}&role=${role || 'Doctor'}`, 'GET');

export const sendMessage = (messagePayload) =>
  fetchApi('/messages', 'POST', messagePayload);

// WhatsApp Follow-up to Doctor Communication API Helpers
export const generateChatToken = (payload) =>
  fetchApi('/chat-token/generate', 'POST', payload);

export const verifyChatToken = (token) =>
  fetchApi('/chat-token/verify-token', 'POST', { token });

export const verifyChatIdentity = (token, verificationCode, phoneLast4) =>
  fetchApi('/chat-token/verify-identity', 'POST', { token, verificationCode, phoneLast4 });

export const revokeChatToken = (payload) =>
  fetchApi('/chat-token/revoke', 'POST', payload);

export const getPatientChatMessages = (token) =>
  fetchApi(`/patient-chat/messages?token=${encodeURIComponent(token)}`, 'GET');

export const sendPatientChatMessage = (payload) =>
  fetchApi('/patient-chat/messages', 'POST', payload);



