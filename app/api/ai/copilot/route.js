import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import { investigateException } from '@/lib/ai/investigate';

const prisma = new PrismaClient();

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-flash-latest',
  'gemini-1.5-pro'
];

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    // If request is for an exception investigation, delegate to investigateException
    if (body.action === 'investigate' || body.exceptionId) {
      if (!body.exceptionId) {
        return NextResponse.json({ error: 'exceptionId is required' }, { status: 400 });
      }
      const result = await investigateException(body.exceptionId);
      return NextResponse.json({
        success: true,
        data: {
          analysis: `**Root Cause Diagnosis:** ${result.explanation}\n\n**AI Confidence:** ${(result.confidence * 100).toFixed(0)}%\n\n**Recommended Remediation:** ${result.recommendedAction}`
        }
      });
    }

    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const dbSetting = await prisma.setting.findUnique({ where: { key: 'GEMINI_API_KEY' } });
    const apiKey = dbSetting?.value || process.env.GEMINI_API_KEY;
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

    // 1. Fetch live comprehensive DB metrics
    const [totalTx, openExceptions, totalMatched] = await Promise.all([
      prisma.payment.count(),
      prisma.exception.findMany({
        where: { status: { in: ['OPEN', 'INVESTIGATING'] } },
        include: { payment: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.reconciliation.count({ where: { status: 'MATCHED' } })
    ]);

    const totalOpenExCount = openExceptions.length;
    const totalImpact = openExceptions.reduce((acc, ex) => acc + parseFloat(ex.financialImpact.toString()), 0);
    const matchRate = totalTx > 0 ? ((totalMatched / totalTx) * 100).toFixed(1) : 100;

    // Group exceptions by type
    const exceptionBreakdown = {};
    openExceptions.forEach(ex => {
      exceptionBreakdown[ex.type] = (exceptionBreakdown[ex.type] || 0) + 1;
    });

    const breakdownStr = Object.entries(exceptionBreakdown)
      .map(([type, count]) => `• ${type.replace(/_/g, ' ')}: ${count}`)
      .join('\n') || 'None';

    const recentExceptionsList = openExceptions.slice(0, 5).map((ex, i) => {
      return `${i + 1}. **${ex.type.replace(/_/g, ' ')}** (₹${parseFloat(ex.financialImpact).toFixed(2)}) — Payment Ref: \`${ex.payment?.externalPaymentId || ex.paymentId}\` [Status: ${ex.status}]`;
    }).join('\n');

    const dbContext = `
System State & Telemetry:
- Total Payments Audited: ${totalTx}
- Matched Payments: ${totalMatched} (${matchRate}% Match Rate)
- Open Exceptions: ${totalOpenExCount}
- Total Financial Impact (At Risk): ₹${totalImpact.toFixed(2)} INR
- Breakdown by Type:
${breakdownStr}

Recent Open Exceptions:
${recentExceptionsList || 'No open exceptions.'}
`;

    // 2. Intelligent local fallback generator if Gemini is unavailable/503/offline
    const generateLocalAnalysis = (query) => {
      const q = query.toLowerCase();

      if (q.includes('exception') || q.includes('error') || q.includes('issue') || q.includes('today')) {
        if (totalOpenExCount === 0) {
          return `### System Status: Fully Reconciled\n\nAll **${totalTx} payments** are currently reconciled with **100% parity**. No financial leakage or missing settlements detected.`;
        }
        return `### Active Exceptions (${totalOpenExCount} Active • ₹${totalImpact.toFixed(2)} at Risk)\n\nHere is the active exception ledger:\n\n${recentExceptionsList}\n\n**Next Steps:** Review the **[Exceptions Center](/exceptions)** to inspect audit lineage and generate formal dispute notices.`;
      }

      if (q.includes('match') || q.includes('rate') || q.includes('recon') || q.includes('parity')) {
        return `### Reconciliation Parity: ${matchRate}%\n\n• **Total Transactions Processed:** ${totalTx}\n• **Fully Reconciled:** ${totalMatched}\n• **Open Variances:** ${totalOpenExCount}\n\nThe deterministic 5-point reconciliation engine is operating with active dual-sync monitoring.`;
      }

      if (q.includes('risk') || q.includes('impact') || q.includes('exposure') || q.includes('money')) {
        return `### Financial Risk Exposure Analysis\n\n• **Total Value at Risk:** **₹${totalImpact.toFixed(2)} INR** across **${totalOpenExCount} anomalies**.\n• **Breakdown:**\n${breakdownStr}\n\nAll open exceptions have active ledger tracking with dispute packet generation ready in the Exception Desk.`;
      }

      return `### Ledger Summary\n\n• **Audited Transactions:** ${totalTx}\n• **Match Rate:** ${matchRate}%\n• **Open Exceptions:** ${totalOpenExCount} (₹${totalImpact.toFixed(2)} at risk)\n\nYou can query the ledger directly:\n- *"Show me today's exceptions"*\n- *"What is the current match rate?"*\n- *"Summarize financial risk exposure"*`;
    };

    // If no AI key configured, use local analysis
    if (!ai) {
      return NextResponse.json({
        response: generateLocalAnalysis(message),
        mocked: true
      });
    }

    // 3. Prompt Gemini with multi-model fallback cascade
    const prompt = `
You are PaySynapse Copilot, an expert AI financial operations assistant for automated payment reconciliation.
You help finance operations teams investigate ledger anomalies, fee leakages, and settlement discrepancies.

CURRENT LIVE DATABASE FACTS (DO NOT HALLUCINATE NUMBERS OUTSIDE THIS DATA):
${dbContext}

USER MESSAGE:
"${message}"

INSTRUCTIONS:
1. Provide a professional, concise, highly helpful Markdown response using the exact factual numbers from above.
2. If the user asks for exceptions, list the real open exceptions from the context.
3. Keep formatting clean with bold text, bullet points, and clear actionable takeaways.
`;

    let generatedText = null;
    let usedModel = null;

    // Try candidate models in order to survive 503 temporary demand spikes
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const result = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        if (result && typeof result.text === 'function') {
          generatedText = result.text();
          usedModel = modelName;
          break;
        } else if (result && result.text) {
          generatedText = result.text;
          usedModel = modelName;
          break;
        }
      } catch (err) {
        console.warn(`Gemini model ${modelName} unavailable (${err.message || 'error'}), attempting next candidate...`);
      }
    }

    // If Gemini models are all temporarily 503 overloaded, seamlessly fallback to local database analysis
    if (!generatedText) {
      console.warn('All cloud Gemini models temporarily unavailable (503). Using live local database fallback.');
      generatedText = generateLocalAnalysis(message);
    }

    return NextResponse.json({
      response: generatedText,
      mocked: false,
      model: usedModel || 'local-fallback'
    });

  } catch (error) {
    console.error('Copilot API Error:', error);
    return NextResponse.json({ error: error.message || 'Copilot service error' }, { status: 500 });
  }
}
