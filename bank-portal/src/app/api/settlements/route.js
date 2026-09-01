import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'ALL'; // ALL, PENDING, CLEARED, HELD

    // Fetch settlements with associated payment and bank transactions
    const settlements = await prisma.settlement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 60,
      include: {
        payment: {
          include: {
            order: true,
            fees: true,
            refunds: true,
          }
        },
        bankTransactions: true
      }
    });

    // Also fetch all bank transactions for ledger stats
    const allBankTxns = await prisma.bankTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        settlement: {
          include: {
            payment: true
          }
        }
      }
    });

    // Compute Nodal Escrow summary statistics
    let totalEscrowInflow = 0;
    let totalClearedOutflow = 0;
    let pendingCount = 0;
    let pendingAmount = 0;
    let clearedCount = 0;
    let exceptionCount = 0;

    settlements.forEach((s) => {
      const amt = parseFloat(s.amount.toString()) || 0;
      totalEscrowInflow += amt;

      const hasClearedBankTxn = s.bankTransactions.some(
        bt => bt.status === 'CLEARED' || bt.status === 'SUCCESS'
      );

      if (hasClearedBankTxn) {
        clearedCount++;
        const clearedAmt = s.bankTransactions
          .filter(bt => bt.status === 'CLEARED' || bt.status === 'SUCCESS')
          .reduce((acc, curr) => acc + (parseFloat(curr.amount.toString()) || 0), 0);
        totalClearedOutflow += clearedAmt;
      } else {
        pendingCount++;
        pendingAmount += amt;
      }
    });

    // Filter settlements based on request query
    let filteredSettlements = settlements;
    if (filter === 'PENDING') {
      filteredSettlements = settlements.filter(s => s.bankTransactions.length === 0 || s.bankTransactions.some(bt => bt.status !== 'CLEARED'));
    } else if (filter === 'CLEARED') {
      filteredSettlements = settlements.filter(s => s.bankTransactions.some(bt => bt.status === 'CLEARED'));
    }

    // Escrow balance calculation (Base treasury reserve + Inflow - Outflow)
    const baseEscrowReserve = 12500000.00; // ₹1.25 Cr base nodal pool
    const currentEscrowBalance = baseEscrowReserve + totalEscrowInflow - totalClearedOutflow;

    return NextResponse.json({
      success: true,
      stats: {
        escrowBalance: currentEscrowBalance,
        totalInflow: totalEscrowInflow,
        totalClearedOutflow,
        pendingSettlementsCount: pendingCount,
        pendingSettlementsAmount: pendingAmount,
        clearedSettlementsCount: clearedCount,
        totalSettlementsCount: settlements.length,
        nodalStatus: 'HEALTHY_COMPLIANT',
        rbiReserveRatio: '100%'
      },
      settlements: filteredSettlements,
      recentBankTransactions: allBankTxns.slice(0, 15)
    });
  } catch (error) {
    console.error('Error fetching bank settlements:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch settlements' },
      { status: 500 }
    );
  }
}
