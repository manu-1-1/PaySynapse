const crypto = require('crypto');

const webhookUrl = 'http://localhost:3000/api/webhooks/razorpay';
const secret = 'test_secret';

// Simulate a payment capture event
const payload = {
  entity: "event",
  account_id: "acc_demo_123",
  event: "payment.captured",
  contains: ["payment"],
  payload: {
    payment: {
      entity: {
        id: "pay_demo_" + Date.now(),
        entity: "payment",
        amount: 500000, // 5000.00 INR
        currency: "INR",
        status: "captured",
        order_id: "order_demo_" + Date.now(),
        fee: 10000, // 100.00 INR
        tax: 1800,  // 18.00 INR
        method: "upi",
        created_at: Math.floor(Date.now() / 1000)
      }
    }
  },
  created_at: Math.floor(Date.now() / 1000)
};

const rawBody = JSON.stringify(payload);

const signature = crypto
  .createHmac('sha256', secret)
  .update(rawBody)
  .digest('hex');

console.log('Sending webhook simulation to', webhookUrl);

fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-razorpay-signature': signature,
    'x-razorpay-event-id': 'evt_demo_' + Date.now(),
    'x-test-mode': 'true'
  },
  body: rawBody
})
.then(res => res.json())
.then(data => {
  console.log('Webhook Response:', data);
  console.log('Simulation complete! Check your Next.js dashboard for real-time notifications.');
})
.catch(err => console.error('Failed to send webhook:', err));
