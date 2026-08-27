import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const exceptions = await prisma.exception.findMany({
      where: whereClause,
      include: {
        payment: {
          include: {
            order: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Generate CSV
    const headers = [
      'Exception ID',
      'Created At',
      'Payment ID',
      'Order ID',
      'Type',
      'Severity',
      'Financial Impact (INR)',
      'Status',
      'Resolved At',
      'Description'
    ];

    const rows = exceptions.map(ex => {
      return [
        ex.id,
        ex.createdAt.toISOString(),
        ex.payment?.externalPaymentId || 'UNLINKED',
        ex.payment?.order?.externalOrderId || 'UNLINKED',
        ex.type,
        ex.severity,
        ex.financialImpact.toString(),
        ex.status,
        ex.resolvedAt ? ex.resolvedAt.toISOString() : '',
        `"${(ex.description || '').replace(/"/g, '""')}"` // Escape quotes for CSV
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="exceptions_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
