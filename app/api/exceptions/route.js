import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const status = searchParams.get('status');

    const where = {};
    if (status) {
      where.status = status;
    }

    const exceptions = await prisma.exception.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        payment: {
          include: {
            order: true
          }
        }
      }
    });

    const total = await prisma.exception.count({ where });

    return NextResponse.json({ data: exceptions, total, limit, offset });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
