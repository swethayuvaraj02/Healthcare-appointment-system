import axios from 'axios';

const api = axios.create({
  baseURL: 'https://healthcare-appointment-backend-omega.vercel.app/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;