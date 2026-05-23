import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
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

// ── AUTH ──────────────────────────────────────
export const authAPI = {
  login:         (data) => api.post('/auth/login', data),
  register:      (data) => api.post('/auth/register', data),
  forgotPassword:(data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe:         ()     => api.get('/auth/me'),
};

// ── COMPLAINTS ────────────────────────────────
export const complaintAPI = {
  // Student
  create:           (data)   => api.post('/student/complaints', data),
  getMyComplaints:  (params) => api.get('/student/complaints', { params }),
  getStudentDash:   ()       => api.get('/student/dashboard'),

  // Admin
  getAll:           (params) => api.get('/admin/complaints', { params }),
  updateStatus:     (id, data) => api.patch(`/admin/complaints/${id}/status`, data),
  assign:           (id, data) => api.post(`/admin/complaints/${id}/assign`, data),
  getAdminDash:     ()       => api.get('/admin/dashboard'),

  // Staff
  getAssigned:      (params) => api.get('/staff/complaints', { params }),
  updateStatusStaff:(id, data) => api.patch(`/staff/complaints/${id}/status`, data),
  getStaffDash:     ()       => api.get('/staff/dashboard'),

  // Shared
  getById:          (id)           => api.get(`/complaints/${id}`),
  getByTicket:      (ticketNumber) => api.get(`/complaints/ticket/${ticketNumber}`),
};

// ── CATEGORIES ────────────────────────────────
export const categoryAPI = {
  getActive: ()         => api.get('/categories/active'),
  getAll:    ()         => api.get('/categories'),
  create:    (data)     => api.post('/categories/admin', data),
  update:    (id, data) => api.put(`/categories/admin/${id}`, data),
  delete:    (id)       => api.delete(`/categories/admin/${id}`),
};

// ── USERS ─────────────────────────────────────
export const userAPI = {
  getAll:          ()         => api.get('/admin/users'),
  getAllStaff:      ()         => api.get('/admin/users/staff'),
  getAllStudents:   ()         => api.get('/admin/users/students'),
  toggleStatus:    (id)       => api.patch(`/admin/users/${id}/toggle-status`),
  updateProfile:   (data)     => api.put('/profile', data),
};

// ── NOTIFICATIONS ─────────────────────────────
export const notificationAPI = {
  getAll:       ()   => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllRead:  ()   => api.post('/notifications/mark-all-read'),
  markRead:     (id) => api.patch(`/notifications/${id}/read`),
};

export default api;
