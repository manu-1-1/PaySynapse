import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { runFullReconciliation } from '@/lib/reconciliation/engine';

const prisma = new PrismaClient();

function randomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateId(prefix, index) {
  return `${prefix}_demo_${Date.now()}_${index}`;
}

async function purgeTransactionData() {
  await prisma.auditLog.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.exception.deleteMany();
  await prisma.reconciliation.deleteMany();
  await prisma.bankTransaction.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
}

async function ensureUserAndMerchant() {
  let user = await prisma.user.findFirst();
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    user = await prisma.user.create({
      data: {
        email: 'ops@demo.paysynapse.com',
        passwordHash,
        name: 'Operations Manager',
        role: 'ADMIN'
      }
    });
  }

  let merchant = await prisma.merchant.findFirst();
  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: { name: 'Acme Corp (Demo)' }
    });
  }
  return { user, merchant };
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'clear_all'; // 'clear_all' or 'regenerate_demo'

    if (action === 'clear_all') {
      await purgeTransactionData();
      return NextResponse.json({
        success: true,
        message: 'All transaction ledger data, settlements, and exceptions have been purged. Total volume is now 0.'
      });
    }

    if (action === 'regenerate_demo') {
      await purgeTransactionData();
      const { merchant } = await ensureUserAndMerchant();

      // Ensure default fee rules exist
      const existingRules = await prisma.feeRule.findMany();
      if (existingRules.length === 0) {
        const defaultRules = [
          { paymentMethod: 'UPI', percentageRate: 0.000, flatFee: 0.00, taxRate: 0.18, description: 'UPI / RuPay zero-MDR' },
          { paymentMethod: 'CARD', percentageRate: 0.018, flatFee: 0.00, taxRate: 0.18, description: 'Credit Card (1.8%)' },
          { paymentMethod: 'CREDIT_CARD', percentageRate: 0.018, flatFee: 0.00, taxRate: 0.18, description: 'Credit Card (1.8%)' },
          { paymentMethod: 'DEBIT_CARD', percentageRate: 0.009, flatFee: 0.00, taxRate: 0.18, description: 'Debit Card (0.9%)' },
          { paymentMethod: 'NETBANKING', percentageRate: 0.000, flatFee: 15.00, taxRate: 0.18, description: 'Netbanking (₹15 flat)' },
          { paymentMethod: 'WALLET', percentageRate: 0.019, flatFee: 0.00, taxRate: 0.18, description: 'Wallets (1.9%)' },
          { paymentMethod: 'DEFAULT', percentageRate: 0.018, flatFee: 0.00, taxRate: 0.18, description: 'Default fallback' }
        ];
        for (const r of defaultRules) {
          await prisma.feeRule.create({ data: r });
        }
      }

      const requestedCount = parseInt(body.count, 10);
      const totalRecords = isNaN(requestedCount) ? 100 : Math.max(10, Math.min(1000, requestedCount));
      const paymentMethods = ['UPI', 'CARD', 'NETBANKING', 'DEBIT_CARD'];

      for (let i = 0; i < totalRecords; i++) {
        const grossAmount = randomAmount(500, 20000);
        const method = paymentMethods[i % paymentMethods.length];

        let standardFee = 0;
        if (method === 'UPI') standardFee = 0.00;
        else if (method === 'CARD' || method === 'CREDIT_CARD') standardFee = parseFloat((grossAmount * 0.018).toFixed(2));
        else if (method === 'DEBIT_CARD') standardFee = parseFloat((grossAmount * 0.009).toFixed(2));
        else if (method === 'NETBANKING') standardFee = 15.00;
        else standardFee = parseFloat((grossAmount * 0.018).toFixed(2));

        const standardTax = parseFloat((standardFee * 0.18).toFixed(2));
        const expectedSettlement = parseFloat((grossAmount - standardFee - standardTax).toFixed(2));

        const orderId = generateId('order', i);
        const paymentId = generateId('pay', i);
        const settlementId = generateId('setl', i);
        const txnId = generateId('txn', i);

        // Determine scenario
        const rand = Math.random();
        let scenario = 'MATCHED';
        if (rand < 0.08) scenario = 'MISSING_SETTLEMENT';
        else if (rand < 0.16) scenario = 'AMOUNT_MISMATCH';
        else if (rand < 0.22) scenario = 'FEE_MISMATCH';
        else if (rand < 0.28) scenario = 'DELAYED_SETTLEMENT';

        const order = await prisma.order.create({
          data: {
            externalOrderId: orderId,
            merchantId: merchant.id,
            amount: grossAmount,
            currency: 'INR',
            status: 'PAID',
          }
        });

        const payment = await prisma.payment.create({
          data: {
            externalPaymentId: paymentId,
            orderId: order.id,
            amount: grossAmount,
            currency: 'INR',
            status: 'CAPTURED',
            method,
            capturedAt: new Date(Date.now() - (i * 3600000)),
          }
        });

        let actualFee = standardFee;
        let actualTax = standardTax;
        if (scenario === 'FEE_MISMATCH') {
          if (method === 'UPI') actualFee = parseFloat((grossAmount * 0.015).toFixed(2));
          else if (method === 'NETBANKING') actualFee = 45.00;
          else actualFee = parseFloat((standardFee * 1.5).toFixed(2));
          actualTax = parseFloat((actualFee * 0.18).toFixed(2));
        }

        await prisma.fee.create({
          data: {
            paymentId: payment.id,
            amount: actualFee,
            tax: actualTax,
          }
        });

        if (scenario !== 'MISSING_SETTLEMENT') {
          let actualSettlement = expectedSettlement;
          if (scenario === 'AMOUNT_MISMATCH') {
            actualSettlement = parseFloat((expectedSettlement - 50).toFixed(2));
          }

          let settledDate = new Date(Date.now() - (i * 3600000) + 1800000);
          if (scenario === 'DELAYED_SETTLEMENT') {
            settledDate = new Date(Date.now() + (10 * 86400000));
          }

          const settlement = await prisma.settlement.create({
            data: {
              externalSettlementId: settlementId,
              paymentId: payment.id,
              amount: actualSettlement,
              status: 'PROCESSED',
              settledAt: settledDate,
            }
          });

          await prisma.bankTransaction.create({
            data: {
              externalTransactionId: txnId,
              settlementId: settlement.id,
              amount: actualSettlement,
              transactionType: 'CREDIT',
              reference: 'UTR' + Math.floor(Math.random() * 89999999 + 10000000),
              transactionDate: settledDate,
              status: 'CLEARED'
            }
          });
        }
      }

      // Run reconciliation engine on the newly generated dataset
      await runFullReconciliation();

      return NextResponse.json({
        success: true,
        message: `Successfully generated ${totalRecords} fresh realistic transactions and ran deterministic reconciliation.`
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Reset error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
