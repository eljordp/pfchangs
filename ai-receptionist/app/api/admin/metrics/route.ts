import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Previous period for trend comparison
    const prevStartDate = new Date();
    prevStartDate.setDate(prevStartDate.getDate() - days * 2);

    // ---- All queries in parallel ----
    const [
      totalCalls,
      totalChats,
      totalAppointments,
      recentCalls,
      intentDistribution,
      // Order metrics - current period
      orderAgg,
      orderCount,
      callsWithOrders,
      avgTimeToOrder,
      // Order metrics - previous period
      prevOrderAgg,
      prevOrderCount,
      prevTotalCalls,
      prevCallsWithOrders,
      // Order type distribution
      orderTypeGroups,
      // Top callers by revenue
      topCallerOrders,
      // Recent orders
      recentOrders,
      // Hourly data
      hourlyCallsRaw,
      hourlyOrdersRaw,
    ] = await Promise.all([
      // Total calls
      prisma.callSession.count({ where: { startTime: { gte: startDate } } }),
      // Total chats
      prisma.chatSession.count({ where: { startTime: { gte: startDate } } }),
      // Total appointments
      prisma.appointment.count({ where: { createdAt: { gte: startDate } } }),
      // Recent calls with details
      prisma.callSession.findMany({
        where: { startTime: { gte: startDate } },
        include: { caller: true, orders: { select: { total: true } } },
        orderBy: { startTime: 'desc' },
        take: 100,
      }),
      // Intent distribution
      prisma.callSession.groupBy({
        by: ['intent'],
        where: { startTime: { gte: startDate }, intent: { not: null } },
        _count: { intent: true },
      }),

      // Order aggregate - current period
      prisma.order.aggregate({
        where: { createdAt: { gte: startDate }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
        _avg: { total: true },
      }),
      prisma.order.count({
        where: { createdAt: { gte: startDate }, status: { not: 'CANCELLED' } },
      }),
      prisma.callSession.count({
        where: { startTime: { gte: startDate }, orders: { some: {} } },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startDate }, timeToOrder: { not: null } },
        _avg: { timeToOrder: true },
      }),

      // Order aggregate - previous period
      prisma.order.aggregate({
        where: { createdAt: { gte: prevStartDate, lt: startDate }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
        _avg: { total: true },
      }),
      prisma.order.count({
        where: { createdAt: { gte: prevStartDate, lt: startDate }, status: { not: 'CANCELLED' } },
      }),
      prisma.callSession.count({ where: { startTime: { gte: prevStartDate, lt: startDate } } }),
      prisma.callSession.count({
        where: { startTime: { gte: prevStartDate, lt: startDate }, orders: { some: {} } },
      }),

      // Order type distribution
      prisma.order.groupBy({
        by: ['type'],
        where: { createdAt: { gte: startDate }, status: { not: 'CANCELLED' } },
        _count: true,
        _sum: { total: true },
      }),

      // Top callers - group orders by caller
      prisma.order.groupBy({
        by: ['callerId'],
        where: { createdAt: { gte: startDate }, status: { not: 'CANCELLED' }, callerId: { not: null } },
        _sum: { total: true },
        _count: true,
        _avg: { total: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 10,
      }),

      // Recent orders
      prisma.order.findMany({
        where: { createdAt: { gte: startDate } },
        include: { caller: true },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),

      // Hourly calls (raw query)
      prisma.$queryRaw<Array<{ hour: number; count: bigint }>>`
        SELECT EXTRACT(HOUR FROM "startTime")::int as hour, COUNT(*)::bigint as count
        FROM "CallSession"
        WHERE "startTime" >= ${startDate}
        GROUP BY hour ORDER BY hour
      `,
      prisma.$queryRaw<Array<{ hour: number; count: bigint }>>`
        SELECT EXTRACT(HOUR FROM "createdAt")::int as hour, COUNT(*)::bigint as count
        FROM "Order"
        WHERE "createdAt" >= ${startDate} AND "status" != 'CANCELLED'
        GROUP BY hour ORDER BY hour
      `,
    ]);

    // ---- Compute metrics ----
    const completedCalls = recentCalls.filter(c => c.status === 'COMPLETED').length;
    const resolvedCalls = recentCalls.filter(c => c.resolved).length;
    const averageDuration = recentCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / (completedCalls || 1);

    const totalRevenue = orderAgg._sum.total || 0;
    const avgOrderValue = orderAgg._avg.total || 0;
    const prevRevenue = prevOrderAgg._sum.total || 0;
    const prevAOV = prevOrderAgg._avg.total || 0;

    const conversionRate = completedCalls > 0 ? (callsWithOrders / completedCalls) * 100 : 0;
    const prevCompletedCalls = recentCalls.length > 0 ? Math.round(prevTotalCalls * 0.8) : 0; // estimate
    const prevConversion = prevCompletedCalls > 0 ? (prevCallsWithOrders / prevCompletedCalls) * 100 : 0;

    function pctChange(current: number, previous: number): number {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 10) / 10;
    }

    // Group calls by day for timeline
    const timelineMap: Record<string, { revenue: number; orders: number; calls: number }> = {};
    recentCalls.forEach(call => {
      const date = call.startTime.toISOString().split('T')[0];
      if (!timelineMap[date]) timelineMap[date] = { revenue: 0, orders: 0, calls: 0 };
      timelineMap[date].calls++;
      call.orders.forEach(o => {
        timelineMap[date].revenue += o.total;
        timelineMap[date].orders++;
      });
    });

    const revenueTimeline = Object.entries(timelineMap)
      .map(([date, data]) => ({ date, ...data, revenue: Math.round(data.revenue) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Conversion funnel
    const callsWithIntent = recentCalls.filter(c => c.intent && c.status === 'COMPLETED').length;
    const completedOrders = await prisma.order.count({
      where: { createdAt: { gte: startDate }, status: { in: ['COMPLETED', 'DELIVERED'] } },
    });

    // Top callers with details
    const callerIds = topCallerOrders.map(t => t.callerId).filter(Boolean) as string[];
    const callerDetails = await prisma.caller.findMany({ where: { id: { in: callerIds } } });
    const callerMap = new Map(callerDetails.map(c => [c.id, c]));

    const topCallers = topCallerOrders.map(t => {
      const caller = callerMap.get(t.callerId!);
      return {
        id: t.callerId!,
        name: caller ? `${caller.firstName || ''} ${caller.lastName || ''}`.trim() : 'Unknown',
        company: caller?.company || null,
        totalOrders: t._count,
        totalRevenue: Math.round((t._sum.total || 0) * 100) / 100,
        averageOrderValue: Math.round((t._avg.total || 0) * 100) / 100,
      };
    });

    // Hourly activity
    const hourlyMap: Record<number, { calls: number; orders: number }> = {};
    for (let h = 0; h < 24; h++) hourlyMap[h] = { calls: 0, orders: 0 };
    hourlyCallsRaw.forEach(r => { hourlyMap[r.hour].calls = Number(r.count); });
    hourlyOrdersRaw.forEach(r => { hourlyMap[r.hour].orders = Number(r.count); });
    const hourlyActivity = Object.entries(hourlyMap).map(([h, data]) => ({
      hour: parseInt(h),
      ...data,
    }));

    // Intent data
    const intentData = intentDistribution.map(item => ({
      name: item.intent || 'Unknown',
      value: item._count.intent,
    }));

    // Order type data
    const orderTypeData = orderTypeGroups.map(g => ({
      name: g.type.replace('_', ' '),
      value: g._count,
      revenue: Math.round((g._sum.total || 0) * 100) / 100,
    }));

    // Recent activity with transcripts
    const recentActivity = await Promise.all(
      recentCalls.slice(0, 10).map(async (call) => {
        const messages = await prisma.callMessage.findMany({
          where: { callSessionId: call.id },
          orderBy: { timestamp: 'asc' },
        });
        return {
          id: call.id,
          type: 'call',
          caller: call.caller ? `${call.caller.firstName || ''} ${call.caller.lastName || ''}`.trim() : call.phoneNumber,
          intent: call.intent,
          status: call.status,
          timestamp: call.startTime,
          resolved: call.resolved,
          duration: call.duration,
          summary: messages.length > 0 ? `${messages.length} messages exchanged` : 'No conversation recorded',
          transcript: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
          orderTotal: call.orders.length > 0 ? call.orders.reduce((s, o) => s + o.total, 0) : null,
        };
      })
    );

    return NextResponse.json({
      heroMetrics: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        revenueChange: pctChange(totalRevenue, prevRevenue),
        totalOrders: orderCount,
        ordersChange: pctChange(orderCount, prevOrderCount),
        averageOrderValue: Math.round(avgOrderValue * 100) / 100,
        aovChange: pctChange(avgOrderValue, prevAOV),
        conversionRate: Math.round(conversionRate * 10) / 10,
        conversionChange: pctChange(conversionRate, prevConversion),
      },
      operationalMetrics: {
        totalCalls,
        totalChats,
        totalAppointments,
        resolutionRate: completedCalls > 0 ? Math.round((resolvedCalls / completedCalls) * 1000) / 10 : 0,
        averageCallDuration: Math.round(averageDuration),
        averageTimeToOrder: Math.round(avgTimeToOrder._avg.timeToOrder || 0),
        callsWithOrders,
        callsWithoutOrders: totalCalls - callsWithOrders,
      },
      charts: {
        revenueTimeline,
        orderTypeDistribution: orderTypeData,
        intentDistribution: intentData,
        hourlyActivity,
        conversionFunnel: {
          totalCalls,
          completedCalls,
          callsWithIntent,
          callsWithOrders,
          completedOrders,
        },
      },
      topCallers,
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        caller: o.caller ? `${o.caller.firstName || ''} ${o.caller.lastName || ''}`.trim() : 'Unknown',
        company: o.caller?.company || null,
        type: o.type,
        status: o.status,
        total: o.total,
        guestCount: o.guestCount,
        createdAt: o.createdAt,
      })),
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
