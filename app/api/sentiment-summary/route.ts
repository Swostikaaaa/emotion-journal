// app/api/sentiment-summary/route.ts
// Dedicated endpoint to generate an empathetic sentiment summary for a journal entry
// Called when user clicks the emotion badge on the view page
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    if (!content) return NextResponse.json({ summary: '' }, { status: 400 });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ summary: 'API key not configured.' });

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
          content: `You are an empathetic journaling companion. Read this journal entry and write ONE warm, empathetic sentence that acknowledges ALL the feelings the person expressed, including any mixed or conflicting emotions. Be human, kind and validating.

Journal entry: ${content.slice(0, 800)}

Respond with ONLY the one sentence, no quotes, no extra text.`
        }],
        max_tokens: 80
      }),
    });

    const result = await response.json();
    const summary = result?.choices?.[0]?.message?.content?.trim() || '';
    return NextResponse.json({ summary });
  } catch (err) {
    console.error('Sentiment summary failed:', err);
    return NextResponse.json({ summary: 'Unable to generate feedback.' });
  }
}
