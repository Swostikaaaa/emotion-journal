'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

export default function TrendsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 🌸 Ultra-light mental wellness background
  const pageStyle = {
    background: `
      radial-gradient(circle at 20% 20%, #ede9fe 0%, transparent 40%),
      radial-gradient(circle at 80% 30%, #fce7f3 0%, transparent 40%),
      radial-gradient(circle at 50% 80%, #e0e7ff 0%, transparent 40%),
      linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)
    `
  };

  // 🫧 Glass card style (Dribbble-level soft UI)
  const cardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.6)',
    borderRadius: '24px',
    boxShadow: '0 10px 40px rgba(99, 102, 241, 0.08)'
  };

  const COLORS = [
    '#a78bfa', '#c4b5fd', '#f9a8d4', '#f0abfc',
    '#93c5fd', '#86efac', '#fde68a', '#fca5a5'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={pageStyle}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  if (!data || Object.keys(data.emotionCounts).length === 0) {
    return (
      <main className="min-h-screen py-12 px-4" style={pageStyle}>
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full font-semibold text-indigo-600 hover:bg-white transition mb-8"
          >
            ← Back to Journal
          </Link>

          <div className="p-14" style={cardStyle}>
            <div className="text-6xl mb-4">🌿</div>
            <h1 className="text-3xl font-bold text-indigo-900 mb-2">
              Your space is empty
            </h1>
            <p className="text-indigo-700 mb-6">
              Start journaling to discover your emotional patterns.
            </p>
            <Link
              href="/journal/new"
              className="bg-indigo-400 hover:bg-indigo-500 text-white px-6 py-3 rounded-full transition"
            >
              Write First Entry
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { emotionCounts, topicCounts, dailyData, weeklySummary } = data;

  const emotionChart = Object.entries(emotionCounts).map(([name, count]) => ({ name, count }));
  const topicChart = Object.entries(topicCounts).map(([name, count]) => ({ name, count }));

  return (
    <main className="min-h-screen py-12 px-4 relative overflow-hidden" style={pageStyle}>
      
      {/* 🌸 Floating blobs */}
      <div className="absolute w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-40 top-10 left-10 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-40 bottom-10 right-10 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30 top-1/2 left-1/2"></div>

      <div className="max-w-6xl mx-auto relative z-10">

        <Link
          href="/journal"
          className="inline-flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full font-semibold text-indigo-600 hover:bg-white transition mb-8"
        >
          ← Back to Journal
        </Link>

        <h1 className="text-4xl font-bold text-indigo-900 text-center mb-2">
          Your Emotional Landscape
        </h1>
        <p className="text-center text-indigo-700 mb-8">
          Gentle insights into your mind 🌿
        </p>

        <div className="p-6 mb-8 text-center" style={cardStyle}>
          <h2 className="text-xl font-semibold text-indigo-900 mb-2">
            This Week's Snapshot
          </h2>
          <p className="text-indigo-700">
            {weeklySummary?.message || "Keep journaling to see your emotional flow ✨"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">

          {/* BAR CHART */}
          <div className="p-6" style={cardStyle}>
            <h2 className="text-lg font-semibold text-indigo-900 mb-4">
              Emotion Breakdown
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emotionChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#a78bfa"
                  radius={[10, 10, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={900}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PIE CHART */}
          <div className="p-6" style={cardStyle}>
            <h2 className="text-lg font-semibold text-indigo-900 mb-4">
              Top Topics
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topicChart}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  isAnimationActive={true}
                  animationDuration={900}
                  label
                >
                  {topicChart.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LINE CHART */}
        {dailyData && dailyData.length > 0 && (
          <div className="p-6" style={cardStyle}>
            <h2 className="text-lg font-semibold text-indigo-900 mb-4">
              Emotional Trends (30 Days)
            </h2>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip />
                <Legend />

                {Object.keys(emotionCounts).map((emotion, idx) => (
                  <Line
                    key={emotion}
                    type="monotone"
                    dataKey={emotion}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={900}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </main>
  );
}
