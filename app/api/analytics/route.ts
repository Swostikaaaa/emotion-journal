import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user.id;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = await prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { emotion: true, topics: true, createdAt: true },
    });

    // Emotion counts
    const emotionCounts: Record<string, number> = {};
    // Topic counts
    const topicCounts: Record<string, number> = {};
    // Daily emotion data for line chart
    const dailyMap: Record<string, Record<string, number>> = {};

    for (const entry of entries) {
      // Emotion
      const emotion = entry.emotion;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;

      // Topics
      if (entry.topics) {
        const topics = entry.topics.split(',');
        for (const topic of topics) {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }
      }

      // Daily aggregation
      const day = entry.createdAt.toISOString().split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = {};
      dailyMap[day][emotion] = (dailyMap[day][emotion] || 0) + 1;
    }

    const dailyData = Object.entries(dailyMap).map(([date, emotions]) => ({
      date,
      ...emotions,
    }));

    return NextResponse.json({
      emotionCounts,
      topicCounts,
      dailyData,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}