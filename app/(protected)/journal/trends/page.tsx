'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

type Analytics = {
  emotionCounts: Record<string, number>;
  topicCounts: Record<string, number>;
  dailyData: Record<string, any>[];
};

const emotionNames: Record<string, string> = {
  joy: 'Joy', sadness: 'Sadness', anger: 'Anger', fear: 'Fear', love: 'Love', surprise: 'Surprise', neutral: 'Neutral',
};

const emotionColors = {
  joy: '#10b981', sadness: '#3b82f6', anger: '#ef4444', fear: '#8b5cf6', love: '#ec4899', surprise: '#f59e0b', neutral: '#6b7280',
};

export default function TrendsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // Empty state (no entries)
  if (!data || Object.keys(data.emotionCounts).length === 0) {
    return (
      <main
        className="min-h-screen py-12 px-4"
        style={{
          background: 'linear-gradient(135deg, #1e1e2f 0%, #2a2a40 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 border-2 border-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-50 transition mb-8"
          >
            ← Back to Journal
          </Link>
          <div className="glass-card p-12" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-3xl font-bold text-white mb-2">No Data Yet</h1>
            <p className="text-white/90 mb-6">Write some journal entries to see your emotion and topic trends.</p>
            <Link href="/journal/new" className="bg-white/30 hover:bg-white/40 text-white px-6 py-2 rounded-full transition">Write Your First Entry</Link>
          </div>
        </div>
      </main>
    );
  }

  const { emotionCounts, topicCounts, dailyData } = data;

  const emotionChartData = Object.entries(emotionCounts).map(([emotion, count]) => ({
    name: emotionNames[emotion] || emotion,
    count,
    color: emotionColors[emotion as keyof typeof emotionColors] || '#8884d8',
  }));

  const topicChartData = Object.entries(topicCounts).map(([topic, count]) => ({
    name: topic,
    count,
  }));

  return (
    <main
      className="min-h-screen py-12 px-4"
      style={{
        background: 'linear-gradient(135deg, #1e1e2f 0%, #2a2a40 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 border-2 border-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-50 transition"
          >
            ← Back to Journal
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-3 drop-shadow">Mood & Topic Analytics</h1>
        <p className="text-center text-white/70 mb-12">See your emotional journey and what matters most to you.</p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Emotion Breakdown */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Emotion Breakdown</h2>
            <p className="text-white/50 text-sm mb-6">How you've been feeling lately</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emotionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
                <XAxis dataKey="name" tick={{ fill: '#fff' }} />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar dataKey="count" name="Entries" radius={[8,8,0,0]}>
                  {emotionChartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Topics - with fallback when empty */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Top Topics</h2>
            <p className="text-white/50 text-sm mb-6">What you write about most</p>
            {topicChartData.length === 0 ? (
              <div className="text-center py-12 text-white/70">
                No topics detected yet. Try writing about specific subjects like &quot;study&quot;, &quot;work&quot;, or &quot;family&quot;.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topicChartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {topicChartData.map((entry, idx) => <Cell key={idx} fill={['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'][idx % 5]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Emotion Trends Over Time */}
        {dailyData.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Emotion Trends Over Time</h2>
            <p className="text-white/50 text-sm mb-6">How your feelings evolve day by day</p>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#fff' }} tickFormatter={(v) => v?.split('-').slice(1).join('/')} />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                <Legend wrapperStyle={{ color: '#fff' }} />
                {Object.keys(emotionNames).map(emotion => (
                  <Line
                    key={emotion}
                    type="monotone"
                    dataKey={emotion}
                    name={emotionNames[emotion]}
                    stroke={emotionColors[emotion as keyof typeof emotionColors]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
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