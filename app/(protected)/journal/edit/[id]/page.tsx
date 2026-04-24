'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import VoiceInput from '@/components/VoiceInput';

// Emoji map for detected emotions
const emotionEmoji: Record<string, string> = {
  joy: '😊', sadness: '😢', anger: '😠', fear: '😨', love: '❤️', surprise: '😲', neutral: '😐',
  anxious: '😰', anxiety: '😰', calm: '😌', hopeful: '🙏', grateful: '🙏', gratitude: '🙏',
  lonely: '😔', loneliness: '😔', proud: '😎', pride: '😎', confused: '🤔', overwhelmed: '😫',
  tired: '😴', excited: '🤩', excitement: '🤩', peaceful: '😌', frustrated: '😤', frustration: '😤',
  grief: '😭', guilt: '😞', hope: '🌟', contentment: '😊', melancholic: '😔'
};

export default function EditEntryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [detectedEmotion, setDetectedEmotion] = useState('');
  const [emotionSummary, setEmotionSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);

  // Load existing entry data
  useEffect(() => {
    fetch(`/api/journal-entries/${id}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title || '');
        setContent(data.content || '');
        setSubject(data.topics || 'General');
        setCurrentEmotion(data.emotion || 'neutral');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleTranscript = (text: string) => setContent(text);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title?.trim() || '';
    const trimmedContent = content?.trim() || '';
    if (!trimmedTitle || !trimmedContent) {
      setError('Please fill both fields.');
      return;
    }
    const finalSubject = subject.trim() === '' ? 'General' : subject.trim();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/journal-entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmedTitle, content: trimmedContent, subject: finalSubject }),
      });
      if (!res.ok) throw new Error('Update failed');
      const data = await res.json();
      // Show detected emotion and summary before redirecting
      setDetectedEmotion(data.detectedEmotion || '');
      setEmotionSummary(data.emotionSummary || '');
      setTimeout(() => router.push('/journal'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="max-w-3xl w-full glass-card p-8">
        <Link href="/journal" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6">
          <ArrowLeft size={18} /> Back to Journal
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Edit Entry</h1>
        <p className="text-white/70 mb-6 text-center">Update your thoughts and feelings.</p>

        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-6">{error}</div>}

        {/* Current emotion display */}
        {!detectedEmotion && (
          <div className="bg-white/10 text-white p-3 rounded-lg mb-6 text-center">
            Current emotion: {emotionEmoji[currentEmotion] || '🔍'} <strong className="capitalize">{currentEmotion}</strong>
            <p className="text-xs text-white/50 mt-1">Will be re-detected automatically when you save.</p>
          </div>
        )}

        {/* Detected emotion + summary shown after saving */}
        {detectedEmotion && (
          <div className="bg-white/20 border border-white/30 text-white p-4 rounded-xl mb-6 text-center space-y-1">
            <p className="text-lg font-semibold">
              ✨ Updated emotion: {emotionEmoji[detectedEmotion] || '🔍'} <span className="capitalize">{detectedEmotion}</span>
            </p>
            {emotionSummary && <p className="text-sm text-white/80 italic">"{emotionSummary}"</p>}
            <p className="text-xs text-white/50">Redirecting to journal...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition" disabled={submitting} />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Subject (for analytics)</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Work, Health, Dreams..." className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-white/80">Your Journal Entry</label>
              <VoiceInput onTranscript={handleTranscript} isListening={isListening} setIsListening={setIsListening} />
            </div>
            <textarea rows={12} value={content} onChange={e => setContent(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition" placeholder="Write or speak your entry..." disabled={submitting} spellCheck={true} />
            <p className="text-xs text-white/50 mt-2">✨ Emotion will be detected automatically when you save.</p>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/journal" className="px-6 py-2 rounded-full border border-white/30 text-white/80 hover:bg-white/10 transition">Cancel</Link>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold transition disabled:opacity-50">
              <Save size={18} /> {submitting ? 'Analysing your feelings...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
