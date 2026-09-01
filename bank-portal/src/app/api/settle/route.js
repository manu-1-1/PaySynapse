import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function generateUTR() {
  const timestamp = Date.now().toString().slice(-8);
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `APEX${timestamp}${randomDigits}`;
}

async function triggerPaySynapseReconciliation() {
  const paysynapseUrl = process.env.NEXT_PUBLIC_PAYSYNAPSE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${paysynapseUrl}/api/reconciliation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('PaySynapse reconciliation trigger skipped:', err.message);
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { settlementId, batch = false } = body;

    const clearedRecords = [];

    if (batch) {
      // Find all settlements without a cleared bank transaction
      const pendingSettlements = await prisma.settlement.findMany({
        where: {
          bankTransactions: {
            none: {
              status: 'CLEARED'
            }
          }
        },
        take: 50
      });

      for (const settlement of pendingSettlements) {
        const utr = generateUTR();
        const txnId = `txn_bank_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        const bankTxn = await prisma.bankTransaction.create({
          data: {
            externalTransactionId: txnId,
            settlementId: settlement.id,
            amount: settlement.amount,
            transactionType: 'CREDIT',
            reference: utr,
            transactionDate: new Date(),
            status: 'CLEARED'
          }
        });

        await prisma.settlement.update({
          where: { id: settlement.id },
          data: {
            status: 'SETTLED',
            settledAt: new Date()
          }
        });

        clearedRecords.push({ settlementId: settlement.id, utr, amount: settlement.amount });
      }
    } else {
      if (!settlementId) {
        return NextResponse.json({ success: false, error: 'settlementId is required' }, { status: 400 });
      }

      const settlement = await prisma.settlement.findUnique({
        where: { id: settlementId }
      });

      if (!settlement) {
        return NextResponse.json({ success: false, error: 'Settlement not found' }, { status: 404 });
      }

      const utr = generateUTR();
      const txnId = `txn_bank_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      const bankTxn = await prisma.bankTransaction.create({
        data: {
          externalTransactionId: txnId,
          settlementId: settlement.id,
          amount: settlement.amount,
          transactionType: 'CREDIT',
          reference: utr,
          transactionDate: new Date(),
          status: 'CLEARED'
        }
      });

      await prisma.settlement.update({
        where: { id: settlement.id },
        data: {
          status: 'SETTLED',
          settledAt: new Date()
        }
      });

      clearedRecords.push({ settlementId: settlement.id, utr, amount: settlement.amount });
    }

    // Trigger PaySynapse instant re-reconciliation
    await triggerPaySynapseReconciliation();

    return NextResponse.json({
      success: true,
      message: batch
        ? `Successfully cleared batch of ${clearedRecords.length} settlements with RBI UTRs.`
        : `Settlement cleared successfully with UTR: ${clearedRecords[0]?.utr}`,
      clearedCount: clearedRecords.length,
      records: clearedRecords
    });
  } catch (error) {
    console.error('Error settling transactions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Settlement authorization failed' },
      { status: 500 }
    );
  }
}
