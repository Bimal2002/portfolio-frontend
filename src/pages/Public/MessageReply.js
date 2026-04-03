import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageService } from '../../services/dataService';
import { toast } from 'react-toastify';
import { TextArea } from '../../components/ui';
import FileUpload from '../../components/FileUpload';
import { FaEnvelope, FaPaperPlane, FaUser, FaCheckCircle, FaExclamationCircle, FaFilePdf } from 'react-icons/fa';

const MessageReply = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMessageThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchMessageThread = async () => {
    try {
      setLoading(true);
      const response = await messageService.getByToken(token);
      setMessage(response.data);
    } catch (error) {
      setError('Invalid or expired message link');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();

    if (!reply.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setSending(true);
    try {
      const payload = { message: reply };
      if (attachment) payload.attachments = [attachment];
      await messageService.replyByToken(token, payload);
      setSubmitted(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      toast.error('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <FaExclamationCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reply Sent!</h1>
          <p className="text-gray-600">
            Your reply has been sent successfully. The portfolio owner will receive a notification and can continue the conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <FaEnvelope className="text-5xl text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reply to Conversation</h1>
          <p className="text-gray-600">Continue your conversation below</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Conversation Thread</h2>
          
          <div className="space-y-4 mb-6">
            {/* Original Message */}
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-l-blue-500">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <FaUser className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">You</p>
                  <p className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Subject:</strong> {message.subject || 'No Subject'}
              </p>
              <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
            </div>

            {/* All Replies */}
            {message.replies && message.replies.map((r, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
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
                      {r.sender === 'visitor' && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{r.message}</p>
                {r.attachments && r.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {r.attachments.map((att, i) => (
                      <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 bg-gray-50 rounded border hover:bg-gray-100 text-sm">
                        <FaFilePdf className="text-red-500 mr-2" />
                        <span className="truncate">{att.name || 'Attachment'}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reply Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Send Your Reply</h3>
          
          <form onSubmit={handleSendReply} className="space-y-4">
            <TextArea
              label="Your Message"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={6}
              placeholder="Type your reply here..."
              required
            />

            <FileUpload
              label="Attach a file (optional)"
              type="any"
              maxSize={10}
              showPreview={false}
              onUploadComplete={(data) => setAttachment({ url: data?.url, name: data?.originalName || 'Attachment', type: data?.format, size: data?.size })}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
              <FaEnvelope className="text-blue-600 mt-1 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Your reply will be sent via email, and the conversation will continue.
              </p>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="btn-primary w-full disabled:opacity-50"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-2 inline" />
                  Send Reply
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessageReply;
