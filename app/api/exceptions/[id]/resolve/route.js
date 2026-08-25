import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { note, newStatus } = body; // newStatus can be 'INVESTIGATING' or 'RESOLVED'

    if (!note) {
      return NextResponse.json({ error: 'Resolution note is required' }, { status: 400 });
    }

    const validStatuses = ['INVESTIGATING', 'RESOLVED'];
    const targetStatus = validStatuses.includes(newStatus) ? newStatus : 'RESOLVED';

    const exception = await prisma.exception.update({
      where: { id: params.id },
      data: {
        status: targetStatus,
        resolvedAt: targetStatus === 'RESOLVED' ? new Date() : null,
      }
    });

    await prisma.auditLog.create({
      data: {
        entityId: exception.id,
        entityType: 'EXCEPTION',
        action: `EXCEPTION_${targetStatus}`,
        details: { note }
      }
    });

    return NextResponse.json({ data: exception });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
