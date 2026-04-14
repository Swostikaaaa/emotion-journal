'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewEntryPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please fill both title and content.');
      return;
    }
    const finalSubject = subject.trim() === '' ? 'General' : subject.trim();
    setSubmitting(true);
    try {
      const res = await fetch('/api/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, subject: finalSubject }),
      });
      if (!res.ok) throw new Error('Failed to save');
      router.push('/journal');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-3xl w-full glass-card p-8">
      <Link
            href="/journal"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 border-2 border-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-50 transition mb-8"
          >
            ← Back to Journal
          </Link>
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Write New Entry</h1>
        <p className="text-white/70 mb-6">Capture your thoughts, feelings, and experiences.</p>

        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              placeholder="What's on your mind?"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Subject (for analytics)</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g., Work, Health, Dreams, Daily Life..."
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <p className="text-xs text-white/50 mt-1">Leave empty to use "General"</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Your Journal Entry</label>
            <textarea
              rows={12}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              placeholder="Write anything... We'll detect emotion automatically."
              disabled={submitting}
            />
            <p className="text-xs text-white/50 mt-2">✨ Emotion is detected automatically. Subject is used for the analytics pie chart.</p>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/journal" className="px-6 py-2 rounded-full border border-white/30 text-white/80 hover:bg-white/10 transition">Cancel</Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold transition disabled:opacity-50"
            >
              <Save size={18} /> {submitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}