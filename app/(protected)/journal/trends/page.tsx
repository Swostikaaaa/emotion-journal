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

  const pageStyle = {
    background: `
      radial-gradient(circle at 20% 20%, #ede9fe 0%, transparent 40%),
      radial-gradient(circle at 80% 30%, #fce7f3 0%, transparent 40%),
      radial-gradient(circle at 50% 80%, #e0e7ff 0%, transparent 40%),
      linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)
    `
  };

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

  // Group small emotions – also returns the list of names that went into "Other"
  const groupSmallEmotions = (emotionMap: Record<string, number>, maxBars = 8) => {
    const sorted = Object.entries(emotionMap).sort((a, b) => b[1] - a[1]);
    if (sorted.length <= maxBars) {
      return { chartData: sorted.map(([name, count]) => ({ name, count })), otherEmotions: [] };
    }
    const top = sorted.slice(0, maxBars - 1);
    const otherEntries = sorted.slice(maxBars - 1);
    const otherCount = otherEntries.reduce((sum, [, count]) => sum + count, 0);
    const otherEmotionsList = otherEntries.map(([name]) => name);
    return {
      chartData: [...top.map(([name, count]) => ({ name, count })), { name: 'Other', count: otherCount }],
      otherEmotions: otherEmotionsList
    };
  };

  const getTopEmotions = (emotionMap: Record<string, number>, topN = 5) => {
    return Object.entries(emotionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([name]) => name);
  };

  // Enhanced weekly summary with more emotion prompts
  const getMeaningfulWeeklySummary = (emotionCounts: Record<string, number>, dailyData: any[]) => {
    if (!emotionCounts || Object.keys(emotionCounts).length === 0) {
      return "Keep journaling to see your emotional flow ✨";
    }
    let dominant = '';
    let maxCount = 0;
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominant = emotion;
      }
    }
    const prompts: Record<string, string> = {
      joy: "What brought you joy? Keep nurturing those moments.",
      sadness: "It's okay to feel sad. Have you been able to rest and be kind to yourself?",
      anger: "Anger often signals a boundary being crossed. What might need to shift?",
      fear: "Fear can protect us. Is there a small step you could take to feel safer?",
      love: "Your heart is full – who or what are you grateful for?",
      surprise: "Life threw you a curveball. How did you adapt?",
      neutral: "A balanced week. Small moments of presence can build peace.",
      anxious: "Anxiety may be asking you to slow down. Have you taken deep breaths?",
      calm: "You found stillness – remember this feeling when stress comes.",
      hopeful: "Hope is a quiet power. What are you looking forward to?",
      grateful: "Gratitude rewires the brain. Keep noticing the small gifts.",
      lonely: "Feeling lonely doesn't mean you're alone. Could you reach out to someone?",
      proud: "Celebrate yourself – you earned that pride!",
      confused: "Clarity comes with time. Journaling might help untangle thoughts.",
      overwhelmed: "Overwhelm often means too much at once. What can you let go of?",
      tired: "Rest is productive. Listen to your body this week.",
      excited: "Your excitement is contagious! Channel it into something creative.",
      frustrated: "Frustration can spark change. What's one thing you could adjust?",
      grief: "Grief is love with nowhere to go. Be gentle with yourself.",
      contentment: "Contentment is a quiet gift. What small moment made you feel at ease?",
      
    };
    const reflection = prompts[dominant] || "Keep journaling to see your emotional flow✨";
    return `This week your dominant feeling was ${dominant} — ${reflection}`;
  };

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
          <Link href="/journal" className="inline-flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full font-semibold text-indigo-600 hover:bg-white transition mb-8">← Back to Journal</Link>
          <div className="p-14" style={cardStyle}>
            <div className="text-6xl mb-4">🌿</div>
            <h1 className="text-3xl font-bold text-indigo-900 mb-2">Your space is empty</h1>
            <p className="text-indigo-700 mb-6">Start journaling to discover your emotional patterns.</p>
            <Link href="/journal/new" className="bg-indigo-400 hover:bg-indigo-500 text-white px-6 py-3 rounded-full transition">Write First Entry</Link>
          </div>
        </div>
      </main>
    );
  }

  const { emotionCounts, topicCounts, dailyData } = data;

  // Group emotions for bar chart
  const { chartData: emotionChart, otherEmotions } = groupSmallEmotions(emotionCounts, 8);
  const topicChart = Object.entries(topicCounts).map(([name, count]) => ({ name, count }));

  const topEmotions = getTopEmotions(emotionCounts, 5);
  const filteredDailyData = dailyData?.map((day: any) => {
    const filtered: any = { date: day.date };
    topEmotions.forEach(emotion => {
      if (day[emotion] !== undefined) filtered[emotion] = day[emotion];
    });
    return filtered;
  }) || [];

  const weeklySummaryText = getMeaningfulWeeklySummary(emotionCounts, dailyData);

  // Create a subtitle for the bar chart if "Other" exists
  const otherSubtitle = otherEmotions.length > 0 
    ? `(Other includes: ${otherEmotions.join(', ')})` 
    : "";

  return (
    <main className="min-h-screen py-12 px-4 relative overflow-hidden" style={pageStyle}>
      <div className="absolute w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-40 top-10 left-10 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-40 bottom-10 right-10 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30 top-1/2 left-1/2"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <Link href="/journal" className="inline-flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full font-semibold text-indigo-600 hover:bg-white transition mb-8">← Back to Journal</Link>

        <h1 className="text-4xl font-bold text-indigo-900 text-center mb-2">Your Emotional Landscape</h1>
        <p className="text-center text-indigo-700 mb-8">Gentle insights into your mind 🌿</p>

        <div className="p-6 mb-8 text-center" style={cardStyle}>
          <h2 className="text-xl font-semibold text-indigo-900 mb-2">This Week's Snapshot</h2>
          <p className="text-indigo-700">{weeklySummaryText}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* BAR CHART with grouping info */}
          <div className="p-6" style={cardStyle}>
            <h2 className="text-lg font-semibold text-indigo-900 mb-1">
              Emotion Breakdown
            </h2>
            {otherSubtitle && (
              <p className="text-xs text-indigo-600 mb-4">{otherSubtitle}</p>
            )}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emotionChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#a78bfa" radius={[10, 10, 0, 0]} isAnimationActive={true} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PIE CHART */}
          <div className="p-6" style={cardStyle}>
            <h2 className="text-lg font-semibold text-indigo-900 mb-4">Top Topics</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={topicChart} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} isAnimationActive={true} animationDuration={900} label>
                  {topicChart.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LINE CHART with dynamic top count */}
        {filteredDailyData && filteredDailyData.length > 0 && (
          <div className="p-6" style={cardStyle}>
            <h2 className="text-lg font-semibold text-indigo-900 mb-4">
              Emotional Trends (30 Days) – Top {topEmotions.length} Most Frequent Emotions
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip /><Legend />
                {topEmotions.map((emotion, idx) => (
                  <Line key={emotion} type="monotone" dataKey={emotion} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} isAnimationActive={true} animationDuration={900} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </main>
  );
}