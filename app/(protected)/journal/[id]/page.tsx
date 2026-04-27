'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

// Type definition for a journal entry — includes summary field stored in DB
type Entry = {
  id: string;
  title: string;
  content: string;
  emotion: string;
  summary: string | null;   // AI-generated empathetic summary saved by Groq on create/edit
  topics: string | null;
  createdAt: string;
  updatedAt: string;
};

// Maps emotion labels to emoji icons for visual display
const emotionEmoji: Record<string, string> = {
  joy: '😊', sadness: '😢', anger: '😠', fear: '😨', love: '❤️', surprise: '😲', neutral: '😐',
  anxious: '😰', anxiety: '😰', calm: '😌', hopeful: '🙏', grateful: '🙏', gratitude: '🙏',
  lonely: '😔', loneliness: '😔', proud: '😎', pride: '😎', confused: '🤔', overwhelmed: '😫',
  tired: '😴', excited: '🤩', excitement: '🤩', peaceful: '😌', frustrated: '😤', frustration: '😤',
  grief: '😭', guilt: '😞', hope: '🌟', contentment: '😊', melancholic: '😔',
  anticipation: '🫣', relief: '😮‍💨', sorrow: '😢', inspired: '🤩'
};

// Maps emotion labels to Tailwind colour classes for the badge
const emotionColors: Record<string, string> = {
  joy: 'bg-green-100 text-green-800', sadness: 'bg-blue-100 text-blue-800',
  anger: 'bg-red-100 text-red-800', fear: 'bg-purple-100 text-purple-800',
  love: 'bg-pink-100 text-pink-800', surprise: 'bg-yellow-100 text-yellow-800',
  neutral: 'bg-gray-100 text-gray-800', overwhelmed: 'bg-orange-100 text-orange-800',
  anxiety: 'bg-purple-100 text-purple-800', gratitude: 'bg-green-100 text-green-800',
};

export default function ViewEntryPage() {
  const { id } = useParams();
  const router = useRouter();

  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);

  // summary: the empathetic AI feedback text shown in the sentiment panel
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // On page load: fetch the journal entry from the database.
  // If a summary is already stored (generated when entry was saved/edited),
  // load it directly — no Groq API call needed.
  useEffect(() => {
    fetch(`/api/journal-entries/${id}`)
      .then(res => res.json())
      .then(async (data: Entry) => {
        setEntry(data);
  
        // Always show panel on load
        setShowSummary(true);
  
        // If summary already exists → use it
        if (data.summary) {
          setSummary(data.summary);
          return;
        }
  
        // Otherwise fetch it automatically
        setSummaryLoading(true);
        try {
          const res = await fetch('/api/sentiment-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: data.content }),
          });
          const result = await res.json();
          setSummary(result.summary || 'Unable to generate feedback.');
        } catch {
          setSummary('Unable to generate feedback.');
        } finally {
          setSummaryLoading(false);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Called when user clicks the emotion badge.
  // If summary is already loaded from DB, just shows the panel — no API call.
  // Falls back to calling /api/sentiment-summary only for old entries
  // that were created before the summary field was added to the database.
  const handleEmotionClick = async () => {
    setShowSummary(true);

    // Summary already available (from DB or previous click) — nothing more to do
    if (summary || !entry) return;

    // Fallback: only reaches here for entries created before summary was stored in DB
    setSummaryLoading(true);
    try {
      const res = await fetch('/api/sentiment-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: entry.content }),
      });
      const data = await res.json();
      setSummary(data.summary || 'Unable to generate feedback.');
    } catch {
      setSummary('Unable to generate feedback.');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Handles permanent deletion of the journal entry with a confirmation prompt
  const handleDelete = async () => {
    if (!confirm('Delete this entry permanently?')) return;
    await fetch(`/api/journal-entries/${id}`, { method: 'DELETE' });
    router.push('/journal');
  };

  // Loading spinner while fetching entry from DB
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );

  // Entry not found state
  if (!entry) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-white/80 mb-4">Entry not found.</p>
        <Link href="/journal" className="text-white hover:underline">Back to Journal</Link>
      </div>
    </div>
  );

  return (
    <main
      className="min-h-screen py-12 px-4"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="max-w-3xl mx-auto">

        {/* Back navigation */}
        <Link href="/journal" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6">
          <ArrowLeft size={18} /> Back to Journal
        </Link>

        <div className="glass-card p-8">

          {/* Entry title and emotion badge */}
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-white">{entry.title}</h1>

            {/* Emotion badge — clicking toggles the sentiment feedback panel.
                The badge updates automatically when the entry is edited and saved,
                because the PUT handler re-runs Groq detection and stores the new
                emotion and summary in the database. */}
            <button
              onClick={handleEmotionClick}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm cursor-pointer hover:opacity-80 transition ${emotionColors[entry.emotion] || 'bg-indigo-100 text-indigo-800'}`}
            >
              <span>{emotionEmoji[entry.emotion] || '🔍'}</span>
              <span className="capitalize">{entry.emotion}</span>
              <span className="text-xs ml-1 opacity-60">tap ✨</span>
            </button>
          </div>

          {/* Sentiment feedback panel.
              Shown automatically on page load if summary exists in DB.
              Shows a loading pulse while fetching fallback summary for old entries.
              Displays the 800-character notice if the entry exceeds the analysis limit. */}
          {showSummary && (
            <div className="bg-white/20 border border-white/30 rounded-xl p-4 mb-6">
              <p className="text-white/60 text-xs mb-1 uppercase tracking-wide">Sentiment Feedback</p>

              {summaryLoading ? (
                // Shown only for old entries while fallback Groq call is in progress
                <p className="text-white/80 text-sm animate-pulse">Analysing your feelings...</p>
              ) : (
                <>
                  {/* The empathetic one-sentence summary from Groq */}
                  <p className="text-white italic text-sm">"{summary}"</p>

                  {/* Notice shown when entry content exceeds 800 characters.
                      Groq only analyses the first 800 characters in this case. */}
                  {entry.content.length > 800 && (
                    <p className="text-xs text-white/100 mt-2 italic">
                      Note: Sentiment analysis based on first 800 characters only.
                    </p>
                  )}
                </>
              )}

              {/* Close button hides the panel without clearing the summary */}
              <button
                onClick={() => setShowSummary(false)}
                className="text-white/50 text-xs mt-2 hover:text-white"
              >
                Close
              </button>
            </div>
          )}

          {/* Topics / subject tags */}
          {entry.topics && (
            <div className="flex flex-wrap gap-2 mb-6">
              {entry.topics.split(',').map(topic => (
                <span key={topic} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                  #{topic}
                </span>
              ))}
            </div>
          )}

          {/* Entry timestamps */}
          <p className="text-sm text-white/70 mb-6">
            {new Date(entry.createdAt).toLocaleString()}
            {entry.updatedAt !== entry.createdAt && (
              ` (updated ${new Date(entry.updatedAt).toLocaleString()})`
            )}
          </p>

          {/* Journal entry content */}
          <div className="bg-white/10 rounded-xl p-6">
            <p className="whitespace-pre-wrap text-white/90">{entry.content}</p>
          </div>

          {/* Action buttons — Edit and Delete */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-white/20">
            <Link
              href={`/journal/edit/${entry.id}`}
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full transition"
            >
              <Edit size={16} /> Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 bg-red-500/30 hover:bg-red-500/50 text-white px-4 py-2 rounded-full transition"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
