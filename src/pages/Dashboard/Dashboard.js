import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { messageService } from '../../services/dataService';
import {
  FaHome,
  FaBriefcase,
  FaGraduationCap,
  FaProjectDiagram,
  FaTools,
  FaEnvelope,
  FaCalendar,
  FaChartLine,
  FaPalette,
  FaSignOutAlt,
  FaUser,
  FaLink,
} from 'react-icons/fa';

// Dashboard pages
import Overview from './Overview';
import Projects from './Projects';
import Education from './Education';
import Experience from './Experience';
import Skills from './Skills';
import SocialLinks from './SocialLinks';
import Messages from './Messages';
import Meetings from './Meetings';
import Calendar from './Calendar';
import Habits from './Habits';
import Settings from './Settings';
import Analytics from './Analytics';
import Newsletter from './Newsletter';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const navigation = [
    { name: 'Overview', path: '/dashboard', icon: FaHome },
    { name: 'Projects', path: '/dashboard/projects', icon: FaProjectDiagram },
    { name: 'Experience', path: '/dashboard/experience', icon: FaBriefcase },
    { name: 'Education', path: '/dashboard/education', icon: FaGraduationCap },
    { name: 'Skills', path: '/dashboard/skills', icon: FaTools },
    { name: 'Social Links', path: '/dashboard/social', icon: FaLink },
    { name: 'Messages', path: '/dashboard/messages', icon: FaEnvelope },
    { name: 'Meetings', path: '/dashboard/meetings', icon: FaCalendar },
    { name: 'Calendar Sync', path: '/dashboard/calendar', icon: FaCalendar },
    { name: 'Newsletter', path: '/dashboard/newsletter', icon: FaEnvelope },
    { name: 'Habits', path: '/dashboard/habits', icon: FaChartLine },
    { name: 'Analytics', path: '/dashboard/analytics', icon: FaChartLine },
    { name: 'Settings', path: '/dashboard/settings', icon: FaPalette },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    let mounted = true;
    const fetchUnread = async () => {
      try {
        const res = await messageService.getUnreadCount();
        if (mounted && typeof res.count === 'number') setUnreadCount(res.count);
      } catch (e) {
        // silent fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed inset-y-0 left-0 z-50 overflow-y-auto">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary-600">Portfolio</h1>
          <p className="text-sm text-gray-600 mt-1">Admin Dashboard</p>
        </div>

        <nav className="p-4 pb-32">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="flex items-center">
                    {item.name}
                    {item.name === 'Messages' && unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center text-xs font-semibold bg-red-100 text-red-700 rounded-full px-2 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t fixed bottom-0 left-0 w-64 bg-white">
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <FaUser className="text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/education" element={<Education />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/social" element={<SocialLinks />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
