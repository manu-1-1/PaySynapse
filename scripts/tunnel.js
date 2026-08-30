import ngrok from '@ngrok/ngrok';

async function startTunnel() {
  const authtoken = process.env.NGROK_AUTHTOKEN || '3IcXn0wqdoVdbdpdoQWk7EPTB3g_2URDrYWsTEw2FjcCQUfdw';
  const port = process.env.PORT || 3000;

  try {
    const listener = await ngrok.forward({
      addr: port,
      authtoken: authtoken,
    });

    const url = listener.url();
    console.log('\n======================================================');
    console.log('🚀 NGROK TUNNEL LIVE FOR PAYSYNAPSE!');
    console.log('======================================================');
    console.log(`📡 Public URL:         ${url}`);
    console.log(`🎯 Local Port:         http://localhost:${port}`);
    console.log('------------------------------------------------------');
    console.log(`🔗 Razorpay Webhook URL:`);
    console.log(`   ${url}/api/webhooks/razorpay`);
    console.log('======================================================\n');
    console.log('Keep this process running while testing webhooks.');
    
    // Keep the process alive indefinitely with active timer and stdin handle
    setInterval(() => {}, 1000 * 60 * 60);
    if (process.stdin.isTTY) {
      process.stdin.resume();
    }
  } catch (err) {
    console.error('❌ Failed to start ngrok tunnel:', err);
  }
}

startTunnel();
