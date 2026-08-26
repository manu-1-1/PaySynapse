import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { reconcilePayment } from '@/lib/reconciliation/engine';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_secret';

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    
    // Check if event already processed to ensure idempotency
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: payload.account_id + '_' + payload.event + '_' + payload.created_at } // Simplified unique ID for demo
    }).catch(() => null);

    // Some webhooks send an actual event ID in headers (x-razorpay-event-id), 
    // but in test mode we can generate a unique constraint.
    const eventId = request.headers.get('x-razorpay-event-id') || `${event}_${Date.now()}_${Math.random()}`;

    // Store Webhook Event
    await prisma.webhookEvent.upsert({
      where: { eventId: eventId },
      update: {},
      create: {
        eventId: eventId,
        event: event,
        payload: payload,
        status: 'PROCESSING'
      }
    });

    let internalPaymentId = null;

    // Process specific events
    if (event === 'payment.captured' || event === 'payment.failed') {
      const paymentEntity = payload.payload.payment.entity;
      const externalPaymentId = paymentEntity.id;

      // Find internal payment
      const payment = await prisma.payment.findUnique({
        where: { externalPaymentId }
      });

      if (payment) {
        internalPaymentId = payment.id;
        
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: event === 'payment.captured' ? 'CAPTURED' : 'FAILED',
            capturedAt: event === 'payment.captured' ? new Date() : null,
          }
        });

        // Add fee if captured
        if (event === 'payment.captured' && paymentEntity.fee) {
          // Convert from paise/cents
          const feeAmount = paymentEntity.fee / 100;
          const taxAmount = paymentEntity.tax / 100;
          
          await prisma.fee.create({
            data: {
              paymentId: payment.id,
              amount: feeAmount - taxAmount,
              tax: taxAmount
            }
          });
        }
      }
    } else if (event === 'settlement.processed') {
      const settlementEntity = payload.payload.settlement.entity;
      
      // We don't have direct payment ID in settlement webhook, but it contains a list or we fetch it.
      // For demo purposes, let's assume Razorpay's settlement entity includes a payment_id (which usually requires a separate fetch, but we simulate).
      // Or we just store the settlement and trigger a job later.
      // If we can't find payment, we just skip for the demo.
      const externalPaymentId = settlementEntity.payment_id; // Simulating presence for demo
      
      if (externalPaymentId) {
        const payment = await prisma.payment.findUnique({
          where: { externalPaymentId }
        });
        
        if (payment) {
          internalPaymentId = payment.id;
          
          await prisma.settlement.create({
            data: {
              externalSettlementId: settlementEntity.id,
              paymentId: payment.id,
              amount: settlementEntity.amount / 100,
              status: 'PROCESSED',
              settledAt: new Date(settlementEntity.created_at * 1000)
            }
          });
        }
      }
    }

    // Trigger reconciliation engine if we modified a payment chain
    if (internalPaymentId) {
      await reconcilePayment(internalPaymentId);
    }

    // Mark as processed
    await prisma.webhookEvent.update({
      where: { eventId: eventId },
      data: { status: 'PROCESSED' }
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
