import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Auto-attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('samarthya_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    demoLogin: () => api.post('/auth/demo'),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Chat
export const chatAPI = {
    sendMessage: (data) => api.post('/chat/message', data),
    getConversations: () => api.get('/chat/conversations'),
    getConversation: (id) => api.get(`/chat/conversations/${id}`),
    deleteConversation: (id) => api.delete(`/chat/conversations/${id}`),
    togglePin: (id) => api.patch(`/chat/conversations/${id}/pin`),
};

// Audit
export const auditAPI = {
    getLogs: (params) => api.get('/audit/logs', { params }),
    getStats: () => api.get('/audit/stats'),
    rollback: (id) => api.post(`/audit/rollback/${id}`),
};

// Tools
export const toolsAPI = {
    getAll: () => api.get('/tools'),
    getPacks: () => api.get('/tools/packs'),
    getPackTools: (packId) => api.get(`/tools/packs/${packId}`),
};

// Screen Understanding (Gemini Vision)
export const screenAPI = {
    analyze: (image, prompt) => api.post('/screen/analyze', { image, prompt }),
    getSupported: () => api.get('/screen/supported'),
};

// File Management (My Stuff)
export const filesAPI = {
    list: (path) => api.get('/files/list', { params: { path } }),
    read: (path) => api.get('/files/read', { params: { path } }),
    download: (filePath) => `${API_URL}/files/download?path=${encodeURIComponent(filePath)}&token=${localStorage.getItem('samarthya_token')}`,
    mkdir: (name, parentPath) => api.post('/files/mkdir', { name, parentPath }),
    upload: (filename, content, parentPath) => api.post('/files/upload', { filename, content, parentPath }),
    deleteFile: (path) => api.delete('/files/delete', { params: { path } }),
    getStats: () => api.get('/files/stats'),
};

// Platform (Control Center)
export const platformAPI = {
    getStatus: () => api.get('/platform/status'),
    getJobs: () => api.get('/platform/jobs'),
    emergencyStop: () => api.post('/platform/emergency-stop'),
};

export default api;
