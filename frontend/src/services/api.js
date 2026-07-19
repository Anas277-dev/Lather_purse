import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFlashSales: () => api.get('/products/flash-sale'),
  getLowStock: () => api.get('/products/low-stock'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Order APIs
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getByTracking: (trackingId) => api.get(`/orders/tracking/${trackingId}`),
  getAll: (params) => api.get('/orders/all', { params }),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  generateInvoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),
};

// Review APIs
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  getPending: () => api.get('/reviews/pending'),
  approve: (id) => api.put(`/reviews/${id}/approve`),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Complaint APIs
export const complaintAPI = {
  create: (data) => api.post('/complaints', data),
  getMyComplaints: () => api.get('/complaints/my-complaints'),
  getAll: (params) => api.get('/complaints/all', { params }),
  updateStatus: (id, data) => api.put(`/complaints/${id}`, data),
};

// Wishlist APIs
export const wishlistAPI = {
  getAll: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

// Settings APIs
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  getBanners: () => api.get('/settings/banners'),
  getAllBanners: () => api.get('/settings/banners/all'),
  createBanner: (data) => api.post('/settings/banners', data),
  updateBanner: (id, data) => api.put(`/settings/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/settings/banners/${id}`),
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getRevenue: () => api.get('/analytics/revenue'),
  getCategories: () => api.get('/analytics/categories'),
  getColors: () => api.get('/analytics/colors'),
};
