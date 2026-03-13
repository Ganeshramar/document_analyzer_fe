import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — auto-logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data) => API.post('/api/auth/register', data);
export const loginUser = (data) => API.post('/api/auth/login', data);
export const getMe = () => API.get('/api/auth/me');

// Documents
export const uploadDocument = (formData) =>
  API.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getDocuments = () => API.get('/api/documents');
export const getDocumentById = (id) => API.get(`/api/documents/${id}`);
export const generateSummary = (id) => API.post(`/api/documents/${id}/summary`);
export const askQuestion = (id, question) =>
  API.post(`/api/documents/${id}/ask`, { question });

export default API;
