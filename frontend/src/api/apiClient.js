// =============================================
// api/apiClient.js
// Configuración de Axios para Culinaria Store
// Base URL: http://localhost:5000/api
// =============================================
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://proyecto-herramientas-de-desarrollo-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de REQUEST — adjunta el token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de RESPONSE — manejo global de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido → limpiar sesión
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
