import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    const transactions = await prisma.bankTransaction.findMany({
      orderBy: { transactionDate: 'desc' },
      take: 200,
      include: {
        settlement: {
          include: {
            payment: {
              include: {
                order: true
              }
            }
          }
        }
      }
    });

    if (format === 'csv') {
      const headers = ['Transaction_Date', 'Bank_Reference_UTR', 'External_Txn_ID', 'Settlement_ID', 'Payment_ID', 'Order_ID', 'Transaction_Type', 'Amount_INR', 'Clearing_Status', 'Escrow_Account'];
      const rows = transactions.map(tx => {
        return [
          new Date(tx.transactionDate).toISOString(),
          tx.reference || 'N/A',
          tx.externalTransactionId || 'N/A',
          tx.settlementId || 'N/A',
          tx.settlement?.paymentId || 'N/A',
          tx.settlement?.payment?.orderId || 'N/A',
          tx.transactionType,
          parseFloat(tx.amount.toString()).toFixed(2),
          tx.status,
          'APEX-NODAL-ESCROW-001'
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="APEX_NODAL_STATEMENT_${Date.now()}.csv"`
        }
      });
    } else if (format === 'mt940') {
      // Generate MT940 Swift / Banking format
      let mt940 = `:20:APEXNODAL${Date.now()}\n:25:APEX9021000109\n:28C:00001/001\n:60F:C260101INR12500000,00\n`;
      transactions.forEach((tx, idx) => {
        const d = new Date(tx.transactionDate);
        const dateStr = d.toISOString().slice(2, 10).replace(/-/g, '');
        const amtStr = parseFloat(tx.amount.toString()).toFixed(2).replace('.', ',');
        mt940 += `:61:${dateStr}C${amtStr}NTRF${tx.reference || 'UTR'}\n:86:SETTLEMENT DISBURSEMENT / ${tx.externalTransactionId}\n`;
      });
      mt940 += `:62F:C260101INR14500000,00\n-`;

      return new Response(mt940, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="APEX_MT940_FEED_${Date.now()}.txt"`
        }
      });
    }

    return NextResponse.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
