import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { portfolioService, projectService, messageService, newsletterService } from '../../services/dataService';
import { FaEye, FaProjectDiagram, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';

const PUBLIC_SITE_URL = process.env.REACT_APP_PUBLIC_URL || window.location.origin;

const Overview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    unreadMessages: 0,
    totalMessages: 0,
    repliedMessages: 0,
    archivedMessages: 0,
    subscribers: 0,
    autoresponder: false,
  });
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [portfolioData, projectsData, messagesData, msgStats, subs] = await Promise.all([
        portfolioService.getMy(),
        projectService.getMy(),
        messageService.getUnreadCount(),
        messageService.getStats(),
        newsletterService.listSubscribers(),
      ]);

      setPortfolio(portfolioData.data);
      setPortfolio(portfolioData.data);
      setStats({
        projects: projectsData.count,
        unreadMessages: messagesData.count,
        totalMessages: msgStats?.data?.total || 0,
        repliedMessages: msgStats?.data?.replied || 0,
        archivedMessages: msgStats?.data?.archived || 0,
        subscribers: Array.isArray(subs?.data) ? subs.data.length : 0,
        autoresponder: !!portfolioData?.data?.autoresponderEnabled,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.fullName}!</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your portfolio</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.projects}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FaProjectDiagram className="text-primary-600 text-xl" />
            </div>
          </div>
          <Link
            to="/dashboard/projects"
            className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Manage Projects →
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Unread Messages</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.unreadMessages}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaEnvelope className="text-green-600 text-xl" />
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Messages</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalMessages}</p>
                  <p className="text-sm text-gray-600 mt-1">Replied: {stats.repliedMessages} • Archived: {stats.archivedMessages}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaEnvelope className="text-purple-600 text-xl" />
                </div>
              </div>
              <Link
                to="/dashboard/messages"
                className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Manage Inbox →
              </Link>
            </div>
          </div>
          <Link
            to="/dashboard/messages"
            className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View Messages →
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Portfolio Status</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {portfolio?.isPublished ? 'Published' : 'Draft'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaEye className="text-blue-600 text-xl" />
            </div>
          </div>
          <a
            href={`${PUBLIC_SITE_URL}/${user?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center"
          >
            View Portfolio <FaExternalLinkAlt className="ml-2 text-xs" />
          </a>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/dashboard/projects"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <FaProjectDiagram className="text-2xl text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Add Project</h3>
            <p className="text-sm text-gray-600 mt-1">Showcase your work</p>
          </Link>


        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Subscribers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.subscribers}</p>
              <p className="text-sm text-gray-600 mt-1">Auto-Responder: {stats.autoresponder ? 'On' : 'Off'}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FaEye className="text-indigo-600 text-xl" />
            </div>
          </div>
          <Link
            to="/dashboard/settings"
            className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Configure Messaging →
          </Link>
        </div>
          <Link
            to="/dashboard/experience"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <FaProjectDiagram className="text-2xl text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Add Experience</h3>
            <p className="text-sm text-gray-600 mt-1">Update work history</p>
          </Link>

          <Link
            to="/dashboard/meetings"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <FaProjectDiagram className="text-2xl text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Schedule Meeting</h3>
            <p className="text-sm text-gray-600 mt-1">Manage your calendar</p>
          </Link>

          <Link
            to="/dashboard/settings"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <FaProjectDiagram className="text-2xl text-primary-600 mb-2" />
            <h3 className="font-medium text-gray-900">Customize Theme</h3>
            <p className="text-sm text-gray-600 mt-1">Personalize your portfolio</p>
          </Link>
        </div>
      </div>

      {/* Portfolio URL */}
      <div className="card mt-8 bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your Portfolio URL</h2>
        <p className="text-gray-600 mb-4">Share this link with potential employers and clients</p>
        <div className="flex items-center space-x-2">
          <code className="flex-1 bg-white px-4 py-2 rounded-lg text-primary-600 font-medium">
            {PUBLIC_SITE_URL}/{user?.username}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${PUBLIC_SITE_URL}/${user?.username}`);
              alert('Copied to clipboard!');
            }}
            className="btn-primary"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;
