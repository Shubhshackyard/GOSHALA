import axios from 'axios';

// Change from absolute URL to relative URL for proxy
const API_URL = '/api';  // Instead of import.meta.env.VITE_API_URL

// Create a configured axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add authentication token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add language parameter
  const language = localStorage.getItem('i18nextLng') || navigator.language.split('-')[0] || 'en';
  config.params = {
    ...config.params,
    lang: language
  };
  
  return config;
});

export default api;