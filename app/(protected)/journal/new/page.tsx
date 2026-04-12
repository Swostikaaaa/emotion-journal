'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewEntryPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('Please fill both title and content.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      if (!res.ok) throw new Error('Failed to save')
      router.push('/journal')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Styled back button */}
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-indigo-600 px-4 py-2 rounded-full shadow-sm hover:bg-indigo-50 hover:shadow-md transition mb-8"
        >
          <ArrowLeft size={18} /> Back to Journal
        </Link>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Write New Entry
          </h1>
          <p className="text-gray-500 mb-6">Capture your thoughts, feelings, and experiences.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="What's on your mind?"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Journal Entry</label>
              <textarea
                rows={12}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Write anything... We'll detect emotion and topics automatically."
                disabled={submitting}
              />
              <p className="text-xs text-gray-400 mt-2">✨ At least 10 characters for accurate emotion detection.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link
                href="/journal"
                className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:shadow-lg hover:scale-105 transition disabled:opacity-50"
              >
                <Save size={18} />
                {submitting ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}