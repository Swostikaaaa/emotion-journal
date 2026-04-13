'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  emotion: string;
  topics: string | null;
  createdAt: string;
};

const emotionEmoji: Record<string, string> = {
  joy: '😊', sadness: '😢', anger: '😠', fear: '😨', love: '❤️', surprise: '😲', neutral: '😐',
};

const emotionColors: Record<string, string> = {
  joy: 'bg-green-100 text-green-800',
  sadness: 'bg-blue-100 text-blue-800',
  anger: 'bg-red-100 text-red-800',
  fear: 'bg-purple-100 text-purple-800',
  love: 'bg-pink-100 text-pink-800',
  surprise: 'bg-yellow-100 text-yellow-800',
  neutral: 'bg-gray-100 text-gray-800',
};

// Helper function to highlight search terms
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 text-gray-900">{part}</mark> : part
  );
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/journal-entries')
      .then(res => res.json())
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this entry permanently?')) return;
    await fetch(`/api/journal-entries/${id}`, { method: 'DELETE' });
    setEntries(entries.filter(e => e.id !== id));
  };

  const allTopics = new Set<string>();
  entries.forEach(entry => {
    if (entry.topics) {
      entry.topics.split(',').forEach(t => allTopics.add(t));
    }
  });
  const topicList = Array.from(allTopics).sort();

  const filteredEntries = entries.filter(entry => {
    if (filterTopic !== 'all' && (!entry.topics || !entry.topics.split(',').includes(filterTopic))) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const titleMatch = entry.title.toLowerCase().includes(query);
      const contentMatch = entry.content.toLowerCase().includes(query);
      if (!titleMatch && !contentMatch) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen py-12 px-4"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=2070&auto=format')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-indigo-600 px-4 py-2 rounded-full shadow-sm hover:bg-indigo-50 hover:shadow-md transition"
            >
              ← Back to Home
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full shadow-sm hover:bg-gray-100 transition"
            >
              ⚙️ Settings
            </Link>
          </div>
          <div className="flex gap-3">
            <Link
              href="/journal/new"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold shadow hover:shadow-md hover:scale-105 transition"
            >
              + Write New Entry
            </Link>
            <Link
              href="/journal/trends"
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-50 transition"
            >
              View Trends
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-300 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            My Journal
          </h1>
          <p className="text-gray-500">Every entry is a step toward understanding yourself.</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
  <button
    onClick={() => setFilterTopic('all')}
    className={`px-3 py-1 rounded-full text-sm transition ${filterTopic === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
  >
    All
  </button>
</div>
        </div>

        {/* Conditional content */}
        {entries.length === 0 && (
          <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl">
            <p className="text-gray-500">No journal entries yet. Start writing!</p>
          </div>
        )}
        {entries.length > 0 && filteredEntries.length === 0 && (
          <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl">
            <p className="text-gray-500">No entries match your search or filter.</p>
          </div>
        )}
        {entries.length > 0 && filteredEntries.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-800 line-clamp-1">
                      {highlightText(entry.title, searchQuery)}
                    </h2>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${emotionColors[entry.emotion] || 'bg-gray-100'}`}>
                      {emotionEmoji[entry.emotion] || '😐'} {entry.emotion}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">
                    {new Date(entry.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {highlightText(entry.content, searchQuery)}
                  </p>
                  {entry.topics && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {entry.topics.split(',').map(topic => (
                        <span key={topic} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">#{topic}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-100 p-3 flex gap-3 justify-end bg-gray-50">
                  <Link href={`/journal/${entry.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View</Link>
                  <Link href={`/journal/edit/${entry.id}`} className="text-gray-600 hover:text-gray-800 text-sm font-medium">Edit</Link>
                  <button onClick={() => deleteEntry(entry.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}