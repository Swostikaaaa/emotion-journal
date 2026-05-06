// Import NextResponse for creating HTTP responses in Next.js API routes
import { NextResponse } from 'next/server';
// Import the authentication helper to get the current session
import { auth } from '@/app/api/auth/[...nextauth]/route';
// Import the Prisma client instance to interact with the database
import { prisma } from '@/lib/prisma';

// Helper: get the authenticated user's ID from the session
async function getUserId() {
  // Call the auth() function to retrieve the current session
  const session = await auth();
  // Return the user ID if it exists, otherwise null (unauthenticated)
  return session?.user?.id || null;
}

// Helper: call Groq API to detect emotion and generate a short empathetic summary
async function detectEmotion(text: string): Promise<{ emotion: string; summary: string }> {
  try {
    // Retrieve the Groq API key from environment variables
    const apiKey = process.env.GROQ_API_KEY;
    // If no API key is configured, return neutral emotion and empty summary
    if (!apiKey) return { emotion: 'neutral', summary: '' };

    // Call the Groq chat completions endpoint (OpenAI-compatible)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,   // Authorize with the API key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',        // Small, fast model suitable for emotion detection
        messages: [{
          role: 'user',
          content: `You are an empathetic emotion detection expert for a journaling app. Analyze this journal entry carefully.

Return ONLY a JSON object in this exact format with no extra text:
{"emotion": "one_emotion_word", "summary": "one warm empathetic sentence acknowledging their feelings"}

Rules:
- emotion: single word that best captures the PRIMARY feeling (can be any emotion: joy, sadness, anger, fear, anxiety, loneliness, gratitude, pride, excitement, grief, frustration, hope, guilt, contentment, overwhelmed, etc.)
- summary: 1 sentence that warmly acknowledges ALL the feelings mentioned, especially if mixed
- Be empathetic and human in the summary

Journal entry: ${text.slice(0, 800)}`   // Limit input to 800 characters to avoid token limits
        }],
        max_tokens: 100                    // Enough for a short emotion word and a sentence
      }),
    });

    // Parse the response JSON from Groq
    const result = await response.json();
    // Extract the raw content from the first choice (the generated JSON string)
    const raw = result?.choices?.[0]?.message?.content?.trim();
    // Parse the JSON string into an object
    const parsed = JSON.parse(raw);
    // Return the emotion (lowercase) and summary, with fallbacks
    return {
      emotion: parsed.emotion?.toLowerCase() || 'neutral',
      summary: parsed.summary || ''
    };
  } catch (err) {
    // Log any errors (network, parsing, etc.) and return neutral fallback
    console.error('Groq detection failed:', err);
    return { emotion: 'neutral', summary: '' };
  }
}

// GET handler: fetch all journal entries for the authenticated user
export async function GET() {
  // Get the authenticated user's ID
  const userId = await getUserId();
  // If not authenticated, return 401 Unauthorized
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Query all journal entries belonging to this user, ordered by creation date (newest first)
  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  
  // Return the entries as JSON
  return NextResponse.json(entries);
}

// POST handler: create a new journal entry, detect emotion & summary, save to database
export async function POST(request: Request) {
  // Get the authenticated user's ID
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Parse the request body to extract title, content, and optional subject/topics
  const { title, content, subject } = await request.json();
  // Validate that both title and content are provided
  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
  }

  // Perform emotion detection and summary generation using the Groq API
  const { emotion: detectedEmotion, summary: emotionSummary } = await detectEmotion(content);
  // Determine the topics string: use provided subject if non-empty, otherwise default to 'General'
  const topicsString = (subject && subject.trim() !== '') ? subject.trim() : 'General';

  // Create a new journal entry in the database with the detected emotion and summary
  const entry = await prisma.journalEntry.create({
    data: { 
      title, 
      content, 
      emotion: detectedEmotion, 
      summary: emotionSummary, 
      topics: topicsString, 
      userId 
    },
  });
  
  // Return the created entry with HTTP 201 Created status
  return NextResponse.json(entry, { status: 201 });
}