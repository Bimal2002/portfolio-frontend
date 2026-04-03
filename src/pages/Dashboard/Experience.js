import React, { useState, useEffect } from 'react';
import { experienceService } from '../../services/dataService';
import { toast } from 'react-toastify';
import { 
  FaPlus, FaEdit, FaTrash, FaTimes, FaBriefcase, 
  FaCalendar, FaMapMarkerAlt, FaEye, FaEyeSlash, FaBuilding,
  FaLaptopHouse
} from 'react-icons/fa';

const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
  const locationTypes = ['On-site', 'Remote', 'Hybrid'];

  const [formData, setFormData] = useState({
    company: '',
    position: '',
    employmentType: 'Full-time',
    location: '',
    locationType: 'On-site',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    responsibilities: '',
    achievements: '',
    technologies: '',
    isVisible: true
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const response = await experienceService.getAll();
      setExperiences(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch experiences');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      employmentType: 'Full-time',
      location: '',
      locationType: 'On-site',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      responsibilities: '',
      achievements: '',
      technologies: '',
      isVisible: true
    });
    setEditingExperience(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (exp) => {
    setEditingExperience(exp);
    setFormData({
      company: exp.company || '',
      position: exp.position || '',
      employmentType: exp.employmentType || 'Full-time',
      location: exp.location || '',
      locationType: exp.locationType || 'On-site',
      startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
      endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
      isCurrent: exp.isCurrent || false,
      description: exp.description || '',
      responsibilities: exp.responsibilities?.join('\n') || '',
      achievements: exp.achievements?.join('\n') || '',
      technologies: exp.technologies?.join(', ') || '',
      isVisible: exp.isVisible !== false
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
    
    if (!formData.company.trim() || !formData.position.trim()) {
      toast.error('Company and position are required');
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        ...formData,
        responsibilities: formData.responsibilities
          .split('\n')
          .map(r => r.trim())
          .filter(r => r.length > 0),
        achievements: formData.achievements
          .split('\n')
          .map(a => a.trim())
          .filter(a => a.length > 0),
        technologies: formData.technologies
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0)
      };

      if (editingExperience) {
        await experienceService.update(editingExperience._id, submitData);
        toast.success('Experience updated successfully');
      } else {
        await experienceService.create(submitData);
        toast.success('Experience added successfully');
      }
      
      closeModal();
      fetchExperiences();
    } catch (error) {
      toast.error(editingExperience ? 'Failed to update experience' : 'Failed to add experience');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await experienceService.delete(id);
      toast.success('Experience deleted successfully');
      setDeleteConfirm(null);
      fetchExperiences();
    } catch (error) {
      toast.error('Failed to delete experience');
    }
  };

  const toggleVisibility = async (exp) => {
    try {
      await experienceService.update(exp._id, { isVisible: !exp.isVisible });
      toast.success(`Experience ${exp.isVisible ? 'hidden' : 'shown'} on portfolio`);
      fetchExperiences();
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getLocationIcon = (type) => {
    switch (type) {
      case 'Remote': return <FaLaptopHouse className="mr-1" />;
      case 'Hybrid': return <FaBuilding className="mr-1" />;
      default: return <FaMapMarkerAlt className="mr-1" />;
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Experience</h1>
          <p className="text-gray-600 mt-1">Manage your professional experience</p>
        </div>
        <button onClick={openAddModal} className="btn-primary inline-flex items-center">
          <FaPlus className="mr-2" /> Add Experience
        </button>
      </div>

      {/* Experience List */}
      {experiences.length === 0 ? (
        <div className="card text-center py-12">
          <FaBriefcase className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No experience records yet</h3>
          <p className="text-gray-500 mb-4">Add your work experience</p>
          <button onClick={openAddModal} className="btn-primary inline-flex items-center">
            <FaPlus className="mr-2" /> Add Experience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div 
              key={exp._id} 
              className={`card ${!exp.isVisible ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaBriefcase className="text-xl text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {exp.employmentType}
                      </span>
                      {!exp.isVisible && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs inline-flex items-center">
                          <FaEyeSlash className="mr-1" /> Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                      <span className="inline-flex items-center">
                        <FaCalendar className="mr-1" />
                        {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                      </span>
                      {exp.location && (
                        <span className="inline-flex items-center">
                          {getLocationIcon(exp.locationType)}
                          {exp.location} ({exp.locationType})
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-gray-600 mt-2 text-sm">{exp.description}</p>
                    )}
                    {exp.responsibilities && exp.responsibilities.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Responsibilities:</p>
                        <ul className="space-y-1">
                          {exp.responsibilities.slice(0, 3).map((resp, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {resp}
                            </li>
                          ))}
                          {exp.responsibilities.length > 3 && (
                            <li className="text-sm text-gray-500 italic">
                              +{exp.responsibilities.length - 3} more...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {exp.technologies.slice(0, 5).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                        {exp.technologies.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                            +{exp.technologies.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleVisibility(exp)}
                    className={`p-2 rounded-lg transition-colors ${
                      exp.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {exp.isVisible ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <button
                    onClick={() => openEditModal(exp)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(exp._id)}
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
                {editingExperience ? 'Edit Experience' : 'Add Experience'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 p-2">
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Company name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Job title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {employmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Type
                  </label>
                  <select
                    name="locationType"
                    value={formData.locationType}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {locationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
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

                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer mt-6">
                    <input
                      type="checkbox"
                      name="isCurrent"
                      checked={formData.isCurrent}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">I currently work here</span>
                  </label>
                </div>
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
                  placeholder="Brief description of your role"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Responsibilities (one per line)
                </label>
                <textarea
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Led development team&#10;Designed system architecture&#10;Conducted code reviews"
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
                  placeholder="Increased performance by 40%&#10;Launched new product feature&#10;Reduced costs by $100K"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technologies Used (comma separated)
                </label>
                <input
                  type="text"
                  name="technologies"
                  value={formData.technologies}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="React, Node.js, AWS, PostgreSQL"
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
                  {saving ? 'Saving...' : editingExperience ? 'Update' : 'Add Experience'}
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Experience?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this experience? This action cannot be undone.
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

export default Experience;
