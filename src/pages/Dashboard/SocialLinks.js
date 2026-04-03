import React, { useState, useEffect } from 'react';
import { socialService } from '../../services/dataService';
import { toast } from 'react-toastify';
import { Modal, ConfirmDialog, EmptyState, LoadingSpinner, FormField, SelectField, CheckboxField } from '../../components/ui';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash,
  FaLinkedin, FaGithub, FaTwitter, FaFacebook, FaInstagram, 
  FaYoutube, FaMedium, FaDev, FaStackOverflow, FaGlobe, FaLink
} from 'react-icons/fa';

const PLATFORMS = [
  { value: 'LinkedIn', label: 'LinkedIn', icon: FaLinkedin, color: 'text-blue-600 bg-blue-100' },
  { value: 'GitHub', label: 'GitHub', icon: FaGithub, color: 'text-gray-800 bg-gray-100' },
  { value: 'Twitter', label: 'Twitter', icon: FaTwitter, color: 'text-sky-500 bg-sky-100' },
  { value: 'Facebook', label: 'Facebook', icon: FaFacebook, color: 'text-blue-700 bg-blue-100' },
  { value: 'Instagram', label: 'Instagram', icon: FaInstagram, color: 'text-pink-600 bg-pink-100' },
  { value: 'YouTube', label: 'YouTube', icon: FaYoutube, color: 'text-red-600 bg-red-100' },
  { value: 'Medium', label: 'Medium', icon: FaMedium, color: 'text-gray-900 bg-gray-100' },
  { value: 'Dev.to', label: 'Dev.to', icon: FaDev, color: 'text-gray-900 bg-gray-100' },
  { value: 'Stack Overflow', label: 'Stack Overflow', icon: FaStackOverflow, color: 'text-orange-500 bg-orange-100' },
  { value: 'Portfolio', label: 'Portfolio', icon: FaGlobe, color: 'text-green-600 bg-green-100' },
  { value: 'Other', label: 'Other', icon: FaLink, color: 'text-gray-600 bg-gray-100' }
];

const getPlatformConfig = (platform) => {
  return PLATFORMS.find(p => p.value === platform) || PLATFORMS[PLATFORMS.length - 1];
};

const SocialLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    platform: 'LinkedIn',
    url: '',
    username: '',
    isVisible: true
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await socialService.getAll();
      setLinks(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch social links');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      platform: 'LinkedIn',
      url: '',
      username: '',
      isVisible: true
    });
    setEditingLink(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (link) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform || 'LinkedIn',
      url: link.url || '',
      username: link.username || '',
      isVisible: link.isVisible !== false
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
    
    if (!formData.url.trim()) {
      toast.error('URL is required');
      return;
    }

    // Basic URL validation
    if (!formData.url.match(/^https?:\/\/.+/)) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setSaving(true);
    try {
      if (editingLink) {
        await socialService.update(editingLink._id, formData);
        toast.success('Social link updated successfully');
      } else {
        await socialService.create(formData);
        toast.success('Social link added successfully');
      }
      closeModal();
      fetchLinks();
    } catch (error) {
      toast.error(editingLink ? 'Failed to update link' : 'Failed to add link');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await socialService.delete(id);
      toast.success('Social link deleted');
      fetchLinks();
    } catch (error) {
      toast.error('Failed to delete link');
    }
  };

  const toggleVisibility = async (link) => {
    try {
      await socialService.update(link._id, { isVisible: !link.isVisible });
      toast.success(`Link ${link.isVisible ? 'hidden' : 'shown'} on portfolio`);
      fetchLinks();
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Links</h1>
          <p className="text-gray-600 mt-1">Manage your social media profiles and links</p>
        </div>
        <button onClick={openAddModal} className="btn-primary inline-flex items-center">
          <FaPlus className="mr-2" /> Add Link
        </button>
      </div>

      {links.length === 0 ? (
        <EmptyState
          icon={FaLink}
          title="No social links yet"
          description="Add your social media profiles to help visitors connect with you"
          actionLabel="Add Link"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => {
            const config = getPlatformConfig(link.platform);
            const Icon = config.icon;
            
            return (
              <div
                key={link._id}
                className={`card p-4 ${!link.isVisible ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.color}`}>
                    <Icon className="text-2xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{link.platform}</h3>
                      {!link.isVisible && <FaEyeSlash className="text-gray-400 text-sm" />}
                    </div>
                    {link.username && (
                      <p className="text-sm text-gray-600">@{link.username}</p>
                    )}
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 truncate block"
                    >
                      {link.url}
                    </a>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => toggleVisibility(link)}
                    className={`p-2 rounded-lg transition-colors ${
                      link.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={link.isVisible ? 'Hide from portfolio' : 'Show on portfolio'}
                  >
                    {link.isVisible ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <button
                    onClick={() => openEditModal(link)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => setDeleteId(link._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Platform Buttons */}
      {links.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick add:</h4>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.filter(p => !links.some(l => l.platform === p.value)).map(platform => {
              const Icon = platform.icon;
              return (
                <button
                  key={platform.value}
                  onClick={() => {
                    resetForm();
                    setFormData(prev => ({ ...prev, platform: platform.value }));
                    setShowModal(true);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors hover:shadow-md inline-flex items-center space-x-2 ${platform.color}`}
                >
                  <Icon /> <span>{platform.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingLink ? 'Edit Social Link' : 'Add Social Link'}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <SelectField
            label="Platform"
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            options={PLATFORMS.map(p => ({ value: p.value, label: p.label }))}
            required
          />

          <FormField
            label="Profile URL"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/yourprofile"
            required
          />

          <FormField
            label="Username (optional)"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="yourprofile"
          />

          <CheckboxField
            label="Visible on Portfolio"
            name="isVisible"
            checked={formData.isVisible}
            onChange={handleChange}
          />

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : editingLink ? 'Update' : 'Add Link'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete Social Link?"
        message="Are you sure you want to delete this social link? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default SocialLinks;
