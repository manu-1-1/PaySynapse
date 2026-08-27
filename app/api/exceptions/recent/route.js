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
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        payment: {
          select: { externalPaymentId: true }
        }
      }
    });

    return NextResponse.json({ data: exceptions });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
