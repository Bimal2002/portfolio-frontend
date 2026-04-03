import api from './api';

// Generic service factory
const createService = (endpoint) => ({
  getAll: async (params = {}) => {
    const response = await api.get(endpoint, { params });
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`${endpoint}/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post(endpoint, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`${endpoint}/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`${endpoint}/${id}`);
    return response.data;
  },
});

// Portfolio service
export const portfolioService = {
  getByUsername: async (username) => {
    const response = await api.get(`/portfolio/${username}`);
    return response.data;
  },
  getMy: async () => {
    const response = await api.get('/portfolio/me');
    return response.data;
  },
  update: async (data) => {
    const response = await api.put('/portfolio', data);
    return response.data;
  },
};

// Project service
export const projectService = {
  ...createService('/projects'),
  getMy: async () => {
    const response = await api.get('/projects/my');
    return response.data;
  },
  getByUser: async (userId) => {
    const response = await api.get(`/projects/user/${userId}`);
    return response.data;
  },
};

// Education service
export const educationService = createService('/education');

educationService.getByUser = async (userId) => {
  const response = await api.get(`/education/user/${userId}`);
  return response.data;
};

// Experience service
export const experienceService = createService('/experience');

experienceService.getByUser = async (userId) => {
  const response = await api.get(`/experience/user/${userId}`);
  return response.data;
};

// Skill service
export const skillService = {
  ...createService('/skills'),
  getByUser: async (userId) => {
    const response = await api.get(`/skills/user/${userId}`);
    return response.data;
  },
  getGrouped: async () => {
    const response = await api.get('/skills/grouped');
    return response.data;
  },
};

// Social link service
export const socialService = {
  ...createService('/social'),
  getByUser: async (userId) => {
    const response = await api.get(`/social/user/${userId}`);
    return response.data;
  },
};

// Message service
export const messageService = {
  ...createService('/messages'),
  sendMessage: async (userId, data) => {
    const response = await api.post(`/messages/user/${userId}`, data);
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread/count');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/messages/stats');
    return response.data;
  },
  addReply: async (messageId, data) => {
    const response = await api.post(`/messages/${messageId}/reply`, data);
    return response.data;
  },
  getByToken: async (token) => {
    const response = await api.get(`/messages/thread/${token}`);
    return response.data;
  },
  replyByToken: async (token, data) => {
    const response = await api.post(`/messages/reply/${token}`, data);
    return response.data;
  },
};

// Meeting service
export const meetingService = {
  ...createService('/meetings'),
  getUpcoming: async () => {
    const response = await api.get('/meetings/upcoming');
    return response.data;
  },
  getByRange: async (startDate, endDate) => {
    const response = await api.get('/meetings/range', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

// Habit service
export const habitService = {
  ...createService('/habits'),
  logCompletion: async (id, data) => {
    const response = await api.post(`/habits/${id}/complete`, data);
    return response.data;
  },
  getStats: async (id) => {
    const response = await api.get(`/habits/${id}/stats`);
    return response.data;
  },
};

// User service
export const userService = {
  getByUsername: async (username) => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  },
  checkUsername: async (username) => {
    const response = await api.get(`/users/check/${username}`);
    return response.data;
  },
};

// Analytics service
export const analyticsService = {
  logVisit: async ({ username, ownerId }) => {
    const response = await api.post('/analytics/visit', { username, ownerId });
    return response.data;
  },
  getSummary: async () => {
    const response = await api.get('/analytics/summary');
    return response.data;
  },
  getDetails: async () => {
    const response = await api.get('/analytics/details');
    return response.data;
  },
};

// Newsletter service
export const newsletterService = {
  subscribe: async (ownerId, email) => {
    const response = await api.post('/newsletter/subscribe', { ownerId, email });
    return response.data;
  },
  listSubscribers: async () => {
    const response = await api.get('/newsletter/subscribers');
    return response.data;
  },
};
