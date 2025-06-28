import axios from 'axios';

// Detect if we're running locally or on Netlify
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal ? 'http://localhost:8000' : '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store API key in memory for Netlify functions
let storedApiKey = null;

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Server error';
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check if the backend is running.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export const checkApiConnection = async () => {
  try {
    const endpoint = isLocal ? '/' : '/.netlify/functions/health';
    const response = await api.get(endpoint);
    return response.status === 200;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
};

export const setApiKey = async (apiKey) => {
  try {
    storedApiKey = apiKey; // Store for Netlify functions
    
    const endpoint = isLocal ? '/api/set-api-key' : '/.netlify/functions/set-api-key';
    const response = await api.post(endpoint, { apiKey });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const analyzePhishing = async (emailContent, includeHeaders = false) => {
  try {
    const endpoint = isLocal ? '/api/analyze/phishing' : '/.netlify/functions/analyze-phishing';
    const payload = {
      emailContent,
      includeHeaders,
      ...(storedApiKey && { apiKey: storedApiKey })
    };
    
    const response = await api.post(endpoint, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const analyzeLogs = async (file) => {
  try {
    if (isLocal) {
      // Local development - use FormData
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/analyze/logs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Netlify - convert file to text and send as JSON
      const logContent = await file.text();
      const response = await api.post('/.netlify/functions/analyze-logs', {
        logContent,
        filename: file.name,
        apiKey: storedApiKey
      });
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};

export const explainLogLine = async (logLine) => {
  try {
    const endpoint = isLocal ? '/api/explain/log-line' : '/.netlify/functions/explain-log-line';
    const payload = {
      logLine,
      ...(storedApiKey && { apiKey: storedApiKey })
    };
    
    const response = await api.post(endpoint, payload);
    return response.data.explanation;
  } catch (error) {
    throw error;
  }
};

export default api;