'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import VoiceInput from '@/components/VoiceInput';

const EMOTIONS = [
  'joy', 'sadness', 'anger', 'fear', 'love', 'surprise', 'neutral',
  'anxious', 'calm', 'hopeful', 'grateful', 'lonely', 'proud',
  'confused', 'overwhelmed', 'tired', 'excited', 'peaceful', 'custom'
];

export default function EditEntryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [emotion, setEmotion] = useState('neutral');
  const [customEmotion, setCustomEmotion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    fetch(`/api/journal-entries/${id}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title || '');
        setContent(data.content || '');
        setSubject(data.topics || 'General');
        const storedEmotion = data.emotion;
        if (EMOTIONS.includes(storedEmotion)) {
          setEmotion(storedEmotion);
          if (storedEmotion === 'custom') setCustomEmotion(data.customEmotion || '');
        } else {
          setEmotion('custom');
          setCustomEmotion(storedEmotion);
        }
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
    const finalEmotion = emotion === 'custom' ? (customEmotion.trim() || 'neutral') : emotion;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/journal-entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmedTitle, content: trimmedContent, subject: finalSubject, emotion: finalEmotion }),
      });
      if (!res.ok) throw new Error('Update failed');
      router.push('/journal');  // redirect to journal page directly
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="max-w-3xl w-full glass-card p-8">
        <Link href={`/journal`} className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6"><ArrowLeft size={18} /> Back to Journal</Link>
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Edit Entry</h1>
        <p className="text-white/70 mb-6 text-center">Update your thoughts and feelings.</p>

        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-6">{error}</div>}

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
            <label className="block text-sm font-medium text-white/80 mb-1">How are you feeling?</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {EMOTIONS.map(emo => (
                <button key={emo} type="button" onClick={() => setEmotion(emo)} className={`px-3 py-1 rounded-full text-sm transition ${emotion === emo ? 'bg-indigo-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>{emo}</button>
              ))}
            </div>
            {emotion === 'custom' && (
              <input type="text" value={customEmotion} onChange={e => setCustomEmotion(e.target.value)} placeholder="Type your own emotion..." className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50" />
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-white/80">Your Journal Entry</label>
              <VoiceInput onTranscript={handleTranscript} isListening={isListening} setIsListening={setIsListening} />
            </div>
            <textarea rows={12} value={content} onChange={e => setContent(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition" placeholder="Write or speak your entry..." disabled={submitting} spellCheck={true} />
            <p className="text-xs text-white/50 mt-2">✨ Emotion will be saved as you selected. Voice input available.</p>
          </div>

          <div className="flex justify-end gap-3">
            <Link href={`/journal`} className="px-6 py-2 rounded-full border border-white/30 text-white/80 hover:bg-white/10 transition">Cancel</Link>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold transition disabled:opacity-50"><Save size={18} /> {submitting ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
