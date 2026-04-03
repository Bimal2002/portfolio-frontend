import api from './api';

export const calendarService = {
  // Get auth URL for Google Calendar
  getAuthUrl: async () => {
    const response = await api.get('/calendar/auth-url');
    return response.data;
  },

  // Get sync status
  getSyncStatus: async () => {
    const response = await api.get('/calendar/sync-status');
    return response.data;
  },

  // Get calendar events
  getEvents: async (timeMin) => {
    const response = await api.get('/calendar/events', {
      params: { timeMin }
    });
    return response.data;
  },

  // Create calendar event
  createEvent: async (event) => {
    const response = await api.post('/calendar/events', event);
    return response.data;
  },

  // Update calendar event
  updateEvent: async (eventId, eventData) => {
    const response = await api.put(`/calendar/events/${eventId}`, eventData);
    return response.data;
  },

  // Delete calendar event
  deleteEvent: async (eventId) => {
    const response = await api.delete(`/calendar/events/${eventId}`);
    return response.data;
  },

  // Get free/busy times
  getFreeBusyTimes: async (timeMin, timeMax) => {
    const response = await api.get('/calendar/free-busy', {
      params: { timeMin, timeMax }
    });
    return response.data;
  },

  // Sync meetings to calendar
  syncMeetings: async () => {
    const response = await api.post('/calendar/sync-meetings');
    return response.data;
  },

  // Disconnect calendar
  disconnect: async () => {
    const response = await api.delete('/calendar/disconnect');
    return response.data;
  }
};
