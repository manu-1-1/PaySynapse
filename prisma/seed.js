const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding small demo record...')
  
  const merchant = await prisma.merchant.create({
    data: {
      name: 'Demo Merchant',
      orders: {
        create: {
          externalOrderId: 'order_demo_123',
          amount: 10000,
          currency: 'INR',
          status: 'PAID',
          payments: {
            create: {
              externalPaymentId: 'pay_demo_123',
              amount: 10000,
              currency: 'INR',
              status: 'CAPTURED',
              method: 'UPI',
              capturedAt: new Date(),
              fees: {
                create: {
                  amount: 180,
                  tax: 32.40
                }
              },
              settlements: {
                create: {
                  externalSettlementId: 'set_demo_123',
                  amount: 9787.60,
                  status: 'PROCESSED',
                  settledAt: new Date()
                }
              }
            }
          }
        }
      }
    }
  })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
