import React, { useState, useEffect } from 'react';
import { educationService } from '../../services/dataService';
import { toast } from 'react-toastify';
import { 
  FaPlus, FaEdit, FaTrash, FaTimes, FaGraduationCap, 
  FaCalendar, FaMapMarkerAlt, FaEye, FaEyeSlash, FaTrophy
} from 'react-icons/fa';

const Education = () => {
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    grade: '',
    description: '',
    location: '',
    achievements: '',
    isVisible: true
  });

  useEffect(() => {
    fetchEducations();
  }, []);

  const fetchEducations = async () => {
    try {
      setLoading(true);
      const response = await educationService.getAll();
      setEducations(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch education records');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      grade: '',
      description: '',
      location: '',
      achievements: '',
      isVisible: true
    });
    setEditingEducation(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (edu) => {
    setEditingEducation(edu);
    setFormData({
      institution: edu.institution || '',
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
      endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
      isCurrent: edu.isCurrent || false,
      grade: edu.grade || '',
      description: edu.description || '',
      location: edu.location || '',
      achievements: edu.achievements?.join('\n') || '',
      isVisible: edu.isVisible !== false
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.institution.trim() || !formData.degree.trim()) {
      toast.error('Institution and degree are required');
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        ...formData,
        achievements: formData.achievements
          .split('\n')
          .map(a => a.trim())
          .filter(a => a.length > 0)
      };

      if (editingEducation) {
        await educationService.update(editingEducation._id, submitData);
        toast.success('Education updated successfully');
      } else {
        await educationService.create(submitData);
        toast.success('Education added successfully');
      }
      
      closeModal();
      fetchEducations();
    } catch (error) {
      toast.error(editingEducation ? 'Failed to update education' : 'Failed to add education');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await educationService.delete(id);
      toast.success('Education deleted successfully');
      setDeleteConfirm(null);
      fetchEducations();
    } catch (error) {
      toast.error('Failed to delete education');
    }
  };

  const toggleVisibility = async (edu) => {
    try {
      await educationService.update(edu._id, { isVisible: !edu.isVisible });
      toast.success(`Education ${edu.isVisible ? 'hidden' : 'shown'} on portfolio`);
      fetchEducations();
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Education</h1>
          <p className="text-gray-600 mt-1">Manage your educational background</p>
        </div>
        <button onClick={openAddModal} className="btn-primary inline-flex items-center">
          <FaPlus className="mr-2" /> Add Education
        </button>
      </div>

      {/* Education List */}
      {educations.length === 0 ? (
        <div className="card text-center py-12">
          <FaGraduationCap className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No education records yet</h3>
          <p className="text-gray-500 mb-4">Add your educational background</p>
          <button onClick={openAddModal} className="btn-primary inline-flex items-center">
            <FaPlus className="mr-2" /> Add Education
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {educations.map((edu) => (
            <div 
              key={edu._id} 
              className={`card ${!edu.isVisible ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaGraduationCap className="text-xl text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                      {!edu.isVisible && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs inline-flex items-center">
                          <FaEyeSlash className="mr-1" /> Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-primary-600 font-medium">{edu.institution}</p>
                    {edu.fieldOfStudy && (
                      <p className="text-gray-600 text-sm">{edu.fieldOfStudy}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                      <span className="inline-flex items-center">
                        <FaCalendar className="mr-1" />
                        {formatDate(edu.startDate)} - {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}
                      </span>
                      {edu.location && (
                        <span className="inline-flex items-center">
                          <FaMapMarkerAlt className="mr-1" /> {edu.location}
                        </span>
                      )}
                      {edu.grade && (
                        <span className="inline-flex items-center">
                          <FaTrophy className="mr-1" /> {edu.grade}
                        </span>
                      )}
                    </div>
                    {edu.description && (
                      <p className="text-gray-600 mt-2 text-sm">{edu.description}</p>
                    )}
                    {edu.achievements && edu.achievements.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {edu.achievements.map((achievement, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="text-primary-500 mr-2">•</span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleVisibility(edu)}
                    className={`p-2 rounded-lg transition-colors ${
                      edu.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={edu.isVisible ? 'Hide' : 'Show'}
                  >
                    {edu.isVisible ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <button
                    onClick={() => openEditModal(edu)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(edu._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEducation ? 'Edit Education' : 'Add Education'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 p-2">
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="University/College name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., Bachelor of Science"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    name="fieldOfStudy"
                    value={formData.fieldOfStudy}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="input-field"
                    disabled={formData.isCurrent}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade/GPA
                  </label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., 3.8/4.0 or First Class"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isCurrent"
                    checked={formData.isCurrent}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">I am currently studying here</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="input-field"
                  placeholder="Brief description of your studies"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Achievements (one per line)
                </label>
                <textarea
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Dean's List&#10;Academic Scholarship&#10;Research Publication"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isVisible"
                    checked={formData.isVisible}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Visible on Portfolio</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                  {saving ? 'Saving...' : editingEducation ? 'Update' : 'Add Education'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Education?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this education record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Education;
