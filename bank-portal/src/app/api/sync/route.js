import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const paysynapseUrl = process.env.NEXT_PUBLIC_PAYSYNAPSE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${paysynapseUrl}/api/reconciliation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        error: errData.error || `PaySynapse responded with status ${res.status}`
      }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      message: 'Successfully triggered PaySynapse 5-point reconciliation engine.',
      data
    });
  } catch (error) {
    console.error('Error syncing with PaySynapse:', error);
    return NextResponse.json({
      success: false,
      error: `Could not connect to PaySynapse at ${paysynapseUrl}. Ensure PaySynapse is running on port 3000.`
    }, { status: 500 });
  }
}
