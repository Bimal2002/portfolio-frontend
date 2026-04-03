import React, { useState, useEffect, useMemo } from 'react';
import { meetingService } from '../../services/dataService';
import { toast } from 'react-toastify';
import { Modal, ConfirmDialog, EmptyState, LoadingSpinner, FormField, TextArea, SelectField, CheckboxField, DateTimeField } from '../../components/ui';
import { 
  FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaClock, FaMapMarkerAlt,
  FaVideo, FaPhone, FaUsers, FaCheck, FaTimes, FaRedo, FaLink,
  FaChevronLeft, FaChevronRight, FaBell
} from 'react-icons/fa';

const MEETING_TYPES = [
  { value: 'Video Call', label: 'Video Call', icon: FaVideo, color: 'text-blue-600 bg-blue-100' },
  { value: 'Phone Call', label: 'Phone Call', icon: FaPhone, color: 'text-green-600 bg-green-100' },
  { value: 'In-person', label: 'In-person', icon: FaUsers, color: 'text-purple-600 bg-purple-100' },
  { value: 'Other', label: 'Other', icon: FaCalendarAlt, color: 'text-gray-600 bg-gray-100' }
];

const MEETING_STATUS = [
  { value: 'Scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  { value: 'Completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  { value: 'Rescheduled', label: 'Rescheduled', color: 'bg-yellow-100 text-yellow-700' }
];

const getMeetingTypeConfig = (type) => MEETING_TYPES.find(t => t.value === type) || MEETING_TYPES[3];
const getStatusConfig = (status) => MEETING_STATUS.find(s => s.value === status) || MEETING_STATUS[0];

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
};

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar'
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingType: 'Video Call',
    location: '',
    meetingLink: '',
    startTime: '',
    endTime: '',
    status: 'Scheduled',
    notes: '',
    attendees: '',
    reminderEnabled: true,
    reminderMinutes: 15
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await meetingService.getAll();
      setMeetings(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = useMemo(() => {
    let filtered = [...meetings];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => m.status === filterStatus);
    }
    
    // Sort by start time
    filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    return filtered;
  }, [meetings, filterStatus]);

  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    return meetings
      .filter(m => new Date(m.startTime) > now && m.status === 'Scheduled')
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 5);
  }, [meetings]);

  const resetForm = () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    setFormData({
      title: '',
      description: '',
      meetingType: 'Video Call',
      location: '',
      meetingLink: '',
      startTime: formatDateForInput(startTime),
      endTime: formatDateForInput(endTime),
      status: 'Scheduled',
      notes: '',
      attendees: '',
      reminderEnabled: true,
      reminderMinutes: 15
    });
    setEditingMeeting(null);
  };

  const openAddModal = (date = null) => {
    resetForm();
    if (date) {
      const startTime = new Date(date);
      startTime.setHours(9, 0, 0, 0);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        startTime: formatDateForInput(startTime),
        endTime: formatDateForInput(endTime)
      }));
    }
    setShowModal(true);
  };

  const openEditModal = (meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title || '',
      description: meeting.description || '',
      meetingType: meeting.meetingType || 'Video Call',
      location: meeting.location || '',
      meetingLink: meeting.meetingLink || '',
      startTime: formatDateForInput(meeting.startTime),
      endTime: formatDateForInput(meeting.endTime),
      status: meeting.status || 'Scheduled',
      notes: meeting.notes || '',
      attendees: meeting.attendees?.map(a => `${a.name}${a.email ? ` <${a.email}>` : ''}`).join(', ') || '',
      reminderEnabled: meeting.reminder?.enabled !== false,
      reminderMinutes: meeting.reminder?.minutesBefore || 15
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const parseAttendees = (attendeesStr) => {
    if (!attendeesStr.trim()) return [];
    return attendeesStr.split(',').map(a => {
      const match = a.trim().match(/(.+?)\s*(?:<(.+?)>)?$/);
      if (match) {
        return {
          name: match[1].trim(),
          email: match[2]?.trim() || ''
        };
      }
      return { name: a.trim(), email: '' };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Meeting title is required');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error('Start and end time are required');
      return;
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      toast.error('End time must be after start time');
      return;
    }

    const meetingData = {
      title: formData.title,
      description: formData.description,
      meetingType: formData.meetingType,
      location: formData.location,
      meetingLink: formData.meetingLink,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      status: formData.status,
      notes: formData.notes,
      attendees: parseAttendees(formData.attendees),
      reminder: {
        enabled: formData.reminderEnabled,
        minutesBefore: formData.reminderMinutes
      }
    };

    setSaving(true);
    try {
      if (editingMeeting) {
        await meetingService.update(editingMeeting._id, meetingData);
        toast.success('Meeting updated successfully');
      } else {
        await meetingService.create(meetingData);
        toast.success('Meeting scheduled successfully');
      }
      closeModal();
      fetchMeetings();
    } catch (error) {
      toast.error(editingMeeting ? 'Failed to update meeting' : 'Failed to schedule meeting');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await meetingService.delete(id);
      toast.success('Meeting deleted');
      fetchMeetings();
    } catch (error) {
      toast.error('Failed to delete meeting');
    }
  };

  const updateStatus = async (meeting, newStatus) => {
    try {
      await meetingService.update(meeting._id, { status: newStatus });
      toast.success(`Meeting marked as ${newStatus.toLowerCase()}`);
      fetchMeetings();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month, 0);
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const getMeetingsForDate = (date) => {
    return meetings.filter(m => {
      const meetingDate = new Date(m.startTime);
      return meetingDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600 mt-1">Schedule and manage your meetings</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
              }`}
            >
              Calendar
            </button>
          </div>
          <button onClick={() => openAddModal()} className="btn-primary inline-flex items-center">
            <FaPlus className="mr-2" /> Schedule Meeting
          </button>
        </div>
      </div>

      {/* Upcoming Meetings Banner */}
      {upcomingMeetings.length > 0 && (
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <FaClock className="mr-2 text-primary-600" /> Upcoming Meetings
          </h3>
          <div className="flex overflow-x-auto space-x-4 pb-2">
            {upcomingMeetings.map(meeting => {
              const typeConfig = getMeetingTypeConfig(meeting.meetingType);
              const Icon = typeConfig.icon;
              return (
                <div
                  key={meeting._id}
                  onClick={() => openEditModal(meeting)}
                  className="flex-shrink-0 bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow min-w-[200px]"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${typeConfig.color}`}>
                      <Icon className="text-sm" />
                    </div>
                    <span className="font-medium text-gray-900 truncate">{meeting.title}</span>
                  </div>
                  <p className="text-sm text-gray-600">{formatDateTime(meeting.startTime)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {meetings.length === 0 ? (
        <EmptyState
          icon={FaCalendarAlt}
          title="No meetings scheduled"
          description="Schedule your first meeting to keep track of your appointments"
          actionLabel="Schedule Meeting"
          onAction={() => openAddModal()}
        />
      ) : viewMode === 'list' ? (
        <>
          {/* Filter */}
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-sm text-gray-600">Filter:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({meetings.length})
              </button>
              {MEETING_STATUS.map(status => {
                const count = meetings.filter(m => m.status === status.value).length;
                if (count === 0) return null;
                return (
                  <button
                    key={status.value}
                    onClick={() => setFilterStatus(status.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filterStatus === status.value ? status.color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meeting List */}
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => {
              const typeConfig = getMeetingTypeConfig(meeting.meetingType);
              const statusConfig = getStatusConfig(meeting.status);
              const Icon = typeConfig.icon;
              const isPast = new Date(meeting.endTime) < new Date();
              
              return (
                <div
                  key={meeting._id}
                  className={`card p-4 ${isPast && meeting.status === 'Scheduled' ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${typeConfig.color}`}>
                        <Icon className="text-xl" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {meeting.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <FaCalendarAlt className="mr-1" />
                            {formatDateTime(meeting.startTime)}
                          </span>
                          <span className="flex items-center">
                            <FaClock className="mr-1" />
                            {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                          </span>
                        </div>
                        {meeting.location && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center">
                            <FaMapMarkerAlt className="mr-1" /> {meeting.location}
                          </p>
                        )}
                        {meeting.meetingLink && (
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-700 mt-1 flex items-center"
                          >
                            <FaLink className="mr-1" /> Join Meeting
                          </a>
                        )}
                        {meeting.attendees?.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center">
                            <FaUsers className="mr-1" /> 
                            {meeting.attendees.map(a => a.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {meeting.status === 'Scheduled' && (
                        <>
                          <button
                            onClick={() => updateStatus(meeting, 'Completed')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as Completed"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => updateStatus(meeting, 'Cancelled')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Meeting"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      {meeting.status === 'Cancelled' && (
                        <button
                          onClick={() => updateStatus(meeting, 'Rescheduled')}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Reschedule"
                        >
                          <FaRedo />
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(meeting)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setDeleteId(meeting._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  {meeting.description && (
                    <p className="text-gray-600 mt-3 pl-16">{meeting.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Calendar View */
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
            
            {getDaysInMonth(currentMonth).map((day, index) => {
              const dayMeetings = getMeetingsForDate(day.date);
              return (
                <div
                  key={index}
                  onClick={() => openAddModal(day.date)}
                  className={`min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isToday(day.date) ? 'border-primary-500 border-2' : 'border-gray-200'}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${isToday(day.date) ? 'text-primary-600' : ''}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayMeetings.slice(0, 2).map(meeting => {
                      const typeConfig = getMeetingTypeConfig(meeting.meetingType);
                      return (
                        <div
                          key={meeting._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(meeting);
                          }}
                          className={`text-xs p-1 rounded truncate ${typeConfig.color}`}
                        >
                          {formatTime(meeting.startTime)} {meeting.title}
                        </div>
                      );
                    })}
                    {dayMeetings.length > 2 && (
                      <div className="text-xs text-gray-500 pl-1">
                        +{dayMeetings.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={closeModal} 
        title={editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Meeting Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Project Discussion"
            required
          />

          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Meeting agenda or description"
            rows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Meeting Type"
              name="meetingType"
              value={formData.meetingType}
              onChange={handleChange}
              options={MEETING_TYPES.map(t => ({ value: t.value, label: t.label }))}
            />

            <SelectField
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={MEETING_STATUS.map(s => ({ value: s.value, label: s.label }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DateTimeField
              label="Start Time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />

            <DateTimeField
              label="End Time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              min={formData.startTime}
            />
          </div>

          {formData.meetingType === 'In-person' ? (
            <FormField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Meeting location or address"
              icon={FaMapMarkerAlt}
            />
          ) : (
            <FormField
              label="Meeting Link"
              name="meetingLink"
              value={formData.meetingLink}
              onChange={handleChange}
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              icon={FaLink}
            />
          )}

          <FormField
            label="Attendees"
            name="attendees"
            value={formData.attendees}
            onChange={handleChange}
            placeholder="John Doe <john@example.com>, Jane Smith"
            icon={FaUsers}
          />
          <p className="text-xs text-gray-500 -mt-2">Separate multiple attendees with commas. Email is optional.</p>

          <TextArea
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional notes or meeting minutes"
            rows={2}
          />

          <div className="flex items-center space-x-4 pt-2">
            <CheckboxField
              label="Enable Reminder"
              name="reminderEnabled"
              checked={formData.reminderEnabled}
              onChange={handleChange}
            />
            {formData.reminderEnabled && (
              <SelectField
                name="reminderMinutes"
                value={formData.reminderMinutes}
                onChange={handleChange}
                options={[
                  { value: 5, label: '5 minutes before' },
                  { value: 15, label: '15 minutes before' },
                  { value: 30, label: '30 minutes before' },
                  { value: 60, label: '1 hour before' },
                  { value: 1440, label: '1 day before' }
                ]}
                className="w-48"
              />
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete Meeting?"
        message="Are you sure you want to delete this meeting? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Meetings;
