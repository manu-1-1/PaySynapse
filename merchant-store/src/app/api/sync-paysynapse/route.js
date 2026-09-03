import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { paymentId, orderId, amount, currency = 'INR', method = 'card' } = await req.json();

    if (!paymentId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payload = {
      event: 'payment.captured',
      event_id: `evt_sync_${Date.now()}`,
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: orderId || `ord_${Date.now()}`,
            amount: Math.round(amount * 100),
            currency: currency,
            status: 'captured',
            method: method,
            fee: Math.round(amount * 100 * 0.02), // 2% gateway fee standard
            tax: Math.round(amount * 100 * 0.02 * 0.18), // 18% GST on fee
            created_at: Math.floor(Date.now() / 1000)
          }
        }
      }
    };

    // Forward to local PaySynapse reconciler
    const res = await fetch('http://localhost:3000/api/webhooks/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-mode': 'true',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return NextResponse.json({ success: true, synced: data });
  } catch (error) {
    console.error('[Sync to PaySynapse Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
