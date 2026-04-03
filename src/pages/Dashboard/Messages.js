import React, { useState, useEffect, useMemo } from 'react';
import { messageService } from '../../services/dataService';
import { toast } from 'react-toastify';
import { Modal, ConfirmDialog, EmptyState, LoadingSpinner, TextArea } from '../../components/ui';
import { 
  FaEnvelope, FaInbox, FaArchive, FaTrash, FaReply, FaCheckDouble,
  FaSearch, FaExclamationCircle, FaClock, FaUser, FaFileAlt
} from 'react-icons/fa';
import FileUpload from '../../components/FileUpload';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [savedFilters, setSavedFilters] = useState([]);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [reply, setReply] = useState('');
  const [replyAttachment, setReplyAttachment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sortBy] = useState('newest');

  useEffect(() => {
    // Restore saved filters and last view preferences
    try {
      const stored = JSON.parse(localStorage.getItem('messagesSavedFilters') || '[]');
      if (Array.isArray(stored)) {
        setSavedFilters(stored);
      }
      const lastView = JSON.parse(localStorage.getItem('messagesLastView') || '{}');
      if (lastView && typeof lastView === 'object') {
        if (lastView.filter) setFilter(lastView.filter);
        if (lastView.searchTerm) setSearchTerm(lastView.searchTerm);
      }
    } catch (_) {}

    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  // Persist last view preferences
  useEffect(() => {
    try {
      localStorage.setItem('messagesLastView', JSON.stringify({ filter, searchTerm }));
    } catch (_) {}
  }, [filter, searchTerm]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messageService.getAll();
      setMessages(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = useMemo(() => {
    let filtered = [...messages];

    if (filter === 'unread') {
      filtered = filtered.filter(m => !m.isRead && !m.isArchived);
    } else if (filter === 'archived') {
      filtered = filtered.filter(m => m.isArchived);
    } else {
      filtered = filtered.filter(m => !m.isArchived);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.senderName.toLowerCase().includes(term) ||
        m.senderEmail.toLowerCase().includes(term) ||
        m.subject?.toLowerCase().includes(term) ||
        m.message.toLowerCase().includes(term)
      );
    }

    if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.lastReplyAt || a.createdAt) - new Date(b.lastReplyAt || b.createdAt));
    } else {
      filtered.sort((a, b) => new Date(b.lastReplyAt || b.createdAt) - new Date(a.lastReplyAt || a.createdAt));
    }

    return filtered;
  }, [messages, filter, searchTerm, sortBy]);

  const handleSaveCurrentFilter = () => {
    const name = saveName.trim();
    if (!name) return;
    const newFilter = { id: Date.now(), name, filter, searchTerm };
    const next = [newFilter, ...savedFilters].slice(0, 10);
    setSavedFilters(next);
    try {
      localStorage.setItem('messagesSavedFilters', JSON.stringify(next));
    } catch (_) {}
    setShowSaveInput(false);
    setSaveName('');
    toast.success('Filter saved');
  };

  const applySavedFilter = (sf) => {
    setFilter(sf.filter || 'all');
    setSearchTerm(sf.searchTerm || '');
  };

  const deleteSavedFilter = (id) => {
    const next = savedFilters.filter(f => f.id !== id);
    setSavedFilters(next);
    try {
      localStorage.setItem('messagesSavedFilters', JSON.stringify(next));
    } catch (_) {}
  };

  // Derived counts for summary and tabs
  const counts = useMemo(() => {
    const active = messages.filter(m => !m.isArchived);
    const totalActive = active.length;
    const unreadActive = active.filter(m => !m.isRead).length;
    const repliedActive = active.filter(m => m.replies && m.replies.length > 0).length;
    const archived = messages.filter(m => m.isArchived).length;
    return { totalActive, unreadActive, repliedActive, archived };
  }, [messages]);

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    
    if (!message.isRead) {
      try {
        await messageService.update(message._id, { isRead: true });
        setMessages(prev =>
          prev.map(m =>
            m._id === message._id ? { ...m, isRead: true } : m
          )
        );
      } catch (error) {
        console.error('Failed to mark as read');
      }
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setSaving(true);
    try {
      const payload = { message: reply };
      if (replyAttachment) {
        payload.attachments = [replyAttachment];
      }
      const response = await messageService.addReply(selectedMessage._id, payload);
      toast.success('Reply sent successfully!');
      
      // Update local state
      setMessages(prev =>
        prev.map(m =>
          m._id === selectedMessage._id ? response.data : m
        )
      );
      setSelectedMessage(response.data);
      setShowReplyModal(false);
      setReply('');
      setReplyAttachment(null);
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRead = async (messageId, nextIsRead) => {
    try {
      await messageService.update(messageId, { isRead: nextIsRead });
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isRead: nextIsRead } : m));
      if (selectedMessage?._id === messageId) setSelectedMessage(prev => ({ ...prev, isRead: nextIsRead }));
      toast.success(nextIsRead ? 'Marked as read' : 'Marked as unread');
    } catch (e) {
      toast.error('Failed to update read status');
    }
  };

  const handleArchive = async (messageId) => {
    try {
      await messageService.update(messageId, { isArchived: true });
      toast.success('Message archived');
      setMessages(prev =>
        prev.map(m =>
          m._id === messageId ? { ...m, isArchived: true } : m
        )
      );
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      toast.error('Failed to archive message');
    }
  };

  const handleDelete = async (id) => {
    try {
      await messageService.delete(id);
      toast.success('Message deleted');
      setMessages(prev => prev.filter(m => m._id !== id));
      if (selectedMessage?._id === id) {
        setSelectedMessage(null);
      }
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = diff / (1000 * 60 * 60);
    const days = diff / (1000 * 60 * 60 * 24);

    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60));
      return `${mins}m ago`;
    } else if (hours < 24) {
      return `${Math.floor(hours)}h ago`;
    } else if (days < 7) {
      return `${Math.floor(days)}d ago`;
    }
    return date.toLocaleDateString();
  };

  const unreadCount = counts.unreadActive;
  const repliedCount = counts.repliedActive;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Manage conversations with portfolio visitors</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Messages</p>
              <p className="text-2xl font-bold">{counts.totalActive}</p>
            </div>
            <FaInbox className="text-3xl text-blue-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Unread</p>
              <p className="text-2xl font-bold">{unreadCount}</p>
            </div>
            <FaExclamationCircle className="text-3xl text-red-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Conversations</p>
              <p className="text-2xl font-bold">{repliedCount}</p>
            </div>
            <FaCheckDouble className="text-3xl text-green-200" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-gray-500 to-gray-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm">Archived</p>
              <p className="text-2xl font-bold">{counts.archived}</p>
            </div>
            <FaArchive className="text-3xl text-gray-200" />
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 card p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Messages List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All ({counts.totalActive})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'unread' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Unread ({counts.unreadActive})
                </button>
                <button
                  onClick={() => setFilter('archived')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'archived' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Archived ({counts.archived})
                </button>
                <button
                  onClick={() => setShowSaveInput(v => !v)}
                  className="ml-auto px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  Save current
                </button>
              </div>

              {showSaveInput && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Name this filter set"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="input-field flex-1"
                  />
                  <button
                    onClick={handleSaveCurrentFilter}
                    className="btn-primary btn-sm"
                  >
                    Save
                  </button>
                </div>
              )}

              {savedFilters.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {savedFilters.map(sf => (
                    <div key={sf.id} className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded">
                      <button
                        onClick={() => applySavedFilter(sf)}
                        className="text-sm text-gray-700 hover:text-primary-700"
                        title={`${sf.name}: ${sf.filter}${sf.searchTerm ? `, ${sf.searchTerm}` : ''}`}
                      >
                        {sf.name}
                      </button>
                      <button
                        onClick={() => deleteSavedFilter(sf.id)}
                        className="text-xs text-gray-500 hover:text-red-600"
                        aria-label="Delete saved filter"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={FaEnvelope}
                    title="No messages"
                    message="No messages to display"
                  />
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message._id}
                    onClick={() => handleSelectMessage(message)}
                    className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                      selectedMessage?._id === message._id
                        ? 'bg-green-50 border-l-4 border-l-green-500'
                        : !message.isRead
                        ? 'bg-blue-50 border-l-4 border-l-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {message.senderName}
                        {!message.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(message.lastReplyAt || message.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{message.subject || 'No Subject'}</p>
                    <p className="text-sm text-gray-500 truncate">{message.message}</p>
                    {message.replies && message.replies.length > 0 && (
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <div className="flex items-center text-primary-600">
                          <FaReply className="mr-1" />
                          {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">Replied</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Details */}
          <div className="w-2/3 flex flex-col">
            {selectedMessage ? (
              <>
                {/* Message Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject || 'No Subject'}</h2>
                      <p className="text-sm text-gray-600">
                        From: <span className="font-medium">{selectedMessage.senderName}</span> ({selectedMessage.senderEmail})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <FaClock className="inline mr-1" />
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowReplyModal(true)}
                        className="btn-primary btn-sm"
                      >
                        <FaReply className="mr-1" /> Reply
                      </button>
                      <button
                        onClick={() => handleToggleRead(selectedMessage._id, !selectedMessage.isRead)}
                        className="btn-secondary btn-sm"
                      >
                        {selectedMessage.isRead ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button
                        onClick={() => handleArchive(selectedMessage._id)}
                        className="btn-secondary btn-sm"
                      >
                        <FaArchive className="mr-1" /> Archive
                      </button>
                      <button
                        onClick={() => setDeleteId(selectedMessage._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  <div className="max-w-3xl mx-auto space-y-4">
                    {/* Original Message */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-blue-500">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <FaUser className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{selectedMessage.senderName}</p>
                          <p className="text-xs text-gray-500">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                      {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {selectedMessage.attachments.map((att, i) => (
                            <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 bg-gray-50 rounded border hover:bg-gray-100 text-sm">
                              <FaFileAlt className="text-gray-600 mr-2" />
                              <span className="truncate">{att.name || 'Attachment'}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {selectedMessage.attachments.map((att, i) => (
                            <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 bg-gray-50 rounded border hover:bg-gray-100 text-sm">
                              <FaFileAlt className="text-gray-500 mr-2" />
                              <span className="truncate">{att.name || 'Attachment'}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Replies Thread */}
                    {selectedMessage.replies && selectedMessage.replies.map((r, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg shadow-sm ${
                          r.sender === 'owner'
                            ? 'bg-green-50 border-l-4 border-l-green-500 ml-8'
                            : 'bg-blue-50 border-l-4 border-l-blue-500'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            r.sender === 'owner' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            <FaUser className={r.sender === 'owner' ? 'text-green-600' : 'text-blue-600'} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {r.senderName}
                              {r.sender === 'owner' && <span className="ml-2 text-xs text-green-600">(You)</span>}
                            </p>
                            <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{r.message}</p>
                        {r.attachments && r.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {r.attachments.map((att, i) => (
                              <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 bg-gray-50 rounded border hover:bg-gray-100 text-sm">
                                <FaFileAlt className="text-gray-600 mr-2" />
                                <span className="truncate">{att.name || 'Attachment'}</span>
                              </a>
                            ))}
                          </div>
                        )}
                        {r.attachments && r.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {r.attachments.map((att, i) => (
                              <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 bg-gray-50 rounded border hover:bg-gray-100 text-sm">
                                <FaFileAlt className="text-gray-500 mr-2" />
                                <span className="truncate">{att.name || 'Attachment'}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={FaEnvelope}
                  title="No message selected"
                  message="Select a message from the list to view the conversation"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => {
          setShowReplyModal(false);
          setReply('');
        }}
        title="Send Reply"
        size="lg"
      >
                <div className="mt-3">
                  <FileUpload
                    label="Attach a file (optional)"
                    type="any"
                    maxSize={10}
                    showPreview={false}
                    onUploadComplete={(data) => setReplyAttachment({ url: data?.url, name: data?.originalName || 'Attachment', type: data?.format, size: data?.size })}
                  />
                </div>
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>To:</strong> {selectedMessage?.senderName} ({selectedMessage?.senderEmail})
            </p>
            <p className="text-sm text-gray-600">
              <strong>Subject:</strong> Re: {selectedMessage?.subject || 'Your Message'}
            </p>
          </div>

          <TextArea
            label="Your Reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={6}
            placeholder="Type your reply here..."
            required
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
            <FaEnvelope className="text-blue-600 mt-1 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              An email notification will be sent to {selectedMessage?.senderName}, and they can reply to continue the conversation.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setShowReplyModal(false);
                setReply('');
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSendReply}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete Message?"
        message="Are you sure you want to delete this message? This will delete the entire conversation thread and cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Messages;
