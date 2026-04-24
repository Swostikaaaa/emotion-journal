// Import Next.js server utilities for handling API responses
import { NextResponse } from 'next/server';

// Import authentication function from NextAuth.js route configuration.
import { auth } from '@/app/api/auth/[...nextauth]/route';

// Import Prisma client instance for database operations
import { prisma } from '@/lib/prisma';

/**
 * Helper function to retrieve the authenticated user's ID.
 * Calls the auth() function to get the current session and extracts the user ID.
 * If no session or user ID exists, returns null (unauthenticated).
 * @returns {Promise<string|null>} The authenticated user's ID or null
 */
async function getUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

/**
 * Analyzes the emotional content of a journal entry using Groq API (Llama 3.1 8B model).
 * Sends the journal text to the LLM with a structured prompt requesting a JSON response
 * containing a single emotion word and an empathetic summary sentence.
 *
 * @param {string} text - The journal entry content (truncated to 800 chars for API efficiency)
 * @returns {Promise<{emotion: string, summary: string}>} Object with detected emotion and summary
 *
 * Error handling: If API key missing, request fails, or JSON parsing errors occur,
 * returns default neutral emotion and empty summary without breaking the main flow.
 */
async function detectEmotion(text: string): Promise<{ emotion: string; summary: string }> {
  try {
    // Retrieve the Groq API key from environment variables
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return { emotion: 'neutral', summary: '' };

    // Make a POST request to Groq's chat completions endpoint
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',  // Fast, efficient model for text analysis
        messages: [{
          role: 'user',
          content: `You are an empathetic emotion detection expert for a journaling app. Analyze this journal entry carefully.

Return ONLY a JSON object in this exact format with no extra text:
{"emotion": "one_emotion_word", "summary": "one warm empathetic sentence acknowledging their feelings"}

Rules:
- emotion: single word that best captures the PRIMARY feeling (can be any emotion: joy, sadness, anger, fear, anxiety, loneliness, gratitude, pride, excitement, grief, frustration, hope, guilt, contentment, overwhelmed, etc.)
- summary: 1 sentence that warmly acknowledges ALL the feelings mentioned, especially if mixed
- Be empathetic and human in the summary

Journal entry: ${text.slice(0, 800)}`  // Limit input length to avoid token overages
        }],
        max_tokens: 100  // Keep response compact – only the JSON needed
      }),
    });

    const result = await response.json();
    const raw = result?.choices?.[0]?.message?.content?.trim();
    const parsed = JSON.parse(raw);  // Parse the JSON string returned by the model
    return {
      emotion: parsed.emotion?.toLowerCase() || 'neutral',
      summary: parsed.summary || ''
    };
  } catch (err) {
    // Log error but don't throw – fall back to neutral emotion so the journal entry can still be saved
    console.error('Groq detection failed:', err);
    return { emotion: 'neutral', summary: '' };
  }
}

/**
 * GET /api/journal/[id]
 * Retrieves a single journal entry by ID, but only if it belongs to the authenticated user.
 * 
 * @param {Request} request - The incoming HTTP request object
 * @param {Object} params - Route parameter object containing the journal entry ID
 * @returns {NextResponse} JSON response with the entry data or error status
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Ensure user is authenticated
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Await the params promise to extract the journal entry ID
  const { id } = await params;

  // Find the journal entry only if it matches both the provided ID and the user's ID
  const entry = await prisma.journalEntry.findFirst({ where: { id, userId } });
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(entry);
}

/**
 * PUT /api/journal/[id]
 * Updates an existing journal entry. Requires title and content.
 * Automatically triggers emotion detection on the new content and updates the emotion and topics fields.
 *
 * @param {Request} request - Incoming request containing the updated title, content, subject (topics)
 * @param {Object} params - Route parameter object containing the journal entry ID
 * @returns {NextResponse} JSON response with updated entry plus emotion analysis results
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Authentication check
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { title, content, subject } = await request.json();  // Extract fields from request body

  // Validation: both title and content are mandatory
  if (!title || !content) return NextResponse.json({ error: 'Title and content required' }, { status: 400 });

  // Verify that the entry exists and belongs to the current user before updating
  const existing = await prisma.journalEntry.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Perform emotion analysis on the new content
  const { emotion: detectedEmotion, summary: emotionSummary } = await detectEmotion(content);

  // Set topics: use provided subject, default to 'General' if empty or whitespace only
  const topicsString = (subject && subject.trim() !== '') ? subject.trim() : 'General';

  // Update the journal entry in the database
  const updated = await prisma.journalEntry.update({
    where: { id },
    data: { title, content, emotion: detectedEmotion, topics: topicsString, updatedAt: new Date() },
  });

  // Return the updated entry along with the newly detected emotion and summary (for UI feedback)
  return NextResponse.json({ ...updated, detectedEmotion, emotionSummary });
}

/**
 * DELETE /api/journal/[id]
 * Deletes a journal entry only if it belongs to the authenticated user.
 *
 * @param {Request} request - Incoming HTTP request
 * @param {Object} params - Route parameter object containing the journal entry ID
 * @returns {NextResponse} JSON response confirming deletion or error
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate user
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Confirm ownership before attempting deletion
  const existing = await prisma.journalEntry.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Perform deletion
  await prisma.journalEntry.delete({ where: { id } });

  return NextResponse.json({ message: 'Deleted' });
}