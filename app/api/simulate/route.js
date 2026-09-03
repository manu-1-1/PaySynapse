import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { reconcilePayment } from '@/lib/reconciliation/engine';

const prisma = new PrismaClient();

function generateId(prefix) {
  return `${prefix}_sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const scenario = body.scenario || 'PERFECT_MATCH';

    // Ensure demo merchant exists
    const merchant = await prisma.merchant.findFirst() || await prisma.merchant.create({
      data: { name: 'Acme Corp (Simulation)' }
    });

    const grossAmount = body.amount ? parseFloat(body.amount) : 5000.00;
    const orderExtId = generateId('order');
    const paymentExtId = generateId('pay');
    const settlementExtId = generateId('setl');
    const txnExtId = generateId('txn');

    // Method and standard fee calculation
    const method = (body.method || (scenario === 'FEE_MISMATCH' ? 'CARD' : 'CARD')).toUpperCase();
    
    // Calculate standard contractual rate
    let standardFee = 0;
    if (method === 'NETBANKING') {
      standardFee = 15.00;
    } else if (method === 'UPI') {
      standardFee = grossAmount > 2000 ? parseFloat((grossAmount * 0.011).toFixed(2)) : 0.00;
    } else {
      // Default Card 1.80%
      standardFee = parseFloat((grossAmount * 0.018).toFixed(2));
    }
    let standardTax = parseFloat((standardFee * 0.18).toFixed(2));

    // Create Order
    const order = await prisma.order.create({
      data: {
        externalOrderId: orderExtId,
        merchantId: merchant.id,
        amount: grossAmount,
        currency: 'INR',
        status: scenario === 'STATUS_MISMATCH' ? 'FAILED' : 'PAID'
      }
    });

    // Create Payment
    const payment = await prisma.payment.create({
      data: {
        externalPaymentId: paymentExtId,
        orderId: order.id,
        amount: grossAmount,
        currency: 'INR',
        status: scenario === 'STATUS_MISMATCH' ? 'FAILED' : 'CAPTURED',
        method: method,
        capturedAt: new Date(Date.now() - (scenario === 'DELAYED_SETTLEMENT' ? 10 * 86400000 : 86400000))
      }
    });

    // Determine actual fee (simulate gateway overcharge for FEE_MISMATCH)
    let actualFee = standardFee;
    let actualTax = standardTax;
    if (scenario === 'FEE_MISMATCH') {
      if (method === 'NETBANKING') {
        actualFee = 45.00; // Overcharged fee for Netbanking (expected ₹15)
      } else if (method === 'UPI') {
        actualFee = parseFloat((grossAmount * 0.015).toFixed(2)); // Billed 1.5% instead of 0%/1.1%
      } else {
        // Card: Billed standard retail 2.00% + GST instead of 1.80%
        actualFee = parseFloat((grossAmount * 0.02).toFixed(2));
      }
      actualTax = parseFloat((actualFee * 0.18).toFixed(2));
    }

    await prisma.fee.create({
      data: {
        paymentId: payment.id,
        amount: actualFee,
        tax: actualTax
      }
    });

    const totalDeductions = actualFee + actualTax;
    const expectedSettlement = parseFloat((grossAmount - totalDeductions).toFixed(2));

    // Handle Refunds
    if (scenario === 'MISSING_REFUND') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' }
      });
    }

    // Handle Settlements
    if (scenario !== 'MISSING_SETTLEMENT' && scenario !== 'MISSING_REFUND') {
      let settledAmount = expectedSettlement;
      if (scenario === 'AMOUNT_MISMATCH') {
        const deficit = grossAmount < 1000 ? parseFloat((grossAmount * 0.10).toFixed(2)) : 350.00;
        settledAmount = parseFloat((expectedSettlement - deficit).toFixed(2));
      }

      const settlement = await prisma.settlement.create({
        data: {
          externalSettlementId: settlementExtId,
          paymentId: payment.id,
          amount: settledAmount,
          status: 'SETTLED',
          settledAt: new Date()
        }
      });

      // Bank transaction
      await prisma.bankTransaction.create({
        data: {
          externalTransactionId: txnExtId,
          settlementId: settlement.id,
          amount: settledAmount,
          transactionType: 'CREDIT',
          reference: `CMS/${settlement.externalSettlementId}/UTR_${Date.now()}`,
          transactionDate: new Date(),
          status: 'CLEARED'
        }
      });

      // Duplicate Transaction scenario
      if (scenario === 'DUPLICATE_TRANSACTION') {
        const dupSettlement = await prisma.settlement.create({
          data: {
            externalSettlementId: generateId('setl_dup'),
            paymentId: payment.id,
            amount: settledAmount,
            status: 'SETTLED',
            settledAt: new Date()
          }
        });
        await prisma.bankTransaction.create({
          data: {
            externalTransactionId: generateId('txn_dup'),
            settlementId: dupSettlement.id,
            amount: settledAmount,
            transactionType: 'CREDIT',
            reference: `CMS/${dupSettlement.externalSettlementId}/UTR_DUP_${Date.now()}`,
            transactionDate: new Date(),
            status: 'CLEARED'
          }
        });
      }
    }

    // Execute deterministic reconciliation
    await reconcilePayment(payment.id);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      externalPaymentId: payment.externalPaymentId,
      scenario
    });
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Simulation execution failed' },
      { status: 500 }
    );
  }
}
