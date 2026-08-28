import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since'); // ISO date string

    let whereClause = { status: 'OPEN' };
    
    if (since) {
      whereClause.createdAt = { gt: new Date(since) };
    }

    const exceptions = await prisma.exception.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        payment: {
          select: { externalPaymentId: true }
        }
      }
    });

    let unreadCount = exceptions.length;
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        unreadCount = exceptions.filter(e => new Date(e.createdAt) > sinceDate).length;
      }
    }

    return NextResponse.json({ 
      data: exceptions,
      unreadCount 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
