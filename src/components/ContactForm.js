import React, { useState, useEffect } from 'react';
import { messageService } from '../services/dataService';
import { toast } from 'react-toastify';
import { FormField, TextArea } from './ui';
import { FaEnvelope, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';

const ContactForm = ({ userId, userName }) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    subject: '',
    message: '',
    website: '' // honeypot field
  });
  const [utm, setUtm] = useState({ source: '', medium: '', campaign: '' });

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      setUtm({
        source: params.get('utm_source') || '',
        medium: params.get('utm_medium') || '',
        campaign: params.get('utm_campaign') || ''
      });
    } catch (_) {}
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.senderName.trim() || !formData.senderEmail.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.senderEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await messageService.sendMessage(userId, {
        ...formData,
        utmSource: utm.source,
        utmMedium: utm.medium,
        utmCampaign: utm.campaign,
        referrer: document.referrer || ''
      });
      setSubmitted(true);
      setTimeout(() => {
        setFormData({
          senderName: '',
          senderEmail: '',
          subject: '',
          message: ''
        });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
        <p className="text-gray-600">
          Thank you for reaching out. {userName} will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field (hidden from users, bots may fill) */}
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={handleChange}
          autoComplete="off"
          tabIndex="-1"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Your Name"
          name="senderName"
          value={formData.senderName}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />

        <FormField
          label="Your Email"
          name="senderEmail"
          type="email"
          value={formData.senderEmail}
          onChange={handleChange}
          placeholder="john@example.com"
          required
        />
      </div>

      <FormField
        label="Subject"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        placeholder="What is this about?"
      />

      <TextArea
        label="Message"
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Tell me about your project, question, or collaboration proposal..."
        rows={5}
        required
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
        <FaEnvelope className="text-blue-600 mt-1 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          Your message will be sent to {userName}'s email and they will receive a notification.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full inline-flex items-center justify-center disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Sending...
          </>
        ) : (
          <>
            <FaPaperPlane className="mr-2" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
};

export default ContactForm;
