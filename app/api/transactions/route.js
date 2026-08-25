import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    const transactions = await prisma.payment.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        order: true,
        settlements: true,
        reconciliations: true,
        exceptions: {
          where: { status: { in: ['OPEN', 'INVESTIGATING'] } }
        }
      }
    });

    const total = await prisma.payment.count();

    return NextResponse.json({ data: transactions, total, limit, offset });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
