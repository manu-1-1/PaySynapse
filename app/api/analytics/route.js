import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const totalTransactions = await prisma.payment.count();
    const matched = await prisma.reconciliation.count({ where: { status: 'MATCHED' } });
    const allExceptions = await prisma.exception.count();
    const pending = await prisma.exception.count({ where: { status: 'OPEN' } });
    const resolved = await prisma.exception.count({ where: { status: 'RESOLVED' } });
    const investigating = await prisma.exception.count({ where: { status: 'INVESTIGATING' } });

    // Financial impact total for open exceptions
    const impactResult = await prisma.exception.aggregate({
      where: { status: { in: ['OPEN', 'INVESTIGATING'] } },
      _sum: { financialImpact: true }
    });
    
    const financialImpact = impactResult._sum.financialImpact || 0;

    let matchRate = 0;
    if (totalTransactions > 0) {
      matchRate = parseFloat(((matched / totalTransactions) * 100).toFixed(2));
    }

    const exceptionDistributionRaw = await prisma.exception.groupBy({
      by: ['type'],
      _count: { id: true },
    });
    
    const exceptionDistribution = exceptionDistributionRaw.map(e => ({
      name: e.type.replace(/_/g, ' '),
      value: e._count.id
    }));

    return NextResponse.json({
      data: {
        totalTransactions,
        matched,
        exceptions: allExceptions,
        pending,
        investigating,
        resolved,
        matchRate,
        financialImpact: parseFloat(financialImpact.toString()),
        exceptionDistribution
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
