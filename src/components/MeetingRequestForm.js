import React, { useState, useEffect } from 'react';
import { messageService } from '../services/dataService';
import { toast } from 'react-toastify';
import { FormField, TextArea } from './ui';
import { FaCalendar, FaClock, FaVideo, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';

const MeetingRequestForm = ({ userId, userName }) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    preferredDate: '',
    preferredTime: '',
    meetingType: 'Video Call',
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

    if (!formData.senderName.trim() || !formData.senderEmail.trim() || !formData.preferredDate || !formData.preferredTime) {
      toast.error('Please fill in name, email, date, and time');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.senderEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const subject = `Meeting Request: ${formData.preferredDate} ${formData.preferredTime} (${formData.meetingType})`;
    const details = `Meeting Type: ${formData.meetingType}\nPreferred Date: ${formData.preferredDate}\nPreferred Time: ${formData.preferredTime}\n\nDetails:\n${formData.message || ''}`;

    setLoading(true);
    try {
      await messageService.sendMessage(userId, {
        senderName: formData.senderName,
        senderEmail: formData.senderEmail,
        subject,
        message: details,
        website: formData.website,
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
          preferredDate: '',
          preferredTime: '',
          meetingType: 'Video Call',
          message: ''
        });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      toast.error('Failed to request meeting. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h3>
        <p className="text-gray-600">
          Thank you. {userName} will confirm or propose a time.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field */}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          label="Preferred Date"
          name="preferredDate"
          type="date"
          value={formData.preferredDate}
          onChange={handleChange}
          required
          icon={FaCalendar}
        />
        <FormField
          label="Preferred Time"
          name="preferredTime"
          type="time"
          value={formData.preferredTime}
          onChange={handleChange}
          required
          icon={FaClock}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
          <div className="relative">
            <select
              name="meetingType"
              value={formData.meetingType}
              onChange={handleChange}
              className="input-field pr-10"
            >
              <option>Video Call</option>
              <option>Phone Call</option>
              <option>In-person</option>
              <option>Other</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {formData.meetingType === 'Video Call' && <FaVideo />}
              {formData.meetingType === 'Phone Call' && <FaPhone />}
              {formData.meetingType === 'In-person' && <FaMapMarkerAlt />}
            </div>
          </div>
        </div>
      </div>

      <TextArea
        label="Additional Details"
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Provide context, agenda, or relevant links..."
        rows={4}
      />

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
            Request Meeting
          </>
        )}
      </button>
    </form>
  );
};

export default MeetingRequestForm;
