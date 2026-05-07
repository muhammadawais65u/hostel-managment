import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request Token:', token ? 'Present' : 'Missing');
    console.log('API Request URL:', config.url);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found in localStorage');
    }
    
    // If data is FormData, remove Content-Type to let browser set it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear session if we're not on a public route and have a token
      const hasToken = localStorage.getItem('token');
      const isPublicRoute = ['/', '/login', '/register', '/rooms', '/about', '/contact'].some(route => 
        window.location.pathname === route || window.location.pathname.startsWith('/rooms/')
      );
      
      if (hasToken && !isPublicRoute) {
        console.log('401 error - clearing session and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateDetails: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
  changeRole: (data) => api.put('/auth/change-role', data),
};

// Student API
export const studentAPI = {
  getDashboard: () => api.get('/students/dashboard'),
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  getApplications: () => api.get('/applications/my'),
  submitApplication: (data) => api.post('/applications', data),
  getComplaints: () => api.get('/students/complaints'),
  getFees: () => api.get('/students/fees'),
  getNotifications: () => api.get('/students/notifications'),
  markNotificationRead: (id) => api.put(`/students/notifications/${id}/read`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
};

// Warden API
export const wardenAPI = {
  getDashboard: () => api.get('/warden/dashboard'),
  getHostels: () => api.get('/warden/hostels'),
  getRooms: (params) => api.get('/warden/rooms', { params }),
  getStudents: (params) => api.get('/warden/students', { params }),
  getComplaints: (params) => api.get('/warden/complaints', { params }),
  assignComplaint: (id) => api.put(`/warden/complaints/${id}/assign`),
  resolveComplaint: (id, data) => api.put(`/warden/complaints/${id}/resolve`, data),
  allocateRoom: (roomId, data) => api.put(`/warden/rooms/${roomId}/allocate`, data),
};

// Hostel API
export const hostelAPI = {
  getAll: (params) => api.get('/hostels', { params }),
  getById: (id) => api.get(`/hostels/${id}`),
  create: (data) => api.post('/hostels', data),
  update: (id, data) => api.put(`/hostels/${id}`, data),
  delete: (id) => api.delete(`/hostels/${id}`),
  assignWarden: (id, wardenId) => api.put(`/hostels/${id}/warden`, { wardenId }),
};

// Room API
export const roomAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  allocate: (id, studentId) => api.put(`/rooms/${id}/allocate`, { studentId }),
  vacate: (id, studentId) => api.put(`/rooms/${id}/vacate`, { studentId }),
};

// Application API
export const applicationAPI = {
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  approve: (id, data) => api.put(`/applications/${id}/approve`, data),
  reject: (id, data) => api.put(`/applications/${id}/reject`, data),
  delete: (id) => api.delete(`/applications/${id}`),
};

// Complaint API
export const complaintAPI = {
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  addComment: (id, data) => api.post(`/complaints/${id}/comments`, data),
  delete: (id) => api.delete(`/complaints/${id}`),
};

// Fee API
export const feeAPI = {
  getAll: (params) => api.get('/fees', { params }),
  getById: (id) => api.get(`/fees/${id}`),
  create: (data) => api.post('/fees', data),
  pay: (id, data) => api.put(`/fees/${id}/pay`, data),
  verify: (id) => api.put(`/fees/${id}/verify`),
  delete: (id) => api.delete(`/fees/${id}`),
};

export default api;
