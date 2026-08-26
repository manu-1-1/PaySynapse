import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, context) { const { params } = context; const id = (await params).id;
  try {
    const exception = await prisma.exception.findUnique({
      where: { id: id },
      include: {
        payment: {
          include: {
            order: true,
            reconciliations: true
          }
        }
      }
    });

    if (!exception) {
      return NextResponse.json({ error: 'Exception not found' }, { status: 404 });
    }

    return NextResponse.json({ data: exception });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
