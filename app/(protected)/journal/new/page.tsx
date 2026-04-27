'use client';

// React hooks for state management
import { useState } from 'react';

// Next.js router for navigation after saving entry
import { useRouter } from 'next/navigation';

// Link component for client-side navigation
import Link from 'next/link';

// Icons used in UI
import { ArrowLeft, Save } from 'lucide-react';

// Voice input component for speech-to-text journaling
import VoiceInput from '@/components/VoiceInput';

export default function NewEntryPage() {

  // ===== FORM STATE =====
  const [title, setTitle] = useState('');               // Journal title input
  const [content, setContent] = useState('');           // Journal content input
  const [subject, setSubject] = useState('');           // Category / topic (e.g. Work, Health)

  // ===== UI STATE =====
  const [submitting, setSubmitting] = useState(false);  // Loading state during save
  const [error, setError] = useState('');               // Error message display

  // ===== VOICE INPUT STATE =====
  const [isListening, setIsListening] = useState(false); // Microphone active/inactive

  // ===== EMOTION ANALYSIS STATE =====
  const [detectedEmotion, setDetectedEmotion] = useState(''); // AI detected emotion
  const [emotionSummary, setEmotionSummary] = useState('');   // AI empathetic summary

  const router = useRouter(); // Used to redirect user after saving

  /**
   * Handles transcript coming from VoiceInput component
   * and updates the journal content field.
   */
  const handleTranscript = (text: string) => setContent(text);

  /**
   * Handles form submission:
   * - Validates input
   * - Sends data to API
   * - Receives emotion analysis
   * - Redirects user after saving
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: ensure required fields are filled
    if (!title.trim() || !content.trim()) {
      setError('Please fill both title and content.');
      return;
    }

    // Default subject fallback
    const finalSubject = subject.trim() === '' ? 'General' : subject.trim();

    setSubmitting(true);

    try {
      // Send journal entry to backend API
      const res = await fetch('/api/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, subject: finalSubject }),
      });

      if (!res.ok) throw new Error('Failed to save');

      // Response contains detected emotion + summary from backend
      const data = await res.json();

      setDetectedEmotion(data.detectedEmotion || '');
      setEmotionSummary(data.emotionSummary || '');

      // Redirect user to journal page after short delay
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
        backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="max-w-3xl w-full glass-card p-8">

        {/* Back navigation */}
        <Link href="/journal" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6">
          <ArrowLeft size={18} /> Back to Journal
        </Link>

        {/* Page heading */}
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Write New Entry
        </h1>

        <p className="text-white/70 mb-6 text-center">
          Capture your thoughts, feelings, and experiences.
        </p>

        {/* Error message display */}
        {error && (
          <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Emotion result display after saving */}
        {detectedEmotion && (
          <div className="bg-white/20 border border-white/30 text-white p-4 rounded-xl mb-6 text-center space-y-1">
            <p className="text-lg font-semibold">
              ✨ Detected emotion: <span className="capitalize">{detectedEmotion}</span>
            </p>

            {/* AI-generated empathetic summary */}
            {emotionSummary && (
              <p className="text-sm text-white/80 italic">
                "{emotionSummary}"
              </p>
            )}

            {/* Redirect info */}
            <p className="text-xs text-white/50">Redirecting to journal...</p>
          </div>
        )}

        {/* Journal form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title input */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              placeholder="What's on your mind?"
              disabled={submitting}
            />
          </div>

          {/* Subject input (category for analytics) */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Subject (for analytics)
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g., Work, Health, Dreams..."
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <p className="text-xs text-white/50 mt-1">
              Leave empty to use "General"
            </p>
          </div>

          {/* Content input + voice input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-white/80">
                Your Journal Entry
              </label>

              {/* Voice input component */}
              <VoiceInput
                onTranscript={handleTranscript}
                isListening={isListening}
                setIsListening={setIsListening}
              />
            </div>

            {/* Text area for journal entry */}
            <textarea
              rows={12}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              placeholder="Write anything... or click the microphone to speak."
              disabled={submitting}
              spellCheck={true}
            />

            <p className="text-xs text-white/50 mt-2">
              ✨ Your emotion will be detected automatically when you save.
            </p>
          </div>

          {/* Form actions */}
          <div className="flex justify-end gap-3">

            {/* Cancel button */}
            <Link
              href="/journal"
              className="px-6 py-2 rounded-full border border-white/30 text-white/80 hover:bg-white/10 transition"
            >
              Cancel
            </Link>

            {/* Submit button */}
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