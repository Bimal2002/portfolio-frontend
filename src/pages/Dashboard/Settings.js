import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { portfolioService } from '../../services/dataService';
import { toast } from 'react-toastify';
import { LoadingSpinner, FormField, TextArea } from '../../components/ui';
import FileUpload from '../../components/FileUpload';
import { 
  FaUser, FaPalette, FaEye, FaShieldAlt, FaSave, FaGlobe, 
  FaPhone, FaMapMarkerAlt, FaFileAlt, FaLink
} from 'react-icons/fa';

const PUBLIC_SITE_URL = process.env.REACT_APP_PUBLIC_URL || window.location.origin;

const LAYOUTS = [
  { value: 'modern', label: 'Modern', description: 'Clean and contemporary design' },
  { value: 'classic', label: 'Classic', description: 'Traditional professional look' },
  { value: 'minimal', label: 'Minimal', description: 'Simple and elegant' },
  { value: 'creative', label: 'Creative', description: 'Bold and artistic' }
];

const COLOR_PRESETS = [
  { name: 'Blue', primary: '#3B82F6', secondary: '#1E40AF' },
  { name: 'Green', primary: '#10B981', secondary: '#047857' },
  { name: 'Purple', primary: '#8B5CF6', secondary: '#6D28D9' },
  { name: 'Red', primary: '#EF4444', secondary: '#B91C1C' },
  { name: 'Orange', primary: '#F59E0B', secondary: '#D97706' },
  { name: 'Pink', primary: '#EC4899', secondary: '#BE185D' },
  { name: 'Teal', primary: '#14B8A6', secondary: '#0D9488' },
  { name: 'Indigo', primary: '#6366F1', secondary: '#4338CA' }
];

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    username: '',
    email: '',
    avatar: ''
  });

  const [portfolioData, setPortfolioData] = useState({
    tagline: '',
    bio: '',
    location: '',
    phone: '',
    resumeUrl: '',
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      layout: 'modern'
    },
    sections: {
      about: true,
      education: true,
      experience: true,
      projects: true,
      skills: true,
      social: true,
      contact: true
    },
    metaTitle: '',
    metaDescription: '',
    isPublished: true,
    autoresponderEnabled: false,
    autoresponderMessage: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Set profile data from user context
      if (user) {
        setProfileData({
          fullName: user.fullName || '',
          username: user.username || '',
          email: user.email || '',
          avatar: user.avatar || ''
        });
      }

      // Fetch portfolio settings
      const portfolioResponse = await portfolioService.getMy();
      if (portfolioResponse.data) {
        setPortfolioData(prev => ({
          ...prev,
          ...portfolioResponse.data,
          theme: { ...prev.theme, ...portfolioResponse.data.theme },
          sections: { ...prev.sections, ...portfolioResponse.data.sections }
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePortfolioChange = (e) => {
    const { name, value } = e.target;
    setPortfolioData(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (key, value) => {
    setPortfolioData(prev => ({
      ...prev,
      theme: { ...prev.theme, [key]: value }
    }));
  };

  const handleSectionToggle = (section) => {
    setPortfolioData(prev => ({
      ...prev,
      sections: { ...prev.sections, [section]: !prev.sections[section] }
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const applyColorPreset = (preset) => {
    setPortfolioData(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        primaryColor: preset.primary,
        secondaryColor: preset.secondary
      }
    }));
  };

  const saveProfile = async () => {
    if (!profileData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        fullName: profileData.fullName,
        avatar: profileData.avatar
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const savePortfolio = async () => {
    setSaving(true);
    try {
      await portfolioService.update(portfolioData);
      toast.success('Portfolio settings saved');
    } catch (error) {
      toast.error('Failed to save portfolio settings');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'portfolio', label: 'Portfolio', icon: FaGlobe },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'visibility', label: 'Visibility', icon: FaEye },
    { id: 'security', label: 'Security', icon: FaShieldAlt }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your profile and portfolio settings</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white shadow text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
          
          <div className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
              <div className="flex items-center space-x-6">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <FaUser className="text-3xl text-gray-400" />
                  </div>
                )}
                <FileUpload
                  type="image"
                  maxSize={5}
                  label="Upload Photo"
                  currentFile={profileData.avatar}
                  showPreview={false}
                  onUploadComplete={(data) => setProfileData(prev => ({ ...prev, avatar: data?.url || '' }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Full Name"
                name="fullName"
                value={profileData.fullName}
                onChange={handleProfileChange}
                required
              />
              
              <FormField
                label="Username"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                disabled
                icon={FaLink}
              />
              
              <FormField
                label="Email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>Portfolio URL:</strong>{' '}
                <a 
                  href={`${PUBLIC_SITE_URL}/${profileData.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  {PUBLIC_SITE_URL}/{profileData.username}
                </a>
              </p>
            </div>

            <button onClick={saveProfile} disabled={saving} className="btn-primary">
              <FaSave className="mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Portfolio Information</h2>
          
          <div className="space-y-6">
            <FormField
              label="Tagline"
              name="tagline"
              value={portfolioData.tagline}
              onChange={handlePortfolioChange}
              placeholder="Full Stack Developer | Problem Solver | Tech Enthusiast"
            />

            <TextArea
              label="Bio"
              name="bio"
              value={portfolioData.bio}
              onChange={handlePortfolioChange}
              placeholder="Tell visitors about yourself..."
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Location"
                name="location"
                value={portfolioData.location}
                onChange={handlePortfolioChange}
                placeholder="New York, USA"
                icon={FaMapMarkerAlt}
              />

              <FormField
                label="Phone"
                name="phone"
                value={portfolioData.phone}
                onChange={handlePortfolioChange}
                placeholder="+1 234 567 8900"
                icon={FaPhone}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resume/CV</label>
              <div className="flex items-center space-x-4">
                <FormField
                  name="resumeUrl"
                  value={portfolioData.resumeUrl}
                  onChange={handlePortfolioChange}
                  placeholder="https://example.com/resume.pdf"
                  icon={FaFileAlt}
                  className="flex-1"
                />
                <FileUpload
                  type="document"
                  maxSize={5}
                  label="Upload"
                  currentFile={portfolioData.resumeUrl}
                  onUploadComplete={(data) => setPortfolioData(prev => ({ ...prev, resumeUrl: data?.url || '' }))}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <FormField
                  label="Meta Title"
                  name="metaTitle"
                  value={portfolioData.metaTitle}
                  onChange={handlePortfolioChange}
                  placeholder="John Doe | Full Stack Developer"
                />
                <TextArea
                  label="Meta Description"
                  name="metaDescription"
                  value={portfolioData.metaDescription}
                  onChange={handlePortfolioChange}
                  placeholder="Experienced developer specializing in..."
                  rows={2}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Messaging Auto-Responder</h3>
              <div className="flex items-start gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={portfolioData.autoresponderEnabled}
                    onChange={() => setPortfolioData(prev => ({ ...prev, autoresponderEnabled: !prev.autoresponderEnabled }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
                <div className="flex-1">
                  <TextArea
                    label="Auto-Responder Message"
                    name="autoresponderMessage"
                    value={portfolioData.autoresponderMessage}
                    onChange={handlePortfolioChange}
                    placeholder="Thanks for reaching out! I will get back to you soon."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">If enabled, visitors receive an acknowledgement email after sending a message.</p>
                </div>
              </div>
            </div>

            <button onClick={savePortfolio} disabled={saving} className="btn-primary">
              <FaSave className="mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Theme & Appearance</h2>
          
          <div className="space-y-6">
            {/* Layout Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Layout Style</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {LAYOUTS.map(layout => (
                  <button
                    key={layout.value}
                    onClick={() => handleThemeChange('layout', layout.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      portfolioData.theme.layout === layout.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-semibold text-gray-900">{layout.label}</h4>
                    <p className="text-xs text-gray-500 mt-1">{layout.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Color Presets</label>
              <div className="flex flex-wrap gap-3">
                {COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => applyColorPreset(preset)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center space-x-2 ${
                      portfolioData.theme.primaryColor === preset.primary
                        ? 'border-gray-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex">
                      <div className="w-4 h-4 rounded-l" style={{ backgroundColor: preset.primary }} />
                      <div className="w-4 h-4 rounded-r" style={{ backgroundColor: preset.secondary }} />
                    </div>
                    <span className="text-sm font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Custom Colors</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={portfolioData.theme.primaryColor}
                      onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={portfolioData.theme.primaryColor}
                      onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Secondary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={portfolioData.theme.secondaryColor}
                      onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={portfolioData.theme.secondaryColor}
                      onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Background</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={portfolioData.theme.backgroundColor}
                      onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={portfolioData.theme.backgroundColor}
                      onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={portfolioData.theme.textColor}
                      onChange={(e) => handleThemeChange('textColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={portfolioData.theme.textColor}
                      onChange={(e) => handleThemeChange('textColor', e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Preview</label>
              <div 
                className="p-6 rounded-lg border"
                style={{ backgroundColor: portfolioData.theme.backgroundColor }}
              >
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: portfolioData.theme.primaryColor }}
                >
                  {profileData.fullName || 'Your Name'}
                </h3>
                <p style={{ color: portfolioData.theme.textColor }}>
                  {portfolioData.tagline || 'Your tagline will appear here'}
                </p>
                <button
                  className="mt-4 px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: portfolioData.theme.primaryColor }}
                >
                  Sample Button
                </button>
              </div>
            </div>

            <button onClick={savePortfolio} disabled={saving} className="btn-primary">
              <FaSave className="mr-2" />
              {saving ? 'Saving...' : 'Save Theme'}
            </button>
          </div>
        </div>
      )}

      {/* Visibility Tab */}
      {activeTab === 'visibility' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Section Visibility</h2>
          
          <div className="space-y-6">
            <p className="text-gray-600">Choose which sections to display on your public portfolio.</p>
            
            <div className="space-y-4">
              {Object.entries(portfolioData.sections).map(([section, isVisible]) => (
                <div 
                  key={section}
                  className={`p-4 border rounded-lg flex items-center justify-between transition-colors ${
                    isVisible ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">{section}</h4>
                    <p className="text-sm text-gray-500">
                      {section === 'about' && 'Your bio and basic information'}
                      {section === 'education' && 'Your educational background'}
                      {section === 'experience' && 'Your work experience'}
                      {section === 'projects' && 'Your portfolio projects'}
                      {section === 'skills' && 'Your technical and soft skills'}
                      {section === 'social' && 'Links to your social profiles'}
                      {section === 'contact' && 'Contact form for visitors'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => handleSectionToggle(section)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Publish Portfolio</h4>
                  <p className="text-sm text-gray-500">Make your portfolio visible to the public</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={portfolioData.isPublished}
                    onChange={() => setPortfolioData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>

            <button onClick={savePortfolio} disabled={saving} className="btn-primary">
              <FaSave className="mr-2" />
              {saving ? 'Saving...' : 'Save Visibility'}
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
          
          <form onSubmit={changePassword} className="space-y-6">
            <div className="max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              
              <div className="space-y-4">
                <FormField
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                
                <FormField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                
                <FormField
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <button type="submit" disabled={saving} className="btn-primary mt-6">
                <FaShieldAlt className="mr-2" />
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

          <div className="border-t mt-8 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Account Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Last Updated:</strong> {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Account Status:</strong> <span className="text-green-600 font-medium">Active</span></p>
            </div>
          </div>

          <div className="border-t mt-8 pt-8">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <p className="text-sm text-gray-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
