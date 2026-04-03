import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/dataService';
import { FaEye, FaCalendar, FaArrowUp, FaChartBar, FaExternalLinkAlt, FaGlobe } from 'react-icons/fa';
import api from '../../services/api';

const BarChart = ({ label, value, max }) => {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-primary-600 font-bold">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300" 
          style={{ width: `${width}%` }}
        ></div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, color }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200'
  };
  
  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <div className={`card border ${colors[color]} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <Icon className={`text-5xl ${iconColors[color]} opacity-20`} />
      </div>
    </div>
  );
};

const Analytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({ topReferrers: [], total: 0 });
  const [stats, setStats] = useState({
    totalVisits: 0,
    averageDaily: 0,
    maxDaily: 0,
    days: 0
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [res, detailsRes] = await Promise.all([
          analyticsService.getSummary(),
          api.get('/analytics/details')
        ]);
        
        const events = res.data || [];
        setData(events);

        // Calculate stats
        if (events.length > 0) {
          const visits = events.map(d => d.visits);
          const totalVisits = visits.reduce((sum, v) => sum + v, 0);
          const maxDaily = Math.max(...visits);
          const averageDaily = Math.round(totalVisits / events.length);

          setStats({
            totalVisits,
            averageDaily,
            maxDaily,
            days: events.length
          });
        }

        // Set details if available
        if (detailsRes.data && detailsRes.data.success) {
          setDetails(detailsRes.data.data);
        }
      } catch (e) {
        console.error('Error fetching analytics:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const max = data.reduce((m, d) => Math.max(m, d.visits), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Portfolio performance and visitor insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={FaEye}
          label="Total Visits"
          value={stats.totalVisits}
          color="blue"
        />
        <StatCard
          icon={FaArrowUp}
          label="Average Daily"
          value={stats.averageDaily}
          color="green"
        />
        <StatCard
          icon={FaChartBar}
          label="Peak Daily"
          value={stats.maxDaily}
          color="purple"
        />
        <StatCard
          icon={FaCalendar}
          label="Days Tracked"
          value={stats.days}
          color="orange"
        />
      </div>

      {/* Daily Visits Chart */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <FaChartBar className="text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900">Daily Visits</h2>
          <span className="text-gray-500 text-sm ml-auto">Last 30 days</span>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-12">
            <FaEye className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No visits recorded yet.</p>
            <p className="text-gray-500 text-sm mt-2">Visits will appear here once people view your portfolio</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chart */}
            <div className="overflow-x-auto pb-4">
              <div className="min-w-full space-y-3">
                {data.map(d => (
                  <BarChart 
                    key={d._id} 
                    label={new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    value={d.visits} 
                    max={max} 
                  />
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="border-t pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Highest Day</p>
                <p className="text-2xl font-bold text-primary-600">{max}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Average</p>
                <p className="text-2xl font-bold text-primary-600">{stats.averageDaily}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Days</p>
                <p className="text-2xl font-bold text-primary-600">{stats.days}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Visits</p>
                <p className="text-2xl font-bold text-primary-600">{stats.totalVisits}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      {data.length > 0 && (
        <>
          {/* Top Referrers */}
          {details.topReferrers && details.topReferrers.length > 0 && (
            <div className="mt-8">
              <div className="card">
                <div className="flex items-center space-x-2 mb-6">
                  <FaExternalLinkAlt className="text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Top Traffic Sources</h2>
                </div>
                <div className="space-y-3">
                  {details.topReferrers.map((ref, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center">
                        <FaGlobe className="text-gray-400 mr-3 text-lg" />
                        <div>
                          <p className="font-medium text-gray-900">{ref.referrer || 'Direct Traffic'}</p>
                          <p className="text-xs text-gray-500">Traffic source</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-600">{ref.visits}</p>
                        <p className="text-xs text-gray-500">{((ref.visits / stats.totalVisits) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Insights */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-2">📊 Insights</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Your portfolio has been visited <strong>{stats.totalVisits}</strong> times in the last 30 days</li>
              <li>✓ You're averaging <strong>{stats.averageDaily}</strong> visits per day</li>
              <li>✓ Your best performing day had <strong>{max}</strong> visits</li>
              {details.topReferrers && details.topReferrers.length > 0 && (
                <li>✓ Top traffic source: <strong>{details.topReferrers[0]?.referrer || 'Direct'}</strong> with <strong>{details.topReferrers[0]?.visits}</strong> visits</li>
              )}
              <li>✓ Share your portfolio link to increase visitor engagement</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
