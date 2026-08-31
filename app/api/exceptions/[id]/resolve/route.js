import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { reconcilePayment, resolveExpectedFee } from '@/lib/reconciliation/engine';

const prisma = new PrismaClient();

export async function POST(request, context) {
  const { params } = context;
  const id = (await params).id;

  try {
    const body = await request.json().catch(() => ({}));
    const { note, newStatus = 'RESOLVED' } = body;

    const exception = await prisma.exception.findUnique({
      where: { id },
      include: {
        payment: {
          include: {
            order: true,
            fees: true,
            refunds: true,
            settlements: {
              include: {
                bankTransactions: true
              }
            }
          }
        }
      }
    });

    if (!exception) {
      return NextResponse.json({ error: 'Exception not found' }, { status: 404 });
    }

    const payment = exception.payment;

    if (payment) {
      const grossAmount = parseFloat(payment.amount.toString());
      const feeRes = await resolveExpectedFee(payment, grossAmount);
      const expectedFee = feeRes.expectedFeeAmount;
      const expectedTax = feeRes.expectedTaxAmount;
      const expectedNetSettlement = parseFloat((grossAmount - expectedFee - expectedTax).toFixed(2));

      // ─── 1. Autonomous Data Remediation by Anomaly Type ───
      switch (exception.type) {
        case 'MISSING_SETTLEMENT': {
          // Generate missing settlement batch and bank clearance UTR
          const newSettlement = await prisma.settlement.create({
            data: {
              externalSettlementId: `setl_fixed_${Date.now()}`,
              paymentId: payment.id,
              amount: expectedNetSettlement,
              status: 'SETTLED',
              settledAt: new Date()
            }
          });

          await prisma.bankTransaction.create({
            data: {
              externalTransactionId: `txn_fixed_${Date.now()}`,
              settlementId: newSettlement.id,
              amount: expectedNetSettlement,
              transactionType: 'CREDIT',
              reference: `CMS/${newSettlement.externalSettlementId}/UTR_CLEARED_${Date.now()}`,
              transactionDate: new Date(),
              status: 'CLEARED'
            }
          });
          break;
        }

        case 'FEE_MISMATCH': {
          // Correct overcharged fee back to contracted flat/percentage rate
          if (payment.fees.length > 0) {
            await prisma.fee.update({
              where: { id: payment.fees[0].id },
              data: {
                amount: expectedFee,
                tax: expectedTax
              }
            });
          }

          // Adjust settlement and bank clearance to true expected net payout
          if (payment.settlements.length > 0) {
            const setl = payment.settlements[0];
            await prisma.settlement.update({
              where: { id: setl.id },
              data: { amount: expectedNetSettlement }
            });

            if (setl.bankTransactions.length > 0) {
              await prisma.bankTransaction.update({
                where: { id: setl.bankTransactions[0].id },
                data: { amount: expectedNetSettlement }
              });
            }
          }
          break;
        }

        case 'AMOUNT_MISMATCH': {
          // Apply Short Settlement True-Up
          if (payment.settlements.length > 0) {
            const setl = payment.settlements[0];
            await prisma.settlement.update({
              where: { id: setl.id },
              data: { amount: expectedNetSettlement }
            });

            if (setl.bankTransactions.length > 0) {
              await prisma.bankTransaction.update({
                where: { id: setl.bankTransactions[0].id },
                data: { amount: expectedNetSettlement }
              });
            }
          }
          break;
        }

        case 'DUPLICATE_TRANSACTION': {
          // Remove redundant duplicate settlement & duplicate bank transactions
          if (payment.settlements.length > 1) {
            const duplicateSettlements = payment.settlements.slice(1);
            for (const dup of duplicateSettlements) {
              await prisma.bankTransaction.deleteMany({
                where: { settlementId: dup.id }
              });
              await prisma.settlement.delete({
                where: { id: dup.id }
              });
            }
          }
          break;
        }

        case 'STATUS_MISMATCH': {
          // Synchronize order state to match captured payment
          if (payment.order) {
            await prisma.order.update({
              where: { id: payment.order.id },
              data: { status: 'PAID' }
            });
          }
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'CAPTURED' }
          });
          break;
        }

        case 'MISSING_REFUND': {
          // Post refund record
          await prisma.refund.create({
            data: {
              externalRefundId: `rfnd_fixed_${Date.now()}`,
              paymentId: payment.id,
              amount: grossAmount,
              status: 'PROCESSED'
            }
          });
          break;
        }

        default:
          break;
      }

      // ─── 2. Re-run 3-Way Reconciliation Engine ───
      await reconcilePayment(payment.id);
    }

    // ─── 3. Mark Exception as Resolved & Audit ───
    const updatedException = await prisma.exception.update({
      where: { id },
      data: {
        status: newStatus,
        resolvedAt: newStatus === 'RESOLVED' ? new Date() : null
      }
    });

    await prisma.auditLog.create({
      data: {
        entityId: id,
        entityType: 'EXCEPTION',
        action: `EXCEPTION_${newStatus}`,
        details: { note: note || 'Autonomous remediation applied via Digital Twin' }
      }
    });

    // ─── 4. Fetch the Fresh Healed Transaction ───
    let refreshedTx = null;
    if (payment) {
      refreshedTx = await prisma.payment.findUnique({
        where: { id: payment.id },
        include: {
          order: true,
          fees: true,
          refunds: true,
          settlements: {
            include: {
              bankTransactions: true
            }
          },
          exceptions: {
            where: { status: { in: ['OPEN', 'INVESTIGATING'] } }
          },
          reconciliations: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedException,
      refreshedTx
    });
  } catch (error) {
    console.error('Exception resolution error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
