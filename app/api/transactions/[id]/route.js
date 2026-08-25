import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const transaction = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        order: { include: { merchant: true } },
        fees: true,
        refunds: true,
        settlements: { include: { bankTransactions: true } },
        reconciliations: true,
        exceptions: true
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ data: transaction });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
