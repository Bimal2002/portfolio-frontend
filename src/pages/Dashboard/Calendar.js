import React, { useEffect, useState } from 'react';
import { FaGoogle, FaCalendarAlt, FaLink, FaUnlink, FaSync } from 'react-icons/fa';
import { calendarService } from '../../services/calendarService';
import { toast } from 'react-toastify';

const Calendar = () => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      setLoading(true);
      const response = await calendarService.getSyncStatus();
      setSyncStatus(response.data);

      if (response.data.connected) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
      toast.error('Failed to load calendar status');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await calendarService.getEvents();
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load calendar events');
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const response = await calendarService.getAuthUrl();
      
      if (response.success && response.authUrl) {
        window.location.href = response.authUrl;
      }
    } catch (error) {
      console.error('Error getting auth URL:', error);
      toast.error('Failed to connect to Google Calendar');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (window.confirm('Are you sure you want to disconnect Google Calendar?')) {
        await calendarService.disconnect();
        setSyncStatus({ connected: false, isActive: false });
        setEvents([]);
        toast.success('Calendar disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      toast.error('Failed to disconnect calendar');
    }
  };

  const handleSyncMeetings = async () => {
    try {
      setSyncing(true);
      const response = await calendarService.syncMeetings();
      toast.success(`✓ Synced ${response.data.synced} meetings to Google Calendar`);
      if (response.data.errors.length > 0) {
        toast.warning(`${response.data.errors.length} meetings failed to sync`);
      }
    } catch (error) {
      console.error('Error syncing meetings:', error);
      toast.error('Failed to sync meetings to calendar');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendar Sync</h1>
        <p className="text-gray-600 mt-2">Connect and manage your Google Calendar</p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Google Calendar</h2>
            <p className="text-gray-600 mt-1">
              {syncStatus?.connected ? (
                <span className="text-green-600 font-medium">✓ Connected</span>
              ) : (
                <span className="text-gray-500">Not connected</span>
              )}
            </p>
            {syncStatus?.connected && syncStatus?.syncedAt && (
              <p className="text-sm text-gray-500 mt-2">
                Last synced: {new Date(syncStatus.syncedAt).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {syncStatus?.connected && (
              <button
                onClick={handleSyncMeetings}
                disabled={syncing}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                <FaSync className={syncing ? 'animate-spin' : ''} />
                <span>{syncing ? 'Syncing...' : 'Sync Meetings'}</span>
              </button>
            )}
            {syncStatus?.connected ? (
              <button
                onClick={handleDisconnect}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                <FaUnlink />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                <FaGoogle />
                <span>{connecting ? 'Connecting...' : 'Connect'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <FaCalendarAlt className="text-blue-600 text-2xl mt-1 mr-4" />
            <div>
              <h3 className="font-bold text-gray-900">View Events</h3>
              <p className="text-sm text-gray-600 mt-2">
                See all your upcoming calendar events in one place
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <FaLink className="text-green-600 text-2xl mt-1 mr-4" />
            <div>
              <h3 className="font-bold text-gray-900">Auto Sync</h3>
              <p className="text-sm text-gray-600 mt-2">
                Automatically sync events from your Google Calendar
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-start">
            <FaSync className="text-purple-600 text-2xl mt-1 mr-4" />
            <div>
              <h3 className="font-bold text-gray-900">Create Events</h3>
              <p className="text-sm text-gray-600 mt-2">
                Create new events directly from your dashboard
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start">
            <FaCalendarAlt className="text-orange-600 text-2xl mt-1 mr-4" />
            <div>
              <h3 className="font-bold text-gray-900">Check Availability</h3>
              <p className="text-sm text-gray-600 mt-2">
                Show your free/busy times to visitors
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      {syncStatus?.connected && events.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {events.slice(0, 10).map((event, idx) => (
              <div key={idx} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <FaCalendarAlt className="text-primary-600 mr-3 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{event.summary}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(event.start.dateTime || event.start.date).toLocaleString()}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-2">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!syncStatus?.connected && (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <FaGoogle className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Connect your Google Calendar to get started</p>
          <p className="text-gray-500 text-sm mt-2">
            Sync your events, show availability, and manage scheduling
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            {connecting ? 'Connecting...' : 'Connect to Google Calendar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Calendar;
