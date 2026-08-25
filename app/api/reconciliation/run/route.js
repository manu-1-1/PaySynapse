import { NextResponse } from 'next/server';
import { runFullReconciliation } from '@/lib/reconciliation/engine';

export async function POST() {
  try {
    const results = await runFullReconciliation();
    return NextResponse.json({ data: results });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
