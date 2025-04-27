// Create this in a new file, e.g., utils/axiosConfig.js
import axios from 'axios';

const configureAxios = (getToken: () => any) => {
  // Create an instance
  const axiosInstance = axios.create({
    baseURL: 'https://galaxy-backend-imkz.onrender.com',
  });

  // Add request interceptor to automatically add token
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle common errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Handle unauthorized access
        console.warn('Unauthorized access, token may be invalid');
        // You could trigger logout here
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default configureAxios;