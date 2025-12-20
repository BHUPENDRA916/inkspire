import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token to headers
apiClient.interceptors.request.use(
  (config) => {
    const userStorage = localStorage.getItem('campuseats-user');
    if (userStorage) {
      try {
        const { token } = JSON.parse(userStorage);
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error parsing user from localStorage in apiClient', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (e.g., for 401 auto-logout)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // User is not authorized (e.g., token expired)
      localStorage.removeItem('campuseats-user');
      // Reloading the page will trigger ProtectedRoute to redirect to /login
      // This is a simple way to sync auth state
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;