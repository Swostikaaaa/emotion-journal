'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts'

type Analytics = {
  emotionCounts: Record<string, number>
  topicCounts: Record<string, number>
  dailyData: Record<string, any>[]
}

const emotionNames: Record<string, string> = {
  joy: 'Joy', sadness: 'Sadness', anger: 'Anger', fear: 'Fear', love: 'Love', surprise: 'Surprise', neutral: 'Neutral',
}

const emotionColors = {
  joy: '#10b981', sadness: '#3b82f6', anger: '#ef4444', fear: '#8b5cf6', love: '#ec4899', surprise: '#f59e0b', neutral: '#6b7280',
}

export default function TrendsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500">Loading your insights...</p>
        </div>
      </div>
    )
  }

  if (!data || Object.keys(data.emotionCounts).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/journal" className="text-indigo-600 hover:underline inline-block mb-8">← Back to Journal</Link>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">No Data Yet</h1>
            <p className="text-gray-500 mb-6">Write some journal entries to see your emotion and topic trends.</p>
            <Link href="/journal/new" className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition">
              Write Your First Entry
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { emotionCounts, topicCounts, dailyData } = data

  const emotionChartData = Object.entries(emotionCounts).map(([emotion, count]) => ({
    name: emotionNames[emotion] || emotion,
    count,
    color: emotionColors[emotion as keyof typeof emotionColors] || '#8884d8',
  }))

  const topicChartData = Object.entries(topicCounts).map(([topic, count]) => ({
    name: topic,
    count,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
        <Link
  href="/journal"
  className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-indigo-600 px-4 py-2 rounded-full shadow-sm hover:bg-indigo-50 hover:shadow-md transition mb-8"
>
  ← Back to Journal
</Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center mb-3">
          Mood & Topic Analytics
        </h1>
        <p className="text-center text-gray-500 mb-12">See your emotional journey and what matters most to you.</p>

        {/* Two column layout for charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Emotion Breakdown (Bar Chart) */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Emotion Breakdown</h2>
            <p className="text-gray-400 text-sm mb-6">How you've been feeling lately</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emotionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: '#4b5563' }} />
                <YAxis tick={{ fill: '#4b5563' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Bar dataKey="count" name="Entries" radius={[8,8,0,0]}>
                  {emotionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Topic Breakdown (Pie Chart) */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Top Topics</h2>
            <p className="text-gray-400 text-sm mb-6">What you write about most</p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topicChartData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {topicChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Trends Over Time (Line Chart) */}
        {dailyData.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 hover:shadow-lg transition mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Emotion Trends Over Time</h2>
            <p className="text-gray-400 text-sm mb-6">How your feelings evolve day by day</p>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(value) => value.split('-').slice(1).join('/')} />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend />
                {Object.keys(emotionNames).map(emotion => (
                  <Line
                    key={emotion}
                    type="monotone"
                    dataKey={emotion}
                    name={emotionNames[emotion]}
                    stroke={emotionColors[emotion as keyof typeof emotionColors]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Insight message */}
        <div className="text-center text-gray-500 text-sm mt-8 border-t border-gray-200 pt-8">
          ✨ Every emotion is a signal. Keep journaling to see patterns and grow.
        </div>
      </div>
    </div>
  )
}