const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

function randomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateId(prefix, index) {
  return `${prefix}_demo_${Date.now()}_${index}`;
}

async function clearData() {
  console.log('Clearing existing data...');
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
  await prisma.merchant.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await clearData();

  console.log('Creating demo user...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);
  
  await prisma.user.create({
    data: {
      email: 'ops@demo.paysynapse.com',
      passwordHash: passwordHash,
      name: 'Operations Manager',
      role: 'ADMIN'
    }
  });

  console.log('Creating demo merchant...');
  const merchant = await prisma.merchant.create({
    data: { name: 'Acme Corp (Demo)' }
  });

  const totalRecords = 120;
  console.log(`Generating ${totalRecords} realistic transaction records...`);

  let count = 0;

  for (let i = 0; i < totalRecords; i++) {
    const grossAmount = randomAmount(500, 25000);
    const feeAmount = parseFloat((grossAmount * 0.018).toFixed(2));
    const taxAmount = parseFloat((feeAmount * 0.18).toFixed(2));
    const expectedSettlement = parseFloat((grossAmount - feeAmount - taxAmount).toFixed(2));

    const orderId = generateId('order', i);
    const paymentId = generateId('pay', i);
    const settlementId = generateId('setl', i);
    const txnId = generateId('txn', i);

    // Determine the scenario based on probabilities
    const rand = Math.random();
    let scenario = 'MATCHED';

    if (rand < 0.05) scenario = 'MISSING_SETTLEMENT';
    else if (rand < 0.10) scenario = 'AMOUNT_MISMATCH';
    else if (rand < 0.13) scenario = 'DUPLICATE_TRANSACTION';
    else if (rand < 0.15) scenario = 'MISSING_REFUND';
    else if (rand < 0.17) scenario = 'REFUND_MISMATCH';
    else if (rand < 0.20) scenario = 'FEE_MISMATCH';
    else if (rand < 0.25) scenario = 'MISSING_BANK_TRANSACTION';
    else if (rand < 0.27) scenario = 'ORPHAN_BANK_TRANSACTION';
    else if (rand < 0.30) scenario = 'DELAYED_SETTLEMENT';
    else if (rand < 0.32) scenario = 'STATUS_MISMATCH';

    // Base Order & Payment
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
        method: ['UPI', 'CARD', 'NETBANKING'][i % 3],
        capturedAt: new Date(),
      }
    });

    // Fee (altered for FEE_MISMATCH)
    let actualFee = feeAmount;
    if (scenario === 'FEE_MISMATCH') {
      actualFee = parseFloat((feeAmount * 2).toFixed(2)); // charged double fee by mistake
    }

    await prisma.fee.create({
      data: {
        paymentId: payment.id,
        amount: actualFee,
        tax: taxAmount,
      }
    });

    // Refunds
    if (scenario === 'MISSING_REFUND') {
      // Payment refunded but no refund record
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' }
      });
    } else if (scenario === 'REFUND_MISMATCH') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' }
      });
      await prisma.refund.create({
        data: {
          externalRefundId: generateId('rfnd', i),
          paymentId: payment.id,
          amount: parseFloat((grossAmount - 100).toFixed(2)), // partial refund mistake
          status: 'PROCESSED'
        }
      });
    }

    // Settlements
    if (scenario !== 'MISSING_SETTLEMENT') {
      let actualSettlement = expectedSettlement;
      if (scenario === 'AMOUNT_MISMATCH') {
        actualSettlement = parseFloat((expectedSettlement - 50).toFixed(2)); // short by 50
      }

      let settledDate = new Date();
      if (scenario === 'DELAYED_SETTLEMENT') {
        settledDate = new Date();
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

      if (scenario === 'DUPLICATE_TRANSACTION') {
        await prisma.settlement.create({
          data: {
            externalSettlementId: settlementId + '_dup',
            paymentId: payment.id,
            amount: actualSettlement,
            status: 'PROCESSED',
            settledAt: settledDate,
          }
        });
      }

      // Bank Transactions
      if (scenario !== 'MISSING_BANK_TRANSACTION') {
        await prisma.bankTransaction.create({
          data: {
            externalTransactionId: txnId,
            settlementId: settlement.id,
            amount: actualSettlement,
            transactionType: 'CREDIT',
            reference: 'UTR' + Math.floor(Math.random() * 100000000),
            transactionDate: settledDate,
            status: 'CLEARED'
          }
        });
      }
    }

    if (scenario === 'ORPHAN_BANK_TRANSACTION') {
      // Bank transaction without a settlement linked
      await prisma.bankTransaction.create({
        data: {
          externalTransactionId: generateId('txn_orphan', i),
          amount: expectedSettlement,
          transactionType: 'CREDIT',
          reference: 'UTR' + Math.floor(Math.random() * 100000000),
          transactionDate: new Date(),
          status: 'CLEARED'
        }
      });
    }

    count++;
    if (count % 20 === 0) console.log(`Generated ${count} records...`);
  }

  console.log(`\nSuccessfully generated ${totalRecords} realistic synthetic records!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
