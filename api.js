import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  signin: (data) => api.post('/auth/signin', data),
  me: () => api.get('/auth/me')
};

export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getStats: () => api.get('/users/stats'),
  deleteUser: (id) => api.delete(`/users/${id}`)
};

export const assignmentAPI = {
  create: (data) => api.post('/assignments', data),
  getAll: () => api.get('/assignments'),
  getOne: (id) => api.get(`/assignments/${id}`),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`)
};

export const submissionAPI = {
  create: (formData) => api.post('/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStudentSubmissions: () => api.get('/submissions/student'),
  getAssignmentSubmissions: (id) => api.get(`/submissions/assignment/${id}`),
  getOne: (id) => api.get(`/submissions/${id}`),
  grade: (id, data) => api.put(`/submissions/${id}/grade`, data),
  getProfessorStats: () => api.get('/submissions/stats/professor')
};

export const aiAPI = {
  plagiarismCheck: (data) => api.post('/ai/plagiarism-check', data),
  grammarCheck: (data) => api.post('/ai/grammar-check', data),
  summarize: (data) => api.post('/ai/summarize', data),
  suggestions: (data) => api.post('/ai/suggestions', data),
  grade: (data) => api.post('/ai/grade', data)
};

export default api;