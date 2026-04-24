import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Helper: get the authenticated user's ID from the session
async function getUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

// Helper: call Groq API to detect emotion and generate a short empathetic summary
async function detectEmotion(text: string): Promise<{ emotion: string; summary: string }> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return { emotion: 'neutral', summary: '' };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{
          role: 'user',
          content: `You are an empathetic emotion detection expert for a journaling app. Analyze this journal entry carefully.

Return ONLY a JSON object in this exact format with no extra text:
{"emotion": "one_emotion_word", "summary": "one warm empathetic sentence acknowledging their feelings"}

Rules:
- emotion: single word that best captures the PRIMARY feeling (can be any emotion: joy, sadness, anger, fear, anxiety, loneliness, gratitude, pride, excitement, grief, frustration, hope, guilt, contentment, overwhelmed, etc.)
- summary: 1 sentence that warmly acknowledges ALL the feelings mentioned, especially if mixed
- Be empathetic and human in the summary

Journal entry: ${text.slice(0, 800)}`
        }],
        max_tokens: 100
      }),
    });

    const result = await response.json();
    const raw = result?.choices?.[0]?.message?.content?.trim();
    const parsed = JSON.parse(raw);
    return {
      emotion: parsed.emotion?.toLowerCase() || 'neutral',
      summary: parsed.summary || ''
    };
  } catch (err) {
    console.error('Groq detection failed:', err);
    return { emotion: 'neutral', summary: '' };
  }
}

// GET handler: fetch all journal entries for the authenticated user
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(entries);
}

// POST handler: create a new journal entry, detect emotion & summary, save to database
export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, content, subject } = await request.json();
  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
  }

  const { emotion: detectedEmotion, summary: emotionSummary } = await detectEmotion(content);
  const topicsString = (subject && subject.trim() !== '') ? subject.trim() : 'General';

  const entry = await prisma.journalEntry.create({
    data: { title, content, emotion: detectedEmotion, topics: topicsString, userId },
  });

  return NextResponse.json({ ...entry, detectedEmotion, emotionSummary }, { status: 201 });
}