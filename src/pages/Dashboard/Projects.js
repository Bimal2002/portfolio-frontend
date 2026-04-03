import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/dataService';
import { toast } from 'react-toastify';
import { 
  FaPlus, FaEdit, FaTrash, FaGithub, FaExternalLinkAlt, 
  FaTimes, FaStar, FaEye, FaEyeSlash,
  FaCalendar, FaCode, FaFilePdf, FaImages
} from 'react-icons/fa';
import FileUpload from '../../components/FileUpload';
import MultiFileUpload from '../../components/MultiFileUpload';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    technologies: '',
    thumbnail: '',
    images: [],
    documents: [],
    demoUrl: '',
    githubUrl: '',
    startDate: '',
    endDate: '',
    isOngoing: false,
    featured: false,
    isVisible: true
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getMy();
      setProjects(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch projects');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      longDescription: '',
      technologies: '',
      thumbnail: '',
      images: [],
      documents: [],
      demoUrl: '',
      githubUrl: '',
      startDate: '',
      endDate: '',
      isOngoing: false,
      featured: false,
      isVisible: true
    });
    setEditingProject(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      longDescription: project.longDescription || '',
      technologies: project.technologies?.join(', ') || '',
      thumbnail: project.thumbnail || '',
      images: project.images || [],
      documents: project.documents || [],
      demoUrl: project.demoUrl || '',
      githubUrl: project.githubUrl || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      isOngoing: project.isOngoing || false,
      featured: project.featured || false,
      isVisible: project.isVisible !== false
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
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        ...formData,
        technologies: formData.technologies
          .split(',')
          .map(tech => tech.trim())
          .filter(tech => tech.length > 0)
      };

      if (editingProject) {
        await projectService.update(editingProject._id, submitData);
        toast.success('Project updated successfully');
      } else {
        await projectService.create(submitData);
        toast.success('Project added successfully');
      }
      
      closeModal();
      fetchProjects();
    } catch (error) {
      toast.error(editingProject ? 'Failed to update project' : 'Failed to add project');
      console.error('Error saving project:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await projectService.delete(id);
      toast.success('Project deleted successfully');
      setDeleteConfirm(null);
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
      console.error('Error deleting project:', error);
    }
  };

  const toggleVisibility = async (project) => {
    try {
      await projectService.update(project._id, { isVisible: !project.isVisible });
      toast.success(`Project ${project.isVisible ? 'hidden' : 'shown'} on portfolio`);
      fetchProjects();
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  const toggleFeatured = async (project) => {
    try {
      await projectService.update(project._id, { featured: !project.featured });
      toast.success(`Project ${project.featured ? 'unfeatured' : 'featured'}`);
      fetchProjects();
    } catch (error) {
      toast.error('Failed to update featured status');
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
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your portfolio projects</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary inline-flex items-center"
        >
          <FaPlus className="mr-2" />
          Add Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="card text-center py-12">
          <FaCode className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">Add your first project to showcase your work</p>
          <button onClick={openAddModal} className="btn-primary inline-flex items-center">
            <FaPlus className="mr-2" />
            Add Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project._id} 
              className={`card relative group ${!project.isVisible ? 'opacity-60' : ''}`}
            >
              {/* Status Badges */}
              <div className="absolute top-4 right-4 flex space-x-2">
                {project.featured && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium inline-flex items-center">
                    <FaStar className="mr-1" /> Featured
                  </span>
                )}
                {!project.isVisible && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium inline-flex items-center">
                    <FaEyeSlash className="mr-1" /> Hidden
                  </span>
                )}
              </div>

              {/* Thumbnail */}
              {project.thumbnail ? (
                <div className="relative">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  {/* Media indicators */}
                  <div className="absolute bottom-6 left-2 flex space-x-1">
                    {project.images && project.images.length > 0 && (
                      <span className="bg-black/60 text-white px-2 py-1 rounded text-xs inline-flex items-center">
                        <FaImages className="mr-1" /> {project.images.length}
                      </span>
                    )}
                    {project.documents && project.documents.length > 0 && (
                      <span className="bg-black/60 text-white px-2 py-1 rounded text-xs inline-flex items-center">
                        <FaFilePdf className="mr-1" /> {project.documents.length}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4 flex items-center justify-center">
                  <FaCode className="text-4xl text-primary-400" />
                  {/* Media indicators */}
                  <div className="absolute bottom-2 left-2 flex space-x-1">
                    {project.images && project.images.length > 0 && (
                      <span className="bg-black/60 text-white px-2 py-1 rounded text-xs inline-flex items-center">
                        <FaImages className="mr-1" /> {project.images.length}
                      </span>
                    )}
                    {project.documents && project.documents.length > 0 && (
                      <span className="bg-black/60 text-white px-2 py-1 rounded text-xs inline-flex items-center">
                        <FaFilePdf className="mr-1" /> {project.documents.length}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Project Info */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 pr-20">{project.title}</h3>
              <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 4).map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      +{project.technologies.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Dates */}
              {(project.startDate || project.isOngoing) && (
                <p className="text-xs text-gray-500 mb-3 flex items-center">
                  <FaCalendar className="mr-1" />
                  {project.startDate && new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  {' - '}
                  {project.isOngoing ? 'Present' : project.endDate && new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              )}

              {/* Links */}
              <div className="flex space-x-3 mb-4">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm inline-flex items-center"
                  >
                    <FaExternalLinkAlt className="mr-1" /> Live Demo
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800 text-sm inline-flex items-center"
                  >
                    <FaGithub className="mr-1" /> Source
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleVisibility(project)}
                    className={`p-2 rounded-lg transition-colors ${
                      project.isVisible 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={project.isVisible ? 'Hide from portfolio' : 'Show on portfolio'}
                  >
                    {project.isVisible ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <button
                    onClick={() => toggleFeatured(project)}
                    className={`p-2 rounded-lg transition-colors ${
                      project.featured 
                        ? 'text-yellow-500 hover:bg-yellow-50' 
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    <FaStar />
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(project)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit project"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(project._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete project"
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
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="My Awesome Project"
                  required
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="input-field"
                  placeholder="A brief description of your project"
                  required
                />
              </div>

              {/* Long Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description
                </label>
                <textarea
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleChange}
                  rows="4"
                  className="input-field"
                  placeholder="Detailed information about your project, features, challenges, etc."
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technologies Used
                </label>
                <input
                  type="text"
                  name="technologies"
                  value={formData.technologies}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="React, Node.js, MongoDB (comma separated)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate technologies with commas</p>
              </div>

              {/* Thumbnail Upload */}
              <FileUpload
                label="Project Thumbnail"
                type="image"
                maxSize={5}
                currentFile={formData.thumbnail}
                onUploadComplete={(data) => {
                  setFormData(prev => ({
                    ...prev,
                    thumbnail: data?.url || ''
                  }));
                }}
              />

              {/* Project Images */}
              <MultiFileUpload
                label="Project Screenshots / Gallery"
                maxFiles={10}
                maxSize={5}
                currentFiles={formData.images}
                onFilesChange={(files) => {
                  setFormData(prev => ({
                    ...prev,
                    images: files
                  }));
                }}
              />

              {/* Document Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaFilePdf className="inline mr-2" />Project Documents (PDF)
                </label>
                <FileUpload
                  label=""
                  type="document"
                  maxSize={10}
                  currentFile={formData.documents?.[0]?.url}
                  showPreview={true}
                  onUploadComplete={(data) => {
                    if (data) {
                      setFormData(prev => ({
                        ...prev,
                        documents: [{ url: data.url, name: data.originalName || 'Document' }]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        documents: []
                      }));
                    }
                  }}
                />
              </div>

              {/* URLs Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaExternalLinkAlt className="inline mr-1" /> Live Demo URL
                  </label>
                  <input
                    type="url"
                    name="demoUrl"
                    value={formData.demoUrl}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://myproject.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaGithub className="inline mr-1" /> GitHub URL
                  </label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://github.com/username/project"
                  />
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="input-field"
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
                    disabled={formData.isOngoing}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isOngoing"
                    checked={formData.isOngoing}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Ongoing Project</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Featured Project</span>
                </label>
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

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProject ? 'Update Project' : 'Add Project'}
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Project?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
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

export default Projects;
