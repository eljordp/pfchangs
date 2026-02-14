import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total stats
    const [totalCalls, totalChats, totalAppointments, recentCalls, intentDistribution] = await Promise.all([
      // Total calls
      prisma.callSession.count({
        where: {
          startTime: {
            gte: startDate,
          },
        },
      }),

      // Total chats
      prisma.chatSession.count({
        where: {
          startTime: {
            gte: startDate,
          },
        },
      }),

      // Total appointments
      prisma.appointment.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),

      // Recent calls with details
      prisma.callSession.findMany({
        where: {
          startTime: {
            gte: startDate,
          },
        },
        include: {
          caller: true,
        },
        orderBy: {
          startTime: 'desc',
        },
        take: 100,
      }),

      // Intent distribution
      prisma.callSession.groupBy({
        by: ['intent'],
        where: {
          startTime: {
            gte: startDate,
          },
          intent: {
            not: null,
          },
        },
        _count: {
          intent: true,
        },
      }),
    ]);

    // Calculate metrics
    const completedCalls = recentCalls.filter(c => c.status === 'COMPLETED').length;
    const resolvedCalls = recentCalls.filter(c => c.resolved).length;
    const averageDuration = recentCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / (completedCalls || 1);

    // Group calls by day
    const callsByDay = recentCalls.reduce((acc, call) => {
      const date = call.startTime.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Format for charts
    const dailyData = Object.entries(callsByDay)
      .map(([date, count]) => ({
        date,
        calls: count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Format intent distribution for pie chart
    const intentData = intentDistribution.map(item => ({
      name: item.intent || 'Unknown',
      value: item._count.intent,
    }));

    return NextResponse.json({
      overview: {
        totalCalls,
        totalChats,
        totalAppointments,
        resolutionRate: completedCalls > 0 ? (resolvedCalls / completedCalls * 100).toFixed(1) : '0',
        averageDuration: Math.round(averageDuration),
      },
      charts: {
        daily: dailyData,
        intents: intentData,
      },
      recentActivity: await Promise.all(
        recentCalls.slice(0, 10).map(async (call) => {
          // Get conversation messages for summary
          const messages = await prisma.callMessage.findMany({
            where: { callSessionId: call.id },
            orderBy: { timestamp: 'asc' },
          });

          // Create basic summary from messages
          const summary = messages.length > 0
            ? `${messages.length} messages exchanged`
            : 'No conversation recorded';

          return {
            id: call.id,
            type: 'call',
            caller: call.caller?.firstName || call.phoneNumber,
            intent: call.intent,
            status: call.status,
            timestamp: call.startTime,
            resolved: call.resolved,
            duration: call.duration,
            summary,
            transcript: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
          };
        })
      ),
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
