# Module 05: AI Copilot & Gemini Investigation Engine

## 5.1 Overview & Model Selection
PaySynapse leverages the **Google Gemini 2.5 Flash** model (`gemini-2.5-flash`) via the official `@google/genai` SDK for two distinct intelligence workflows:
1. **Automated Root Cause Investigation** ([`lib/ai/investigate.js`](file:///d:/Projects/PaySynapse/lib/ai/investigate.js)): Deep-dive hypothesis generation on specific financial exception records.
2. **Natural Language Copilot Chat** ([`app/api/ai/copilot/route.js`](file:///d:/Projects/PaySynapse/app/api/ai/copilot/route.js)): Conversational operator workspace for querying aggregate financial health and risk exposure.

---

## 5.2 Strict Anti-Hallucination Prompt Architecture
Finance platforms cannot tolerate hallucinated ledger balances or invented gateway payment IDs. PaySynapse enforces strict prompt guardrails:

```json
{
  "system_instruction": "You are an expert Financial Operations Analyst AI. Your task is to investigate a financial discrepancy using ONLY the hard data provided in the JSON facts.",
  "rules": [
    "DO NOT HALLUCINATE NUMBERS. Only use amounts, dates, and IDs present in the JSON facts.",
    "DO NOT GUESS. If data does not explain root cause, state that root cause is unknown.",
    "Format response in strict JSON schema containing: explanation, confidence, recommendedAction."
  ]
}
```

---

## 5.3 Automated Root Cause Analysis Workflow

```
[ Operations User Clicks "AI Investigate" on Exception ]
                           |
                           v
           Fetch Exception + Full Payment Graph Data
                           |
                           v
           Check GEMINI_API_KEY in `Setting` / `.env`
                           |
            +--------------+--------------+
            |                             |
      (API Key Present)             (No API Key)
            |                             |
            v                             v
    Invoke Google Gemini API      Return Deterministic Mock Report
    with Fact-Constrained JSON     (Pre-calculated by Exception Type)
            |                             |
            +--------------+--------------+
                           |
                           v
         Extract JSON Response: { explanation, confidence, recommendedAction }
                           |
                           v
         Persist AI Findings in `Exception` Table & Return to Client
```

---

## 5.4 Deterministic AI Fallback Strategy
If `GEMINI_API_KEY` is not provided (e.g. initial demo setup), the engine gracefully falls back to deterministic rule-based explanations based on exception type:

* **`AMOUNT_MISMATCH`**: *"The gateway captured X INR, but expected settlement after fees was not met by actual bank deposit. Difference of Y INR was detected."*
* **`MISSING_SETTLEMENT`**: *"Payment XYZ was captured, but no settlement event or bank deposit recorded over standard T+2 window."*
* **`STATUS_MISMATCH`**: *"Gateway reports payment as FAILED, but bank settlement was processed. Indicates race condition in webhook delivery."*
* **`ORPHAN_BANK_TRANSACTION`**: *"Bank transaction credited on date, but no corresponding settlement report found."*

---

## 5.5 AI Copilot Natural Language Interface
The Copilot endpoint aggregates real-time metrics (`totalPayments`, `openExceptionsCount`, `totalFinancialImpactAtRisk`) from Prisma and passes it as context to Gemini.

Operators can ask queries like:
* *"What is our total financial risk exposure right now?"*
* *"Which exception category requires immediate resolution?"*
* *"Summarize overall platform health across all gateway transactions."*
