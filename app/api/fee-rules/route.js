import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const DEFAULT_FEE_RULES = [
  {
    paymentMethod: 'UPI',
    percentageRate: 0.000,
    flatFee: 0.00,
    taxRate: 0.18,
    description: 'UPI / RuPay standard zero-MDR mandate (Interchange-free)'
  },
  {
    paymentMethod: 'CREDIT_CARD',
    percentageRate: 0.018,
    flatFee: 0.00,
    taxRate: 0.18,
    description: 'Domestic Consumer Credit Cards (Visa, Mastercard standard)'
  },
  {
    paymentMethod: 'DEBIT_CARD',
    percentageRate: 0.009,
    flatFee: 0.00,
    taxRate: 0.18,
    description: 'Domestic Debit Cards (RBI capped under 0.9%)'
  },
  {
    paymentMethod: 'NETBANKING',
    percentageRate: 0.000,
    flatFee: 15.00,
    taxRate: 0.18,
    description: 'Netbanking Direct Debit (Flat fee model)'
  },
  {
    paymentMethod: 'WALLET',
    percentageRate: 0.019,
    flatFee: 0.00,
    taxRate: 0.18,
    description: 'Prepaid Payment Instruments & Digital Wallets'
  },
  {
    paymentMethod: 'DEFAULT',
    percentageRate: 0.018,
    flatFee: 0.00,
    taxRate: 0.18,
    description: 'Fallback standard rate for unclassified payment methods'
  }
];

export async function GET() {
  try {
    let rules = await prisma.feeRule.findMany({
      orderBy: { paymentMethod: 'asc' }
    });

    // If no rules exist yet, auto-seed defaults
    if (rules.length === 0) {
      for (const defaultRule of DEFAULT_FEE_RULES) {
        await prisma.feeRule.upsert({
          where: { paymentMethod: defaultRule.paymentMethod },
          update: {},
          create: {
            paymentMethod: defaultRule.paymentMethod,
            percentageRate: defaultRule.percentageRate,
            flatFee: defaultRule.flatFee,
            taxRate: defaultRule.taxRate,
            description: defaultRule.description
          }
        });
      }
      rules = await prisma.feeRule.findMany({
        orderBy: { paymentMethod: 'asc' }
      });
    }

    return NextResponse.json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error('Error fetching fee rules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fee pricing rules' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Support bulk update if rules array is provided
    if (Array.isArray(body.rules)) {
      const updatedRules = [];
      for (const item of body.rules) {
        if (!item.paymentMethod) continue;
        const updated = await prisma.feeRule.upsert({
          where: { paymentMethod: item.paymentMethod.toUpperCase() },
          update: {
            percentageRate: parseFloat(item.percentageRate) || 0,
            flatFee: parseFloat(item.flatFee) || 0,
            taxRate: parseFloat(item.taxRate) ?? 0.18,
            description: item.description || ''
          },
          create: {
            paymentMethod: item.paymentMethod.toUpperCase(),
            percentageRate: parseFloat(item.percentageRate) || 0,
            flatFee: parseFloat(item.flatFee) || 0,
            taxRate: parseFloat(item.taxRate) ?? 0.18,
            description: item.description || ''
          }
        });
        updatedRules.push(updated);
      }
      return NextResponse.json({ success: true, data: updatedRules });
    }

    // Single rule upsert
    const { paymentMethod, percentageRate, flatFee, taxRate, description } = body;
    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'paymentMethod is required' },
        { status: 400 }
      );
    }

    const rule = await prisma.feeRule.upsert({
      where: { paymentMethod: paymentMethod.toUpperCase() },
      update: {
        percentageRate: parseFloat(percentageRate) || 0,
        flatFee: parseFloat(flatFee) || 0,
        taxRate: parseFloat(taxRate) ?? 0.18,
        description: description || ''
      },
      create: {
        paymentMethod: paymentMethod.toUpperCase(),
        percentageRate: parseFloat(percentageRate) || 0,
        flatFee: parseFloat(flatFee) || 0,
        taxRate: parseFloat(taxRate) ?? 0.18,
        description: description || ''
      }
    });

    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    console.error('Error saving fee rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update fee rule' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.feeRule.deleteMany({});
    
    // Re-seed defaults
    for (const defaultRule of DEFAULT_FEE_RULES) {
      await prisma.feeRule.create({
        data: defaultRule
      });
    }

    const rules = await prisma.feeRule.findMany({
      orderBy: { paymentMethod: 'asc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Fee pricing rules reset to default benchmarks',
      data: rules
    });
  } catch (error) {
    console.error('Error resetting fee rules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset fee rules' },
      { status: 500 }
    );
  }
}
