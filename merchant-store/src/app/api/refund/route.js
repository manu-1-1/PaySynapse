import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { paymentId } = await req.json();
    
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Initiate a full refund against the payment
    const refund = await razorpay.payments.refund(paymentId, {
       speed: "optimum"
    });
    
    return NextResponse.json({ success: true, refund });
  } catch (error) {
    console.error("Refund Error:", error);
    return NextResponse.json(
      { error: error.error?.description || error.message || 'Error processing refund' },
      { status: 500 }
    );
  }
}
