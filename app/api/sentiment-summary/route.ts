// app/api/sentiment-summary/route.ts
// Dedicated endpoint to generate an empathetic sentiment summary for a journal entry
// Called when user clicks the emotion badge on the view page

// Import NextResponse to create HTTP responses in Next.js API routes
import { NextResponse } from 'next/server';

// POST handler – accepts a request with a journal entry content and returns a one-sentence empathetic summary
export async function POST(request: Request) {
  try {
    // Parse the JSON body to extract the 'content' field (the journal entry text)
    const { content } = await request.json();
    
    // If no content is provided, return a 400 Bad Request response with an empty summary
    if (!content) return NextResponse.json({ summary: '' }, { status: 400 });

    // Retrieve the Groq API key from environment variables (must be set in .env.local)
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ summary: 'API key not configured.' });

    // Call the Groq Chat Completions API (compatible with OpenAI's API format)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,   // Authenticate using the API key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',        // Fast, small model suitable for short summarisation
        messages: [{
          role: 'user',
          content: `You are an empathetic journaling companion. Read this journal entry and write ONE warm, empathetic sentence that acknowledges ALL the feelings the person expressed, including any mixed or conflicting emotions. Be human, kind and validating.

Journal entry: ${content.slice(0, 800)}

Respond with ONLY the one sentence, no quotes, no extra text.`
        }],
        max_tokens: 80                         // Limit output to around 80 tokens (one sentence)
      }),
    });

    // Parse the JSON response from Groq
    const result = await response.json();
    // Extract the generated summary from the first choice's message content, default to empty string if missing
    const summary = result?.choices?.[0]?.message?.content?.trim() || '';
    
    // Return the summary as JSON
    return NextResponse.json({ summary });
  } catch (err) {
    // Log any unexpected errors (network issues, parsing errors, etc.)
    console.error('Sentiment summary failed:', err);
    // Return a fallback error message to the client
    return NextResponse.json({ summary: 'Unable to generate feedback.' });
  }
}