// app/api/analytics/route.ts
// This API endpoint provides aggregated emotion and topic data for the analytics page.
// It calculates emotion counts, topic counts, daily entry frequency, and a weekly summary.
// The daily entry count is a simple time series (date, count) for the writing frequency line chart.

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

  // Date range: last 30 days (or from first entry)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const entries = await prisma.journalEntry.findMany({
    where: { userId, createdAt: { gte: thirtyDaysAgo } },
    select: { emotion: true, topics: true, createdAt: true },
  });

  // 1. Emotion counts (overall)
  const emotionCounts: Record<string, number> = {};
  // 2. Topic counts
  const topicCounts: Record<string, number> = {};
  // 3. Daily raw emotion counts (for stacked bar – not used directly here, but kept for compatibility)
  const dailyRaw: Record<string, Record<string, number>> = {};
  // 4. Daily entry count (for frequency line chart)
  const dailyEntryCount: Record<string, number> = {};

  for (const entry of entries) {
    // Emotion counts
    emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    // Topic counts
    if (entry.topics) {
      entry.topics.split(',').forEach(t => {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      });
    }
    // Daily emotion aggregation (for stacked bar if needed)
    const day = entry.createdAt.toISOString().split('T')[0];
    if (!dailyRaw[day]) dailyRaw[day] = {};
    dailyRaw[day][entry.emotion] = (dailyRaw[day][entry.emotion] || 0) + 1;
    // Daily entry count
    dailyEntryCount[day] = (dailyEntryCount[day] || 0) + 1;
  }

  // Build continuous date range from earliest entry to latest (or last 30 days)
  let startDate = thirtyDaysAgo;
  let endDate = new Date();
  if (entries.length > 0) {
    const dates = entries.map(e => new Date(e.createdAt));
    startDate = new Date(Math.min(...dates.map(d => d.getTime())));
    endDate = new Date(Math.max(...dates.map(d => d.getTime())));
  }

  // Create array for writing frequency line chart (date, count)
  const frequencyData: { date: string; count: number }[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    frequencyData.push({
      date: dateStr,
      count: dailyEntryCount[dateStr] || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  // Weekly summary
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEntries = entries.filter(e => new Date(e.createdAt) >= weekAgo);
  const weekEmotions: Record<string, number> = {};
  weekEntries.forEach(e => { weekEmotions[e.emotion] = (weekEmotions[e.emotion] || 0) + 1; });
  let weeklyMessage = 'No entries this week.';
  if (weekEntries.length > 0) {
    const topEmotion = Object.entries(weekEmotions).sort((a, b) => b[1] - a[1])[0];
    weeklyMessage = `This week you felt mostly "${topEmotion[0]}" (${topEmotion[1]} times). Keep going!`;
  }

  return NextResponse.json({
    emotionCounts,
    topicCounts,
    frequencyData,        // for the writing frequency line chart
    weeklySummary: { message: weeklyMessage }
  });
}