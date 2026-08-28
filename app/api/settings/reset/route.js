import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
        message: 'All transaction ledger data, settlements, and exceptions have been purged.'
      });
    }

    if (action === 'regenerate_demo') {
      await purgeTransactionData();
      const { merchant } = await ensureUserAndMerchant();

      const totalRecords = 60;
      const paymentMethods = ['UPI', 'card', 'netbanking', 'wallet'];

      for (let i = 0; i < totalRecords; i++) {
        const grossAmount = randomAmount(500, 15000);
        const feeAmount = parseFloat((grossAmount * 0.018).toFixed(2));
        const taxAmount = parseFloat((feeAmount * 0.18).toFixed(2));
        const expectedSettlement = parseFloat((grossAmount - feeAmount - taxAmount).toFixed(2));
        const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const isMatched = i % 6 !== 0;

        const order = await prisma.order.create({
          data: {
            merchantId: merchant.id,
            externalOrderId: generateId('order', i),
            amount: grossAmount,
            status: 'PAID',
            currency: 'INR'
          }
        });

        const payment = await prisma.payment.create({
          data: {
            merchantId: merchant.id,
            orderId: order.id,
            externalPaymentId: generateId('pay', i),
            amount: grossAmount,
            currency: 'INR',
            status: 'CAPTURED',
            method,
            capturedAt: new Date(Date.now() - (i * 3600000))
          }
        });

        await prisma.fee.create({
          data: {
            paymentId: payment.id,
            type: 'MDR',
            amount: feeAmount,
            tax: taxAmount,
            rate: 0.018
          }
        });

        if (isMatched) {
          const settlement = await prisma.settlement.create({
            data: {
              merchantId: merchant.id,
              externalSettlementId: generateId('setl', i),
              amount: expectedSettlement,
              currency: 'INR',
              status: 'PROCESSED',
              settledAt: new Date(Date.now() - (i * 3600000) + 1800000)
            }
          });

          await prisma.payment.update({
            where: { id: payment.id },
            data: { settlementId: settlement.id }
          });

          const bankTx = await prisma.bankTransaction.create({
            data: {
              merchantId: merchant.id,
              reference: `CMS${Math.floor(Math.random() * 899999999 + 100000000)}`,
              amount: expectedSettlement,
              type: 'CREDIT',
              transactionDate: new Date(Date.now() - (i * 3600000) + 3600000)
            }
          });

          await prisma.settlement.update({
            where: { id: settlement.id },
            data: { bankTransactionId: bankTx.id }
          });

          await prisma.reconciliation.create({
            data: {
              paymentId: payment.id,
              status: 'MATCHED',
              expectedAmount: expectedSettlement,
              actualAmount: expectedSettlement,
              difference: 0
            }
          });
        } else {
          // Exception case
          const diff = parseFloat((expectedSettlement * 0.15).toFixed(2));
          await prisma.reconciliation.create({
            data: {
              paymentId: payment.id,
              status: 'MISMATCH',
              expectedAmount: expectedSettlement,
              actualAmount: expectedSettlement - diff,
              difference: diff
            }
          });

          await prisma.exception.create({
            data: {
              paymentId: payment.id,
              type: i % 2 === 0 ? 'MISSING_SETTLEMENT' : 'FEE_MISMATCH',
              severity: 'HIGH',
              financialImpact: diff,
              description: `Automated variance detected: Expected ₹${expectedSettlement} vs Actual ₹${expectedSettlement - diff}. Delta: ₹${diff}.`,
              status: 'OPEN'
            }
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Re-seeded 60 fresh realistic payment records with matched settlements and exceptions.'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Reset error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
