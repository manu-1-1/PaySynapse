const { runFullReconciliation } = require('../lib/reconciliation/engine');

async function main() {
  console.log('Running deterministic reconciliation engine...');
  const start = Date.now();
  
  const results = await runFullReconciliation();
  
  const end = Date.now();
  console.log(`\nReconciliation Complete in ${end - start}ms`);
  console.log('====================================');
  console.log(`Total Processed : ${results.totalProcessed}`);
  console.log(`Matched         : ${results.matched}`);
  console.log(`Exceptions      : ${results.exceptions}`);
  console.log(`Match Rate      : ${results.matchRate}%`);
  console.log('====================================');
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
