// app/api/analytics/route.ts
// This API endpoint provides aggregated emotion and topic data for the analytics page.
// It calculates emotion counts, topic counts, daily emotion trends, and a weekly summary.

import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route'; // NextAuth helper to get current session
import { prisma } from '@/lib/prisma'; // Prisma client for database access

// Helper function to extract the logged-in user's ID from the session
async function getUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

// GET handler – returns analytics data for the last 30 days
export async function GET() {
  // 1. Authenticate the user
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Define the date range (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 3. Fetch all journal entries from the database for this user within the date range
  const entries = await prisma.journalEntry.findMany({
    where: { userId, createdAt: { gte: thirtyDaysAgo } },
    select: { emotion: true, topics: true, createdAt: true }, // only needed fields
  });

  // 4. Prepare data structures for aggregation
  const emotionCounts: Record<string, number> = {};     // e.g., { joy: 5, sadness: 2 }
  const topicCounts: Record<string, number> = {};       // e.g., { work: 3, health: 1 }
  const dailyMap: Record<string, Record<string, number>> = {}; // daily emotion counts

  // 5. Loop through each entry and aggregate
  for (const entry of entries) {
    // Count emotions
    emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;

    // Count topics (split comma-separated string)
    if (entry.topics) {
      entry.topics.split(',').forEach(t => {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      });
    }

    // Daily aggregation: group by date (YYYY-MM-DD)
    const day = entry.createdAt.toISOString().split('T')[0];
    if (!dailyMap[day]) dailyMap[day] = {};
    dailyMap[day][entry.emotion] = (dailyMap[day][entry.emotion] || 0) + 1;
  }

  // 6. Convert dailyMap to an array format suitable for Recharts line chart
  const dailyData = Object.entries(dailyMap).map(([date, emotions]) => ({ date, ...emotions }));

  // 7. Weekly summary (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEntries = entries.filter(e => new Date(e.createdAt) >= weekAgo);
  const weekEmotions: Record<string, number> = {};
  weekEntries.forEach(e => { weekEmotions[e.emotion] = (weekEmotions[e.emotion] || 0) + 1; });

  let weeklyMessage = 'No entries this week.';
  if (weekEntries.length > 0) {
    // Find the emotion with the highest count
    const topEmotion = Object.entries(weekEmotions).sort((a, b) => b[1] - a[1])[0];
    weeklyMessage = `This week you felt mostly "${topEmotion[0]}" (${topEmotion[1]} times). Keep going!`;
  }

  // 8. Return JSON response with all analytics data
  return NextResponse.json({
    emotionCounts,
    topicCounts,
    dailyData,
    weeklySummary: { message: weeklyMessage }
  });
}