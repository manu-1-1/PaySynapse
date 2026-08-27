import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const dbSetting = await prisma.setting.findUnique({ where: { key: 'GEMINI_API_KEY' } });
    const apiKey = dbSetting?.value || process.env.GEMINI_API_KEY;
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

    // 1. Fetch some global DB context to inform the AI
    const totalTx = await prisma.payment.count();
    const totalEx = await prisma.exception.count({ where: { status: 'OPEN' } });
    
    // Calculate total financial impact of open exceptions
    const exceptions = await prisma.exception.findMany({
      where: { status: 'OPEN' },
      select: { financialImpact: true }
    });
    
    let totalImpact = 0;
    for (const ex of exceptions) {
      totalImpact += parseFloat(ex.financialImpact.toString());
    }

    const dbContext = `
System State:
- Total Payments Processed: ${totalTx}
- Open Exceptions: ${totalEx}
- Total Financial Impact (Open): ${totalImpact} INR
`;

    // 2. If no AI key, mock the response
    if (!ai) {
      const mockResponses = [
        `Based on the database, we currently have ${totalEx} open exceptions impacting ${totalImpact} INR. I recommend reviewing the "Missing Settlement" exceptions first.`,
        `That's a great question. Looking at our recent transactions (${totalTx} total), our reconciliation engine is capturing all discrepancies in real-time.`,
        `I am operating in mock mode because no GEMINI_API_KEY was provided. However, I can confirm the system is healthy and tracking ${totalImpact} INR at risk.`
      ];
      
      const randomMock = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      return NextResponse.json({ 
        response: randomMock,
        mocked: true 
      });
    }

    // 3. Prompt Gemini with context
    const prompt = `
You are PaySynapse Copilot, an expert AI financial operations assistant.
You help operators query their reconciliation data and investigate systemic issues.

CURRENT DATABASE CONTEXT (DO NOT HALLUCINATE OUTSIDE THIS DATA):
${dbContext}

USER MESSAGE:
"${message}"

Provide a highly professional, concise, and helpful response. If you are asked for specific records, advise the user to use the 'Transactions' or 'Exceptions' dashboard since you are currently answering based on aggregate metrics.
`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return NextResponse.json({ 
      response: result.text(),
      mocked: false
    });

  } catch (error) {
    console.error('Copilot API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
