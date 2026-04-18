import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

async function getUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const entries = await prisma.journalEntry.findMany({
    where: { userId, createdAt: { gte: thirtyDaysAgo } },
    select: { emotion: true, topics: true, createdAt: true },
  });

  const emotionCounts: Record<string, number> = {};
  const topicCounts: Record<string, number> = {};
  const dailyMap: Record<string, Record<string, number>> = {};

  for (const entry of entries) {
    emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    if (entry.topics) {
      entry.topics.split(',').forEach(t => { topicCounts[t] = (topicCounts[t] || 0) + 1; });
    }
    const day = entry.createdAt.toISOString().split('T')[0];
    if (!dailyMap[day]) dailyMap[day] = {};
    dailyMap[day][entry.emotion] = (dailyMap[day][entry.emotion] || 0) + 1;
  }

  const dailyData = Object.entries(dailyMap).map(([date, emotions]) => ({ date, ...emotions }));

  // Weekly summary (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEntries = entries.filter(e => new Date(e.createdAt) >= weekAgo);
  const weekEmotions: Record<string, number> = {};
  weekEntries.forEach(e => { weekEmotions[e.emotion] = (weekEmotions[e.emotion] || 0) + 1; });
  let weeklyMessage = 'No entries this week.';
  if (weekEntries.length > 0) {
    const topEmotion = Object.entries(weekEmotions).sort((a,b) => b[1]-a[1])[0];
    weeklyMessage = `This week you felt mostly "${topEmotion[0]}" (${topEmotion[1]} times). Keep going!`;
  }

  return NextResponse.json({ emotionCounts, topicCounts, dailyData, weeklySummary: { message: weeklyMessage } });
}
