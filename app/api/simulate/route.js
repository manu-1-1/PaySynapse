import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { reconcilePayment } from '@/lib/reconciliation/engine';

const prisma = new PrismaClient();

function generateId(prefix) {
  return `${prefix}_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export async function POST(request) {
  try {
    const { scenario } = await request.json();
    
    if (!scenario) {
      return NextResponse.json({ error: 'Scenario is required' }, { status: 400 });
    }

    const grossAmount = 5000;
    const expectedFee = parseFloat((grossAmount * 0.018).toFixed(2));
    const expectedTax = parseFloat((expectedFee * 0.18).toFixed(2));
    const expectedSettlement = parseFloat((grossAmount - expectedFee - expectedTax).toFixed(2));

    const orderId = generateId('order');
    const paymentId = generateId('pay');
    const settlementId = generateId('setl');
    const txnId = generateId('txn');

    // Ensure merchant exists
    const merchant = await prisma.merchant.findFirst() || await prisma.merchant.create({ data: { name: 'Acme Corp (Simulation)' } });

    // 1. Create Base Order & Payment
    const order = await prisma.order.create({
      data: {
        externalOrderId: orderId,
        merchantId: merchant.id,
        amount: grossAmount,
        currency: 'INR',
        status: scenario === 'STATUS_MISMATCH' ? 'FAILED' : 'PAID',
      }
    });

    const payment = await prisma.payment.create({
      data: {
        externalPaymentId: paymentId,
        orderId: order.id,
        amount: grossAmount,
        currency: 'INR',
        status: scenario === 'STATUS_MISMATCH' ? 'FAILED' : 'CAPTURED',
        method: 'UPI',
        capturedAt: new Date(),
      }
    });

    // 2. Create Fees
    let actualFee = expectedFee;
    if (scenario === 'FEE_MISMATCH') {
      actualFee = parseFloat((expectedFee * 2).toFixed(2)); // Gateway overcharged
    }

    await prisma.fee.create({
      data: {
        paymentId: payment.id,
        amount: actualFee,
        tax: expectedTax,
      }
    });

    // 3. Create Settlements (skip if MISSING_SETTLEMENT)
    if (scenario !== 'MISSING_SETTLEMENT') {
      let actualSettlement = expectedSettlement;
      if (scenario === 'AMOUNT_MISMATCH') {
        actualSettlement = parseFloat((expectedSettlement - 100).toFixed(2)); // Short by 100
      }

      let settledDate = new Date();
      if (scenario === 'DELAYED_SETTLEMENT') {
        settledDate.setDate(settledDate.getDate() + 10); // 10 days late
      }

      const settlement = await prisma.settlement.create({
        data: {
          externalSettlementId: settlementId,
          paymentId: payment.id,
          amount: actualSettlement,
          status: 'PROCESSED',
          settledAt: settledDate,
          createdAt: new Date(),
        }
      });

      // 4. Create Bank Transaction
      if (scenario !== 'MISSING_BANK_TRANSACTION') {
        await prisma.bankTransaction.create({
          data: {
            externalTransactionId: txnId,
            settlementId: settlement.id,
            amount: actualSettlement,
            transactionType: 'CREDIT',
            reference: 'UTR_SIM_' + Math.floor(Math.random() * 10000000),
            transactionDate: settledDate,
            status: 'CLEARED'
          }
        });
      }
    }

    // 5. Run Reconciliation Engine instantly to detect the injected anomaly
    await reconcilePayment(payment.id);

    return NextResponse.json({ success: true, paymentId: payment.id });

  } catch (error) {
    console.error('Simulation Error:', error);
    return NextResponse.json({ error: 'Failed to run simulation' }, { status: 500 });
  }
}
