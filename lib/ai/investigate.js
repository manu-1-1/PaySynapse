import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Only initialize if API key exists
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function investigateException(exceptionId) {
  // 1. Fetch ALL factual data related to this exception
  const exception = await prisma.exception.findUnique({
    where: { id: exceptionId },
    include: {
      payment: {
        include: {
          order: true,
          fees: true,
          refunds: true,
          settlements: {
            include: {
              bankTransactions: true
            }
          },
          reconciliations: true
        }
      }
    }
  });

  if (!exception) {
    throw new Error('Exception not found for AI investigation');
  }

  // If no API key, return a deterministic mock analysis so the UI doesn't break
  if (!ai) {
    console.warn('GEMINI_API_KEY not found. Returning mocked AI investigation.');
    
    let mockExplanation = '';
    let mockAction = '';

    if (exception.type === 'AMOUNT_MISMATCH') {
      mockExplanation = `The gateway captured ${exception.payment.amount} INR, but the expected settlement after fees was not met by the actual bank deposit. A difference of ${exception.financialImpact} INR was detected.`;
      mockAction = 'Review gateway fee structure for recent changes or unrecorded tax deductions.';
    } else if (exception.type === 'MISSING_SETTLEMENT') {
      mockExplanation = `Payment ${exception.payment.externalPaymentId} was successfully captured on ${exception.payment.capturedAt?.toLocaleDateString()}, but no settlement event or bank deposit has been recorded matching this payment over the standard T+2 window.`;
      mockAction = 'Raise a ticket with the payment gateway support referencing the payment ID to track the delayed settlement.';
    } else {
      mockExplanation = `An anomaly of type ${exception.type} was detected affecting ${exception.financialImpact} INR.`;
      mockAction = 'Manual review required by operations team.';
    }

    return {
      explanation: mockExplanation,
      confidence: 0.85,
      recommendedAction: mockAction,
      mocked: true
    };
  }

  // 2. Construct a strict, fact-based prompt
  const facts = JSON.stringify(exception, (key, value) => {
    // Avoid sending massive deeply nested cyclical objects if any exist, but Prisma output is usually safe JSON
    return value;
  }, 2);

  const prompt = `
You are an expert Financial Operations Analyst AI.
Your task is to investigate a financial discrepancy (Exception) using ONLY the hard data provided below.

CRITICAL RULES:
1. DO NOT HALLUCINATE NUMBERS. Only use amounts, dates, and IDs present in the JSON facts.
2. DO NOT GUESS. If the data does not explain the root cause, state that the root cause is unknown.
3. Be concise and professional.

FACTS (JSON):
${facts}

Based on these facts, please provide an investigation report in the following strict JSON format:
{
  "explanation": "A clear, 2-3 sentence explanation of exactly what happened.",
  "confidence": 0.95, // A float between 0.0 and 1.0 representing your confidence in the explanation based on the facts provided
  "recommendedAction": "A specific 1-sentence recommendation on how the ops team should resolve this (e.g. 'File a dispute with Razorpay for Payment ID XYZ')."
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const result = JSON.parse(response.text());
    
    // 3. Save AI findings to the exception record
    await prisma.exception.update({
      where: { id: exceptionId },
      data: {
        aiExplanation: result.explanation,
        aiConfidence: result.confidence,
        recommendedAction: result.recommendedAction
      }
    });

    return result;
  } catch (error) {
    console.error('AI Investigation Failed:', error);
    throw new Error('Failed to generate AI investigation');
  }
}
