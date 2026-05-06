'use client';

import { useState } from 'react';          // Only useState needed – no refs/effects for voice
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import VoiceInput from '@/components/VoiceInput';

export default function NewEntryPage() {
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Voice input state (passed to VoiceInput component)
  const [isListening, setIsListening] = useState(false);

  // Emotion analysis results (shown after saving)
  const [detectedEmotion, setDetectedEmotion] = useState('');
  const [emotionSummary, setEmotionSummary] = useState('');

  const router = useRouter();

  /**
   * Handles each chunk of recognised speech from VoiceInput.
   * Because VoiceInput now sends only the *incremental* text (the new characters since the last chunk),
   * we can simply append it to the existing content.
   *
   * This preserves any text the user has typed (before or even during listening) and
   * builds the spoken sentence correctly without duplication.
   */
  const handleTranscript = (voiceText: string) => {
    setContent((prevContent) => prevContent + voiceText);
  };

  /**
   * Submits the journal entry to the API.
   * After successful save, shows the detected emotion and then redirects.
   */
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

      const data = await res.json();
      setDetectedEmotion(data.emotion || '');
      setEmotionSummary(data.summary || '');

      setTimeout(() => router.push('/journal'), 3000);
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
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-3xl w-full glass-card p-8">
        {/* Back button */}
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
        >
          <ArrowLeft size={18} /> Back to Journal
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2 text-center">Write New Entry</h1>
        <p className="text-white/70 mb-6 text-center">
          Capture your thoughts, feelings, and experiences.
        </p>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-6">{error}</div>
        )}

        {/* Show detected emotion and summary after save */}
        {detectedEmotion && (
          <div className="bg-white/20 border border-white/30 text-white p-4 rounded-xl mb-6 text-center space-y-1">
            <p className="text-lg font-semibold">
              ✨ Detected emotion: <span className="capitalize">{detectedEmotion}</span>
            </p>
            {emotionSummary && (
              <p className="text-sm text-white/80 italic">"{emotionSummary}"</p>
            )}
            <p className="text-xs text-white/50">Redirecting to journal...</p>
          </div>
        )}

        {/* Journal form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title field */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              placeholder="What's on your mind?"
              disabled={submitting}
            />
          </div>

          {/* Subject field */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Subject (for analytics)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Work, Health, Dreams..."
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <p className="text-xs text-white/50 mt-1">Leave empty to use "General"</p>
          </div>

          {/* Content area + VoiceInput button */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-white/80">
                Your Journal Entry
              </label>
              <VoiceInput
                onTranscript={handleTranscript}
                isListening={isListening}
                setIsListening={setIsListening}
              />
            </div>

            <textarea
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              placeholder="Write anything... or click the microphone to speak."
              disabled={submitting}
              spellCheck={true}
            />

            <p className="text-xs text-white/50 mt-2">
              ✨ Your emotion will be detected automatically when you save.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <Link
              href="/journal"
              className="px-6 py-2 rounded-full border border-white/30 text-white/80 hover:bg-white/10 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold transition disabled:opacity-50"
            >
              <Save size={18} />
              {submitting ? 'Analysing your feelings...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}