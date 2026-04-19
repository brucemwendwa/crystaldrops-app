import axios from 'axios';

/**
 * Use VITE_API_URL when set (e.g. production).
 * Otherwise same-origin `/api` — Vite proxies it to the backend in `npm run dev` and `npm run preview`.
 */
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signup = async (email, password) => {
  const response = await api.post('/auth/signup', { email, password });
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getAdminOrders = async () => {
  const response = await api.get('/admin/orders');
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/admin/orders/${id}`, { status });
  return response.data;
};

export const initiatePayment = async (paymentData) => {
  const response = await api.post('/payments/stkpush', paymentData);
  return response.data;
};

export default api;
