import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Modal, TextArea, FormField, LoadingSpinner, EmptyState, ConfirmDialog } from '../../components/ui';
import { FaEnvelope, FaPaperPlane, FaEdit, FaTrash, FaClock, FaEye, FaUsers, FaCopy } from 'react-icons/fa';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Newsletter = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [showSendConfirm, setShowSendConfirm] = useState(null);
  const [sending, setSending] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' or 'subscribers'
  const [showQuickSend, setShowQuickSend] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState(new Set());
  const [formData, setFormData] = useState({
    subject: '',
    content: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [campaignsRes, subscribersRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/newsletter/campaigns`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/newsletter/subscribers`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/newsletter/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setCampaigns(campaignsRes.data.data || []);
      setSubscribers(subscribersRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (error) {
      toast.error('Failed to fetch newsletter data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (editingCampaign) {
        await axios.put(
          `${API_URL}/newsletter/campaigns/${editingCampaign._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Campaign updated');
        setCampaigns(campaigns.map(c => c._id === editingCampaign._id ? { ...c, ...formData } : c));
        setEditingCampaign(null);
      } else {
        const res = await axios.post(
          `${API_URL}/newsletter/campaigns`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Campaign created');
        setCampaigns([res.data.data, ...campaigns]);
      }
      setFormData({ subject: '', content: '' });
      setShowCreateModal(false);
    } catch (error) {
      toast.error('Failed to save campaign');
    }
  };

  const handleSend = async () => {
    try {
      setSending(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/newsletter/campaigns/${showSendConfirm}/send`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      await fetchData();
      setShowSendConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/newsletter/campaigns/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Campaign deleted');
      setCampaigns(campaigns.filter(c => c._id !== id));
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({ subject: campaign.subject, content: campaign.content });
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingCampaign(null);
    setFormData({ subject: '', content: '' });
  };

  const copyToClipboard = (email) => {
    navigator.clipboard.writeText(email);
    toast.success('Email copied!');
  };

  const toggleSubscriber = (email) => {
    const newSelected = new Set(selectedSubscribers);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedSubscribers(newSelected);
  };

  const selectAllSubscribers = () => {
    if (selectedSubscribers.size === subscribers.length) {
      setSelectedSubscribers(new Set());
    } else {
      setSelectedSubscribers(new Set(subscribers.map(s => s.email)));
    }
  };

  const handleQuickSend = async () => {
    if (!formData.subject.trim() || !formData.content.trim()) {
      toast.error('Please fill in subject and content');
      return;
    }
    if (selectedSubscribers.size === 0) {
      toast.error('Please select at least one subscriber');
      return;
    }

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      
      // Send to each selected subscriber
      const selectedList = Array.from(selectedSubscribers);
      let successCount = 0;
      let failedCount = 0;

      for (const email of selectedList) {
        try {
          await axios.post(
            `${API_URL}/newsletter/send-direct`,
            {
              email,
              subject: formData.subject,
              content: formData.content
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          successCount++;
        } catch (error) {
          failedCount++;
        }
      }

      toast.success(`Sent to ${successCount} subscriber${successCount !== 1 ? 's' : ''}${failedCount > 0 ? `, ${failedCount} failed` : ''}`);
      setFormData({ subject: '', content: '' });
      setSelectedSubscribers(new Set());
      setShowQuickSend(false);
      await fetchData();
    } catch (error) {
      toast.error('Error sending emails');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Newsletter Management</h1>
        <p className="text-gray-600 mt-1">Create and send newsletters to your subscribers</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'campaigns'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FaPaperPlane className="inline mr-2" />
          Campaigns
        </button>
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'subscribers'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FaUsers className="inline mr-2" />
          Subscribers ({subscribers.length})
        </button>
      </div>

      {/* Stats Cards */}
      {stats && activeTab === 'campaigns' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Subscribers</p>
                <p className="text-3xl font-bold">{stats.totalSubscribers}</p>
              </div>
              <FaUsers className="text-4xl text-blue-200" />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Campaigns</p>
                <p className="text-3xl font-bold">{stats.sentCampaigns}</p>
              </div>
              <FaPaperPlane className="text-4xl text-green-200" />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Drafts</p>
                <p className="text-3xl font-bold">{stats.draftCampaigns}</p>
              </div>
              <FaClock className="text-4xl text-purple-200" />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Open Rate</p>
                <p className="text-3xl font-bold">{stats.averageOpenRate}%</p>
              </div>
              <FaEye className="text-4xl text-orange-200" />
            </div>
          </div>
        </div>
      )}

      {/* Create Button */}
      {activeTab === 'campaigns' && (
      <div className="mb-6">
        <button
          onClick={() => {
            setEditingCampaign(null);
            setFormData({ subject: '', content: '' });
            setShowCreateModal(true);
          }}
          className="btn-primary inline-flex items-center"
        >
          <FaEnvelope className="mr-2" />
          Create Campaign
        </button>
      </div>
      )}

      {/* Campaigns List */}
      {activeTab === 'campaigns' && (
      <>
      {campaigns.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FaEnvelope}
            title="No campaigns yet"
            description="Create your first newsletter campaign"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{campaign.subject}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{campaign.content}</p>
                  
                  {campaign.status === 'sent' && (
                    <div className="flex space-x-6 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{campaign.successfulSends}</span> sent
                      </div>
                      <div>
                        <span className="font-medium">{campaign.failedSends}</span> failed
                      </div>
                      <div>
                        <span className="font-medium">{campaign.openedCount}</span> opened
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  {campaign.status === 'draft' && (
                    <>
                      <button
                        onClick={() => handleEdit(campaign)}
                        className="text-primary-600 hover:text-primary-700 p-2"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setShowSendConfirm(campaign._id)}
                        className="text-green-600 hover:text-green-700 p-2"
                        title="Send"
                      >
                        <FaPaperPlane />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setDeleteId(campaign._id)}
                    className="text-red-600 hover:text-red-700 p-2"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
      <>
        {subscribers.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={FaUsers}
              title="No subscribers yet"
              description="Subscribers will appear here once they sign up"
            />
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex-1">
                <p className="text-sm text-blue-700">
                  Total Subscribers: <span className="font-bold text-lg">{subscribers.length}</span>
                  {selectedSubscribers.size > 0 && (
                    <span className="ml-4 text-green-700">
                      Selected: <span className="font-bold">{selectedSubscribers.size}</span>
                    </span>
                  )}
                </p>
              </div>
              {selectedSubscribers.size > 0 && (
                <button
                  onClick={() => setShowQuickSend(true)}
                  className="ml-4 btn-primary inline-flex items-center"
                >
                  <FaPaperPlane className="mr-2" />
                  Send Now
                </button>
              )}
            </div>

            <div className="mb-3 flex items-center space-x-2">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectedSubscribers.size === subscribers.length && subscribers.length > 0}
                onChange={selectAllSubscribers}
                className="w-4 h-4"
              />
              <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">
                Select All
              </label>
            </div>

            <div className="grid gap-2">
              {subscribers.map((sub) => (
                <div key={sub._id} className="card flex items-center p-4 hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedSubscribers.has(sub.email)}
                    onChange={() => toggleSubscriber(sub.email)}
                    className="w-4 h-4 mr-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{sub.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Subscribed: {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(sub.email)}
                    className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50 transition-colors"
                    title="Copy email"
                  >
                    <FaCopy />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        title={editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
        size="lg"
      >
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Newsletter subject"
              required
            />

            <TextArea
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your newsletter content here..."
              rows={8}
              required
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
              <FaEnvelope className="text-blue-600 mt-1 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                This newsletter will be sent to {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}.
              </p>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Send Confirmation */}
      <ConfirmDialog
        isOpen={!!showSendConfirm}
        onClose={() => !sending && setShowSendConfirm(null)}
        onConfirm={handleSend}
        title="Send Newsletter?"
        message={`Are you sure you want to send this newsletter to ${subscribers.length} subscriber${subscribers.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText={sending ? 'Sending...' : 'Send Newsletter'}
        type="success"
        disabled={sending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete Campaign?"
        message="Are you sure you want to delete this campaign?"
        confirmText="Delete"
        type="danger"
      />

      {/* Quick Send Modal */}
      <Modal
        isOpen={showQuickSend}
        onClose={() => !sending && setShowQuickSend(false)}
        title="Send Direct to Selected Subscribers"
        size="lg"
      >
        <div className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleQuickSend(); }} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                <span className="font-bold">{selectedSubscribers.size}</span> subscriber{selectedSubscribers.size !== 1 ? 's' : ''} will receive this email
              </p>
            </div>

            <FormField
              label="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Email subject"
              required
            />

            <TextArea
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your email content here..."
              rows={8}
              required
            />

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowQuickSend(false)}
                className="btn-secondary"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Newsletter;
