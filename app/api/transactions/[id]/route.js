import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const isUuid = params.id.includes('-') && params.id.length === 36;
    const transaction = await prisma.payment.findFirst({
      where: isUuid ? { id: params.id } : { externalPaymentId: params.id },
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
