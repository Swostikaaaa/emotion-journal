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

// Emoji map — falls back to 🔍 for any custom emotion not listed
const emotionEmoji: Record<string, string> = {
  joy: '😊', sadness: '😢', anger: '😠', fear: '😨', love: '❤️', surprise: '😲', neutral: '😐',
  anxious: '😰', anxiety: '😰', calm: '😌', hopeful: '🙏', grateful: '🙏', gratitude: '🙏',
  lonely: '😔', loneliness: '😔', proud: '😎', pride: '😎', confused: '🤔', overwhelmed: '😫',
  tired: '😴', excited: '🤩', excitement: '🤩', peaceful: '😌', frustrated: '😤', frustration: '😤',
  grief: '😭', guilt: '😞', hope: '🌟', contentment: '😊', melancholic: '😔', sorrow: '😢', relief: '😮‍💨', anticipation: '🫣'
};

// Highlight search matches in text
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => regex.test(part) ? <mark key={i} className="bg-yellow-200 text-gray-900">{part}</mark> : part);
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filterTopic, setFilterTopic] = useState<string>('all');
  // Track which entry's emotion popup is open (by entry id)
  const [openPopup, setOpenPopup] = useState<string | null>(null);
  // Track which entry should show the auto "click for feedback" popup (by entry id)
  const [autoPopup, setAutoPopup] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/journal-entries')
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        // For each entry, schedule an auto popup that disappears after 3 seconds
        const initialAuto: Record<string, boolean> = {};
        data.forEach((entry: JournalEntry) => {
          initialAuto[entry.id] = true;
          // Auto-hide after 12 seconds
          setTimeout(() => {
            setAutoPopup(prev => ({ ...prev, [entry.id]: false }));
          }, 12000);
        });
        setAutoPopup(initialAuto);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenPopup(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete permanently?')) return;
    await fetch(`/api/journal-entries/${id}`, { method: 'DELETE' });
    setEntries(entries.filter(e => e.id !== id));
  };

  const exportToCSV = async () => {
    if (entries.length === 0) { alert('No entries to export.'); return; }
    const Papa = (await import('papaparse')).default;
    const csv = Papa.unparse(entries.map(e => ({
      Date: new Date(e.createdAt).toLocaleDateString(),
      Title: e.title,
      Content: e.content,
      Emotion: e.emotion,
      Subject: e.topics
    })));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEntries = entries.filter(e => {
    if (filterTopic !== 'all' && (!e.topics || !e.topics.split(',').includes(filterTopic))) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!e.title.toLowerCase().includes(q) && !e.content.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <main className="min-h-screen py-12 px-4" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=2070&auto=format')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="max-w-6xl mx-auto">
        {/* Top navigation */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex gap-2">
            <Link href="/" className="inline-flex items-center gap-2 bg-white text-indigo-600 border-2 border-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-50 transition">← Back to Home</Link>
            <Link href="/settings" className="inline-flex items-center gap-2 bg-black/90 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-full hover:bg-white/30 transition">⚙️ Settings</Link>
          </div>
          <div className="flex gap-3">
            <Link href="/journal/new" className="bg-white/20 backdrop-blur-md text-black border border-white/30 px-4 py-2 rounded-full font-semibold hover:bg-white/30 transition">+ Write New Entry</Link>
            <Link href="/journal/trends" className="bg-white/20 backdrop-blur-md text-black border border-white/30 px-4 py-2 rounded-full font-semibold hover:bg-white/30 transition">View Trends</Link>
            <button onClick={exportToCSV} className="bg-white/20 backdrop-blur-md text-black border border-white/30 px-4 py-2 rounded-full font-semibold hover:bg-white/30 transition">📥 Export CSV</button>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="bg-black/90 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-full font-semibold hover:bg-white/30 transition">Logout</button>
          </div>
        </div>

        {/* Page title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">My Journal</h1>
          <p className="text-gray-800 font-medium bg-white/30 inline-block px-4 py-1 rounded-full backdrop-blur-sm">Every entry is a step toward understanding yourself.</p>
        </div>

        {/* Search bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input type="text" placeholder="🔍 Search by title or content..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 px-4 py-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800" />
          <div className="flex gap-2">
            <button onClick={() => setFilterTopic('all')} className={`px-3 py-1 rounded-full text-sm transition ${filterTopic === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'}`}>All</button>
          </div>
        </div>

        {/* Empty states */}
        {entries.length === 0 && <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl"><p className="text-gray-800">No journal entries yet. Start writing!</p></div>}
        {entries.length > 0 && filteredEntries.length === 0 && <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl"><p className="text-gray-800">No entries match your search.</p></div>}

        {/* Entry cards grid */}
        {filteredEntries.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-800 line-clamp-1">{highlightText(entry.title, searchQuery)}</h2>

                    {/* Clickable emotion badge — stops propagation so document click doesn't close it immediately */}
                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenPopup(openPopup === entry.id ? null : entry.id)}
                        className="text-sm px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                        title="Click view to see sentiment feedback"
                      >
                        {emotionEmoji[entry.emotion] || '🔍'} {entry.emotion}
                      </button>

                    

                      {/*  Auto popup to inform user about detailed feedback (disappears after 12s) */}
                      {autoPopup[entry.id] && (
                        <div className="absolute left-0 top-full mt-1 z-50 w-20 bg-yellow-50 border border-yellow-300 rounded-xl shadow-lg p-2 animate-pulse whitespace-normal">
                          <p className="text-xs font-medium text-yellow-800 text-center">
                            ✨ Click view for detailed feedback!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mt-1">{new Date(entry.createdAt).toLocaleDateString()}</p>
                  <p className="text-gray-600 line-clamp-3 mt-2">{highlightText(entry.content, searchQuery)}</p>
                  {entry.topics && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {entry.topics.split(',').map(t => <span key={t} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">#{t}</span>)}
                    </div>
                  )}
                </div>
                <div className="border-t p-3 flex gap-3 justify-end bg-gray-50">
                  <Link href={`/journal/${entry.id}`} className="text-indigo-600 text-sm">View</Link>
                  <Link href={`/journal/edit/${entry.id}`} className="text-gray-600 text-sm">Edit</Link>
                  <button onClick={() => deleteEntry(entry.id)} className="text-red-500 text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}