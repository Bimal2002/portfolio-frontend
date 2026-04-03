import React, { useState, useEffect, useMemo } from 'react';
import { habitService } from '../../services/dataService';
import { toast } from 'react-toastify';
import { Modal, ConfirmDialog, EmptyState, LoadingSpinner, FormField, TextArea, SelectField, CheckboxField } from '../../components/ui';
import { 
  FaPlus, FaEdit, FaTrash, FaCheck, FaFire, FaTrophy, FaCalendarCheck,
  FaHeart, FaBrain, FaBook, FaUsers, FaUser, FaEllipsisH, FaPause, FaPlay,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

const CATEGORIES = [
  { value: 'Health', label: 'Health', icon: FaHeart, color: 'bg-red-100 text-red-600' },
  { value: 'Productivity', label: 'Productivity', icon: FaBrain, color: 'bg-blue-100 text-blue-600' },
  { value: 'Learning', label: 'Learning', icon: FaBook, color: 'bg-green-100 text-green-600' },
  { value: 'Social', label: 'Social', icon: FaUsers, color: 'bg-purple-100 text-purple-600' },
  { value: 'Personal', label: 'Personal', icon: FaUser, color: 'bg-yellow-100 text-yellow-600' },
  { value: 'Other', label: 'Other', icon: FaEllipsisH, color: 'bg-gray-100 text-gray-600' }
];

const FREQUENCIES = [
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const getCategoryConfig = (category) => CATEGORIES.find(c => c.value === category) || CATEGORIES[5];

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('today'); // 'today', 'week', 'all'

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Personal',
    frequency: 'Daily',
    targetDays: DAYS,
    targetCount: 1,
    color: '#3B82F6',
    isActive: true
  });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const response = await habitService.getAll();
      setHabits(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  };

  // Filter habits for today
  const todaysHabits = useMemo(() => {
    const today = new Date();
    const dayName = DAYS[today.getDay() === 0 ? 6 : today.getDay() - 1];
    
    return habits.filter(habit => {
      if (!habit.isActive) return false;
      if (habit.frequency === 'Daily') {
        return habit.targetDays?.includes(dayName) || habit.targetDays?.length === 0;
      }
      return true;
    });
  }, [habits]);

  // Check if habit is completed for a specific date
  const isCompletedOnDate = (habit, date) => {
    const dateStr = date.toDateString();
    return habit.completionDates?.some(c => 
      new Date(c.date).toDateString() === dateStr
    );
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalHabits = habits.filter(h => h.isActive).length;
    const completedToday = todaysHabits.filter(h => isCompletedOnDate(h, new Date())).length;
    const totalStreak = habits.reduce((sum, h) => sum + (h.streak?.current || 0), 0);
    const longestStreak = Math.max(...habits.map(h => h.streak?.longest || 0), 0);
    
    return { totalHabits, completedToday, totalStreak, longestStreak, todayTotal: todaysHabits.length };
  }, [habits, todaysHabits]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Personal',
      frequency: 'Daily',
      targetDays: DAYS,
      targetCount: 1,
      color: '#3B82F6',
      isActive: true
    });
    setEditingHabit(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name || '',
      description: habit.description || '',
      category: habit.category || 'Personal',
      frequency: habit.frequency || 'Daily',
      targetDays: habit.targetDays || DAYS,
      targetCount: habit.targetCount || 1,
      color: habit.color || '#3B82F6',
      isActive: habit.isActive !== false
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

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      targetDays: prev.targetDays.includes(day)
        ? prev.targetDays.filter(d => d !== day)
        : [...prev.targetDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Habit name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingHabit) {
        await habitService.update(editingHabit._id, formData);
        toast.success('Habit updated successfully');
      } else {
        await habitService.create(formData);
        toast.success('Habit created successfully');
      }
      closeModal();
      fetchHabits();
    } catch (error) {
      toast.error(editingHabit ? 'Failed to update habit' : 'Failed to create habit');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await habitService.delete(id);
      toast.success('Habit deleted');
      fetchHabits();
    } catch (error) {
      toast.error('Failed to delete habit');
    }
  };

  const toggleComplete = async (habit) => {
    try {
      const isCompleted = isCompletedOnDate(habit, selectedDate);
      
      if (isCompleted) {
        // Remove completion - we need to update the habit
        const updatedCompletions = habit.completionDates.filter(c => 
          new Date(c.date).toDateString() !== selectedDate.toDateString()
        );
        await habitService.update(habit._id, { completionDates: updatedCompletions });
        toast.info('Completion removed');
      } else {
        // Add completion
        await habitService.logCompletion(habit._id, { 
          date: selectedDate.toISOString(),
          count: 1 
        });
        toast.success('Habit completed! 🎉');
      }
      fetchHabits();
    } catch (error) {
      toast.error('Failed to update habit');
    }
  };

  const toggleActive = async (habit) => {
    try {
      await habitService.update(habit._id, { isActive: !habit.isActive });
      toast.success(habit.isActive ? 'Habit paused' : 'Habit resumed');
      fetchHabits();
    } catch (error) {
      toast.error('Failed to update habit');
    }
  };

  // Week navigation
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Habit Tracker</h1>
          <p className="text-gray-600 mt-1">Build better habits, one day at a time</p>
        </div>
        <button onClick={openAddModal} className="btn-primary inline-flex items-center">
          <FaPlus className="mr-2" /> New Habit
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Today's Progress</p>
              <p className="text-2xl font-bold">{stats.completedToday}/{stats.todayTotal}</p>
            </div>
            <FaCalendarCheck className="text-3xl text-blue-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Current Streaks</p>
              <p className="text-2xl font-bold">{stats.totalStreak}</p>
            </div>
            <FaFire className="text-3xl text-orange-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Best Streak</p>
              <p className="text-2xl font-bold">{stats.longestStreak}</p>
            </div>
            <FaTrophy className="text-3xl text-yellow-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Habits</p>
              <p className="text-2xl font-bold">{stats.totalHabits}</p>
            </div>
            <FaCheck className="text-3xl text-green-200" />
          </div>
        </div>
      </div>

      {/* Week View */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 7);
              setSelectedDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaChevronLeft />
          </button>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 7);
              setSelectedDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaChevronRight />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-lg text-center transition-colors ${
                  isSelected 
                    ? 'bg-primary-600 text-white' 
                    : isToday 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'hover:bg-gray-100'
                }`}
              >
                <div className="text-xs font-medium">{DAYS[index].slice(0, 3)}</div>
                <div className="text-lg font-bold">{date.getDate()}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('today')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'today' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
            }`}
          >
            Today's Habits
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'all' ? 'bg-white shadow text-primary-600' : 'text-gray-600'
            }`}
          >
            All Habits
          </button>
        </div>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <EmptyState
          icon={FaCalendarCheck}
          title="No habits yet"
          description="Start building better habits by creating your first one"
          actionLabel="Create Habit"
          onAction={openAddModal}
        />
      ) : (
        <div className="space-y-4">
          {(viewMode === 'today' ? todaysHabits : habits).map((habit) => {
            const categoryConfig = getCategoryConfig(habit.category);
            const isCompleted = isCompletedOnDate(habit, selectedDate);
            
            return (
              <div
                key={habit._id}
                className={`card p-4 border-l-4 ${!habit.isActive ? 'opacity-60' : ''}`}
                style={{ borderLeftColor: habit.color }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleComplete(habit)}
                      disabled={!habit.isActive}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'border-2 border-gray-300 hover:border-green-500'
                      }`}
                      style={isCompleted ? { backgroundColor: habit.color } : {}}
                    >
                      {isCompleted && <FaCheck />}
                    </button>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {habit.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig.color}`}>
                          {habit.category}
                        </span>
                        {!habit.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                            Paused
                          </span>
                        )}
                      </div>
                      {habit.description && (
                        <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center">
                          <FaFire className="mr-1 text-orange-500" />
                          {habit.streak?.current || 0} day streak
                        </span>
                        <span className="flex items-center">
                          <FaTrophy className="mr-1 text-yellow-500" />
                          Best: {habit.streak?.longest || 0}
                        </span>
                        <span>{habit.frequency}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleActive(habit)}
                      className={`p-2 rounded-lg transition-colors ${
                        habit.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={habit.isActive ? 'Pause habit' : 'Resume habit'}
                    >
                      {habit.isActive ? <FaPause /> : <FaPlay />}
                    </button>
                    <button
                      onClick={() => openEditModal(habit)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => setDeleteId(habit._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingHabit ? 'Edit Habit' : 'Create Habit'} size="lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Habit Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Exercise for 30 minutes"
            required
          />

          <TextArea
            label="Description (optional)"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Why is this habit important to you?"
            rows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
            />

            <SelectField
              label="Frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              options={FREQUENCIES}
            />
          </div>

          {formData.frequency === 'Daily' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.targetDays.includes(day)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <CheckboxField
            label="Active (show in daily habits)"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : editingHabit ? 'Update Habit' : 'Create Habit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete Habit?"
        message="Are you sure you want to delete this habit? All tracking data will be lost. This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Habits;
