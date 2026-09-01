import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function generateUTR(prefix = 'APEX') {
  const timestamp = Date.now().toString().slice(-8);
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${timestamp}${randomDigits}`;
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
    const { scenario, settlementId, customAmount, delayDays = 5 } = body;

    let targetSettlement = null;

    if (settlementId) {
      targetSettlement = await prisma.settlement.findUnique({
        where: { id: settlementId },
        include: { payment: true, bankTransactions: true }
      });
    } else {
      // Pick the latest settlement
      targetSettlement = await prisma.settlement.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { payment: true, bankTransactions: true }
      });
    }

    if (!targetSettlement) {
      return NextResponse.json({
        success: false,
        error: 'No active settlement available to inject anomaly into. Please place a payment first or seed data.'
      }, { status: 400 });
    }

    const originalAmount = parseFloat(targetSettlement.amount.toString());

    switch (scenario) {
      case 'SHORT_SETTLEMENT': {
        // Deduct an intermediary wire fee (e.g. ₹150 or customAmount)
        const deduction = customAmount ? parseFloat(customAmount) : 150.00;
        const shortedAmount = Math.max(1, originalAmount - deduction);

        // Delete existing bank txns for this settlement to replace with short-settlement
        await prisma.bankTransaction.deleteMany({
          where: { settlementId: targetSettlement.id }
        });

        const utr = generateUTR('SHORT_UTR_');
        const txnId = `txn_short_${Date.now()}`;

        await prisma.bankTransaction.create({
          data: {
            externalTransactionId: txnId,
            settlementId: targetSettlement.id,
            amount: shortedAmount,
            transactionType: 'CREDIT',
            reference: utr,
            transactionDate: new Date(),
            status: 'CLEARED'
          }
        });

        await triggerPaySynapseReconciliation();

        return NextResponse.json({
          success: true,
          scenario: 'SHORT_SETTLEMENT',
          message: `Injected Short-Settlement: Expected ₹${originalAmount.toFixed(2)}, but credited ₹${shortedAmount.toFixed(2)} (₹${deduction} deducted as bank wire fee).`,
          details: {
            settlementId: targetSettlement.id,
            expected: originalAmount,
            actualBankCredit: shortedAmount,
            variance: deduction,
            utr
          }
        });
      }

      case 'DELAYED_SETTLEMENT': {
        // Push transactionDate back or simulate >3 days SLA breach
        const delayedDate = new Date();
        delayedDate.setDate(delayedDate.getDate() - parseInt(delayDays));

        await prisma.bankTransaction.deleteMany({
          where: { settlementId: targetSettlement.id }
        });

        // Update payment capturedAt to older date
        if (targetSettlement.paymentId) {
          const oldCapturedDate = new Date();
          oldCapturedDate.setDate(oldCapturedDate.getDate() - (parseInt(delayDays) + 4));
          await prisma.payment.update({
            where: { id: targetSettlement.paymentId },
            data: { capturedAt: oldCapturedDate }
          });
        }

        const utr = generateUTR('DELAY_UTR_');
        const txnId = `txn_delayed_${Date.now()}`;

        await prisma.bankTransaction.create({
          data: {
            externalTransactionId: txnId,
            settlementId: targetSettlement.id,
            amount: targetSettlement.amount,
            transactionType: 'CREDIT',
            reference: utr,
            transactionDate: new Date(),
            status: 'CLEARED'
          }
        });

        await triggerPaySynapseReconciliation();

        return NextResponse.json({
          success: true,
          scenario: 'DELAYED_SETTLEMENT',
          message: `Injected SLA Breach: Settlement took ${delayDays + 4} days to clear, violating standard T+1/T+2 banking turnaround.`,
          details: {
            settlementId: targetSettlement.id,
            delayDays: delayDays + 4,
            utr
          }
        });
      }

      case 'COMPLIANCE_HOLD': {
        // Delete bank transaction or set to HELD
        await prisma.bankTransaction.deleteMany({
          where: { settlementId: targetSettlement.id }
        });

        await prisma.settlement.update({
          where: { id: targetSettlement.id },
          data: { status: 'HELD_AML_AUDIT' }
        });

        await triggerPaySynapseReconciliation();

        return NextResponse.json({
          success: true,
          scenario: 'COMPLIANCE_HOLD',
          message: `Injected Nodal Compliance Freeze: Settlement ${targetSettlement.id} held in AML Escrow inspection. Bank credit blocked.`,
          details: {
            settlementId: targetSettlement.id,
            amount: originalAmount,
            status: 'HELD_AML_AUDIT'
          }
        });
      }

      case 'DUPLICATE_CREDIT': {
        // Create duplicate BankTransaction for the same settlement
        const utr1 = generateUTR('DUP1_');
        const utr2 = generateUTR('DUP2_');

        await prisma.bankTransaction.create({
          data: {
            externalTransactionId: `txn_dup_1_${Date.now()}`,
            settlementId: targetSettlement.id,
            amount: targetSettlement.amount,
            transactionType: 'CREDIT',
            reference: utr1,
            transactionDate: new Date(),
            status: 'CLEARED'
          }
        });

        await prisma.bankTransaction.create({
          data: {
            externalTransactionId: `txn_dup_2_${Date.now()}`,
            settlementId: targetSettlement.id,
            amount: targetSettlement.amount,
            transactionType: 'CREDIT',
            reference: utr2,
            transactionDate: new Date(),
            status: 'CLEARED'
          }
        });

        await triggerPaySynapseReconciliation();

        return NextResponse.json({
          success: true,
          scenario: 'DUPLICATE_CREDIT',
          message: `Injected Duplicate Credit: Dispatched two parallel bank clearances for settlement ${targetSettlement.id}.`,
          details: {
            settlementId: targetSettlement.id,
            amount: originalAmount,
            utr1,
            utr2
          }
        });
      }

      default:
        return NextResponse.json({ success: false, error: 'Unknown chaos scenario' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error injecting chaos scenario:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Chaos injection failed' },
      { status: 500 }
    );
  }
}
