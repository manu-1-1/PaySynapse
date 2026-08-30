# PaySynapse — Finance Terms, Reconciliation Logic & Exception Guide

## 1. Purpose

PaySynapse is a financial operations (FinOps) and automated reconciliation platform for high-volume payment environments.

Its core purpose is to answer:

> **For every payment, did the money move through the expected lifecycle, were the correct charges deducted, did the expected settlement happen, and did the money actually reach the merchant's bank?**

PaySynapse combines:

- Deterministic financial reconciliation
- Payment and settlement tracking
- Financial Digital Twin visualization
- Exception detection
- AI-assisted root-cause analysis
- Audit and dispute evidence generation

The system should **not use AI to decide whether a transaction mathematically reconciles**. Mathematical reconciliation is performed by deterministic rules. AI is used afterward to help investigate and explain exceptions.

---

## 1.1 Enterprise Data Ingestion Architecture: The 3 Independent Data Feeds

In real-world financial operations, money and data originate from three completely separate systems:

```text
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│   FEED A: Merchant DB   │     │  FEED B: Gateway / PG   │     │   FEED C: Bank Network  │
│    (Core Order Ledger)  │     │ (Razorpay/Stripe/etc.)  │     │ (HDFC/ICICI Statement) │
├─────────────────────────┤     ├─────────────────────────┤     ├─────────────────────────┤
│ • order_id              │     │ • payment_id            │     │ • Bank Credit Timestamp │
│ • Customer Details      │     │ • order_id (Reference)  │     │ • Net Amount Credited   │
│ • Checkout Gross Amount │     │ • Method (UPI/Card/NB)  │     │ • UTR Reference Number  │
│ • Order Status (PAID)   │     │ • Billed Fee & GST      │     │ • Settlement Payout ID  │
│                         │     │ • Settlement Batch ID   │     │                         │
└────────────┬────────────┘     └────────────┬────────────┘     └────────────┬────────────┘
             │                               │                               │
             ▼                               ▼                               ▼
       [API / DB Sync]             [Webhooks & MIS Reports]            [SFTP / Bank Feed]
             │                               │                               │
             └───────────────────────┬───────┴───────────────────────────────┘
                                     │
                                     ▼
                   ┌───────────────────────────────────┐
                   │     PaySynapse Ingestion Engine   │
                   └───────────────────────────────────┘
```

### How the Feeds are Ingested:

1. **Feed A (Merchant Order DB)**:
   * Captured when customer completes checkout. Transmitted via Merchant Backend API or checkout webhooks.
2. **Feed B (Payment Gateway / PG)**:
   * **Real-time**: Webhook events (`payment.captured`, `settlement.processed`).
   * **Batch**: Daily Gateway Settlement MIS CSV reports downloaded via automated API.
3. **Feed C (Bank Network / Statements)**:
   * **The Bank Side**: Every midnight at 02:00 AM, corporate banks (e.g. HDFC, ICICI, Citibank, Chase) place an automated statement file on a secure **SFTP server** in standard banking formats:
     * **MT940** (SWIFT Customer Statement Message)
     * **CAMT.053** (ISO 20022 XML Bank Statement)
     * **Bank MIS Excel/CSV**
   * **The Ingestion**: A cron job in PaySynapse reads the SFTP server, extracts the lines with NEFT/RTGS/IMPS credits, parses the transaction narrative (which contains the **UTR Number**), and inserts them into the `BankTransaction` table.
   * **The Final Match**: PaySynapse matches the Bank UTR and net credit amount against the Gateway Settlement payout ID.

---

# 2. Basic Financial Terms

## 2.1 Merchant

The business that receives money from customers.

Example:

```text
An online store selling a laptop
```

The merchant expects the customer's payment to eventually reach its bank account after applicable fees and deductions.

---

## 2.2 Customer

The person who purchases a product or service and makes the payment.

Example:

```text
Customer pays ₹50,000 for a laptop.
```

---

## 2.3 Order

The commercial transaction created by the merchant's system.

Example:

```text
Order ID: ORD-1001
Amount:   ₹50,000
Status:   SUCCESS
```

An order represents what the customer was expected to pay. It does not by itself prove that the money was successfully captured or settled.

---

## 2.4 Payment Gateway

A payment gateway/payment service processes the customer's payment and records the payment transaction.

Examples may include:

- Razorpay
- Stripe
- Cashfree

The gateway can provide information such as:

```text
Payment ID
Order ID
Amount
Payment status
Gateway
Timestamp
```

---

## 2.5 Payment Capture

A payment being **captured** generally means the gateway has successfully processed/secured the payment amount for settlement according to the payment flow.

Example:

```text
Order:   ₹50,000
Payment: ₹50,000
Status:  CAPTURED
```

Capture does **not** necessarily mean the money has already reached the merchant's bank account.

---

# 3. The Five-Stage Financial Lifecycle

PaySynapse models the movement of a payment through five major nodes:

```text
[01. Merchant Order]
          ↓
[02. Gateway Payment]
          ↓
[03. Charges & GST]
          ↓
[04. Gateway Settlement]
          ↓
[05. Bank Clearance / UTR]
```

This five-stage representation is the foundation of the PaySynapse Digital Twin.

---

# 4. Stage 01 — Merchant Order

The merchant creates an order.

Example:

```text
Order ID: ORD-1001
Amount:   ₹50,000
Status:   SUCCESS
```

Meaning:

> The merchant's system expects ₹50,000 for this order.

PaySynapse uses the order as the starting point for reconciliation.

---

# 5. Stage 02 — Gateway Payment

The customer pays through a gateway.

Example:

```text
Payment ID: PAY-1001
Order ID:   ORD-1001
Amount:     ₹50,000
Status:     CAPTURED
Gateway:    Razorpay
```

PaySynapse checks that the payment corresponds to the correct order.

Example:

```text
Order amount   = ₹50,000
Payment amount = ₹50,000

Order status   = SUCCESS
Payment status = CAPTURED

Result: MATCH
```

A mismatch can indicate a `STATUS_MISMATCH` or another transaction inconsistency.

---

# 6. Stage 03 — Charges, MDR and GST

## 6.1 MDR

**MDR = Merchant Discount Rate**

It is the fee charged for processing a payment, usually expressed as a percentage of the transaction amount.

Example:

```text
Gross payment = ₹50,000
MDR            = 1.8%
```

Gateway fee:

```text
₹50,000 × 1.8%
= ₹900
```

> Important: 1.8% is only an example/configured business rule. Actual rates can vary by merchant, gateway, payment method, agreement, and other factors.

---

## 6.2 GST on Gateway Fee

For the PaySynapse prototype, GST can be modeled as 18% of the applicable gateway fee.

Example:

```text
Gateway fee = ₹900

GST = ₹900 × 18%
    = ₹162
```

Total charges:

```text
Gateway fee = ₹900
GST         = ₹162
----------------
Total       = ₹1,062
```

> Important: GST treatment should be treated as a configurable financial/tax rule and validated against the applicable tax and commercial setup. Do not hard-code 18% as a universal rule.

---

# 7. Expected Net Settlement

The expected amount to be settled after applicable gateway charges is:

```text
Expected Net Settlement
=
Gross Payment Amount
-
Gateway Fee
-
GST on Gateway Fee
```

Mathematically:

```text
Expected Settlement
=
Gross - Fee - (Fee × GST Rate)
```

Example:

```text
Gross payment = ₹50,000
Gateway fee   = ₹900
GST           = ₹162

Expected settlement
= ₹50,000 - ₹900 - ₹162
= ₹48,938
```

So PaySynapse expects ₹48,938 to be settled, subject to any other legitimate adjustments defined by the applicable payment agreement/rules.

---

# 8. Stage 04 — Gateway Settlement

A settlement is the transfer/settlement of funds from the gateway to the merchant according to the gateway's settlement process.

Example:

```text
Settlement ID: SET-1001
Payment ID:    PAY-1001
Amount:        ₹48,938
Status:        PROCESSED
```

PaySynapse compares the expected settlement with the actual gateway settlement.

```text
Expected = ₹48,938
Actual   = ₹48,938

Result: MATCH
```

If the actual amount is lower, PaySynapse can generate a `SHORT_SETTLEMENT` exception.

---

# 9. Stage 05 — Bank Clearance

The final question is:

> Did the settlement actually appear in the merchant's bank account?

Example:

```text
Bank Credit:
Amount = ₹48,938
UTR    = UTR123456789
```

PaySynapse matches the bank transaction with the gateway settlement.

```text
Gateway settlement = ₹48,938
Bank credit        = ₹48,938

Result: MATCH
```

In production architectures, bank credits are acquired via automated midnight SFTP pulls of corporate bank statements (**MT940**, **CAMT.053**, or **Bank MIS CSV**), parsed for NEFT/RTGS transaction narratives, and mapped to the gateway payout batch.

---

# 10. UTR

**UTR = Unique Transaction Reference**

A UTR is a transaction reference used to identify/trace a bank transfer.

Example:

```text
UTR: UTR123456789
Amount: ₹48,938
Date: 30 Aug 2026
```

In PaySynapse, UTR can help connect:

```text
Payment
   ↓
Settlement
   ↓
Bank transaction
   ↓
UTR
```

This provides a useful traceability link for investigation and evidence.

---

# 11. Reconciliation

**Reconciliation** means comparing records from different financial systems to verify that they agree.

PaySynapse performs multiple checks:

```text
Order
  ↕
Payment
  ↕
Charges
  ↕
Settlement
  ↕
Bank
```

The system checks:

1. Does the payment correspond to the order?
2. Does the payment amount match the order?
3. Are the charges correct?
4. Is the expected settlement amount correct?
5. Does a settlement record exist?
6. Does the settlement amount match expectations?
7. Did the money reach the bank?
8. Does the bank credit correspond to the settlement?
9. Did the transaction settle within the configured SLA?
10. Are there duplicate settlement/bank records?

The output is generally:

```text
MATCH
```

or:

```text
EXCEPTION
```

---

# 12. Deterministic Reconciliation

Deterministic means the result is produced by explicit rules and mathematical calculations rather than probabilistic AI judgment.

Example:

```text
Expected = ₹48,938
Actual   = ₹48,500

Variance = ₹438
```

The system does not ask an AI model whether the amounts are equal.

It mathematically calculates:

```text
₹48,938 - ₹48,500 = ₹438
```

Therefore:

```text
SHORT_SETTLEMENT
```

This makes the core financial decision reproducible and auditable.

---

# 13. Variance

**Variance = difference between expected and actual value.**

General formula:

```text
Variance = Expected Amount - Actual Amount
```

Example:

```text
Expected = ₹48,938
Actual   = ₹48,500

Variance = ₹438
```

A positive variance in this context means the actual amount is lower than expected.

---

# 14. Short Settlement

A **short settlement** occurs when the amount actually settled/credited is less than the amount PaySynapse calculates should have been settled.

Example:

```text
Expected settlement = ₹48,938
Actual bank credit  = ₹48,500

Shortfall = ₹438
```

PaySynapse reports:

```text
SHORT_SETTLEMENT
Expected: ₹48,938
Actual:   ₹48,500
Variance: ₹438
Severity: HIGH
```

---

# 15. T, T+1, T+2 and T+3

## 15.1 Meaning of T

`T` represents the relevant reference transaction date/time defined by the reconciliation rule.

For example:

```text
T = Monday
```

Then:

```text
T+0 = Monday
T+1 = Tuesday
T+2 = Wednesday
T+3 = Thursday
```

These terms describe time relative to the reference transaction date.

---

## 15.2 Business Days vs Calendar Days

T+1 does not necessarily mean the next calendar day.

A rule may use:

- Calendar days
- Business days

Example:

```text
T = Friday

Saturday = non-business day
Sunday   = non-business day
Monday   = next business day
```

Therefore, a T+1 business-day rule could correspond to Monday.

PaySynapse should explicitly configure which calendar convention each SLA uses.

---

# 16. SLA

**SLA = Service Level Agreement**

An SLA defines the expected time or service standard for a process.

For payments, an SLA could specify when a settlement should normally occur.

Example:

```text
Payment captured: Monday

Expected settlement:
T+2

SLA threshold:
T+3
```

If the settlement takes longer than the configured threshold:

```text
SLA_BREACH
```

The exact T+2/T+3 values should be configurable rather than treated as universal rules.

---

# 17. MISSING_SETTLEMENT

### Meaning

A payment was successfully captured, but the expected settlement record cannot be found within the configured settlement window.

Example:

```text
Payment:
₹50,000
Status:
CAPTURED

Expected settlement:
T+2

Current time:
Beyond allowed window

Settlement record:
NOT FOUND
```

Result:

```text
MISSING_SETTLEMENT
Severity: CRITICAL
```

---

# 18. FEE_DISCREPANCY

### Meaning

The actual gateway fee differs from the configured/expected fee beyond the allowed tolerance.

Example:

```text
Gross = ₹50,000
Configured MDR = 1.8%

Expected fee = ₹900

Actual fee = ₹1,100
```

Difference:

```text
₹1,100 - ₹900 = ₹200
```

Result:

```text
FEE_DISCREPANCY
Severity: HIGH
```

This can indicate possible revenue leakage or an incorrect fee configuration.

---

# 19. SHORT_SETTLEMENT

### Trigger

```text
Actual settlement < Expected settlement
```

Example:

```text
Expected = ₹48,938
Actual   = ₹48,500
```

Result:

```text
SHORT_SETTLEMENT
Severity: HIGH
Variance: ₹438
```

---

# 20. SLA_BREACH

### Trigger

The settlement reaches the bank later than the configured SLA.

Example:

```text
Expected: T+2
Maximum allowed: T+3
Actual: T+7
```

Result:

```text
SLA_BREACH
Severity: MEDIUM
```

The amount can still be correct.

Example:

```text
Expected = ₹48,938
Actual   = ₹48,938

Amount: MATCH

Timing: SLA_BREACH
```

This distinction is important.

---

# 21. STATUS_MISMATCH

A status mismatch occurs when connected systems disagree about the transaction state.

Example:

```text
Merchant Order:
SUCCESS

Gateway Payment:
FAILED
```

or:

```text
Merchant Order:
FAILED

Gateway Payment:
CAPTURED
```

Result:

```text
STATUS_MISMATCH
Severity: HIGH
```

The second case is especially important because money may have been captured while the merchant system considers the order unsuccessful.

---

# 22. DUPLICATE_ENTRY

A duplicate occurs when more than one record appears to represent the same financial event.

Example:

```text
Payment ID: PAY-1001

Settlement #1 → ₹48,938
Settlement #2 → ₹48,938
```

Or:

```text
Same payment
     ↓
Multiple bank credits
```

Result:

```text
DUPLICATE_ENTRY
Severity: CRITICAL
```

The system should investigate whether this is:

- A genuine duplicate financial movement
- A duplicate database record
- A retry/reprocessing artifact
- A legitimate adjustment that has been incorrectly linked

---

# 23. Exception Detection Matrix

| Exception | Meaning | Typical Trigger | Severity |
|---|---|---|---|
| `MISSING_SETTLEMENT` | Payment captured but expected settlement is absent | Captured payment exceeds configured settlement window with no settlement record | CRITICAL |
| `FEE_DISCREPANCY` | Actual gateway fee differs from expected fee | Actual fee exceeds configured fee/tolerance | HIGH |
| `SHORT_SETTLEMENT` | Less money was settled than expected | Actual settlement < expected settlement | HIGH |
| `SLA_BREACH` | Settlement took too long | Settlement/bank clearance exceeds configured SLA | MEDIUM |
| `STATUS_MISMATCH` | Connected systems disagree on status | Order and payment states are inconsistent | HIGH |
| `DUPLICATE_ENTRY` | Same payment appears to have multiple settlement/bank records | More than one linked financial record | CRITICAL |

---

# 24. Double-Entry Accounting Concept

Double-entry accounting records every financial movement with corresponding debit and credit entries.

Core principle:

```text
Total Debits = Total Credits
```

Simplified example:

```text
Customer payment
₹50,000
```

Conceptually:

```text
Debit:
Gateway Receivable       ₹50,000

Credit:
Merchant Order Revenue/
Receivable               ₹50,000
```

After gateway charges:

```text
Gateway Fee              ₹900
GST                      ₹162
```

Remaining expected settlement:

```text
₹50,000 - ₹900 - ₹162
= ₹48,938
```

Double-entry structures can provide a stronger audit trail for financial movements.

---

# 25. Financial Digital Twin

The PaySynapse Digital Twin is a digital representation of the financial lifecycle of a transaction.

Example:

```text
┌─────────────┐
│ ORDER       │
│ ₹50,000     │
└──────┬──────┘
       ↓
┌─────────────┐
│ PAYMENT     │
│ ₹50,000     │
│ CAPTURED ✓  │
└──────┬──────┘
       ↓
┌─────────────┐
│ CHARGES     │
│ MDR ₹900    │
│ GST ₹162    │
└──────┬──────┘
       ↓
┌─────────────┐
│ SETTLEMENT  │
│ ₹48,938     │
└──────┬──────┘
       ↓
┌─────────────┐
│ BANK        │
│ ₹48,500 ✕   │
└─────────────┘

Variance = ₹438
Exception = SHORT_SETTLEMENT
```

The Digital Twin does not replace the reconciliation engine.

It **visualizes the state and relationships produced by the reconciliation engine**.

---

# 26. Step-Through Digital Twin

The Digital Twin can provide playback through the five stages.

Example:

```text
Step 1/5
ORDER
₹50,000
```

Then:

```text
Step 2/5
ORDER
  ↓
PAYMENT
₹50,000
```

Then:

```text
Step 3/5
ORDER
  ↓
PAYMENT
  ↓
CHARGES
MDR ₹900
GST ₹162
```

Then:

```text
Step 4/5
SETTLEMENT
₹48,938
```

Finally:

```text
Step 5/5
BANK
₹48,500

✕ Variance ₹438
```

This lets a user understand exactly where the financial flow diverged.

---

# 27. Node Inspector

Each Digital Twin node can expose:

### Summary

```text
Payment ID
Amount
Status
Timestamp
```

### Raw Data

```json
{
  "paymentId": "PAY-1001",
  "amount": 50000,
  "status": "CAPTURED"
}
```

### Validation

```text
✓ Payment linked to order
✓ Amount matches
✓ Status valid
✓ Timestamp valid
```

This makes the Digital Twin explainable rather than merely visual.

---

# 28. Preset Simulation Scenarios

PaySynapse can use synthetic transactions to demonstrate its reconciliation engine.

Recommended scenarios:

## Normal Flow

```text
Order       ₹50,000
Payment     ₹50,000
Charges     ₹1,062
Settlement  ₹48,938
Bank        ₹48,938

Result: MATCH
```

## Missing Settlement

```text
Payment     ₹50,000
Settlement  NOT FOUND

Result: MISSING_SETTLEMENT
```

## Fee Discrepancy

```text
Expected fee = ₹900
Actual fee   = ₹1,100

Result: FEE_DISCREPANCY
```

## Short Settlement

```text
Expected = ₹48,938
Actual   = ₹48,500

Result: SHORT_SETTLEMENT
Variance: ₹438
```

## Delayed Settlement

```text
Expected: T+2
Actual:   T+7

Result: SLA_BREACH
```

## Duplicate Entry

```text
PAY-1001
   ↓
Settlement #1
Settlement #2

Result: DUPLICATE_ENTRY
```

---

# 29. AI Root-Cause Analysis

Gemini should operate **after** deterministic reconciliation.

Architecture:

```text
Transaction Data
      ↓
Deterministic Engine
      ↓
Exception Detected
      ↓
Structured Exception Context
      ↓
Gemini AI
      ↓
Root-Cause Analysis
      ↓
Recommended Investigation
```

Example:

```text
Exception:
SHORT_SETTLEMENT

Expected: ₹48,938
Actual: ₹48,500
Variance: ₹438
```

AI can investigate available context and suggest possible causes:

```text
Possible causes:

1. Additional gateway deduction
2. Incorrect fee configuration
3. Adjustment/refund
4. Settlement configuration mismatch

Recommended checks:

→ Compare gateway settlement report
→ Check adjustment records
→ Verify fee configuration
→ Verify UTR against bank statement
```

AI should **assist investigation**, not override the mathematical reconciliation result.

---

# 30. Dispute Packet

When a transaction needs to be disputed with a gateway or investigated internally, PaySynapse can collect the evidence.

Example:

```text
DISPUTE PACKET

Transaction:
PAY-1001

Order:
ORD-1001

Gross Amount:
₹50,000

Expected Settlement:
₹48,938

Actual Settlement:
₹48,500

Variance:
₹438

Gateway Fee:
₹900

GST:
₹162

UTR:
UTR123456789

Exception:
SHORT_SETTLEMENT
```

The packet can include relevant transaction records, timestamps, settlement information, bank references, and reconciliation results.

---

# 31. Cryptographic Evidence

PaySynapse can create a hash of a canonicalized evidence package.

Conceptually:

```text
Transaction Evidence
        ↓
Canonical Data
        ↓
SHA-256
        ↓
Evidence Hash
```

Example:

```text
Evidence Hash:
8f2c...a91e
```

If the underlying evidence changes, its hash can change.

This provides a **tamper-evident integrity mechanism**.

Important:

> A cryptographic hash by itself does not automatically make a document or process legally or regulatorily compliant. It provides evidence integrity and can support an audit trail.

---

# 32. Complete PaySynapse Flow

```text
                 CUSTOMER
                    │
                    ▼
              MERCHANT ORDER
                    │
                    ▼
              PAYMENT GATEWAY
                    │
                    ▼
             PAYMENT CAPTURE
                    │
                    ▼
             MDR + GST RULES
                    │
                    ▼
          EXPECTED SETTLEMENT
                    │
                    ▼
           GATEWAY SETTLEMENT
                    │
                    ▼
              BANK CREDIT
                    │
                    ▼
                  UTR
                    │
                    ▼
          RECONCILIATION ENGINE
                    │
          ┌─────────┴─────────┐
          │                   │
        MATCH             EXCEPTION
          │                   │
          ▼                   ▼
     Reconciled         Gemini AI
     Transaction        Investigation
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
                Dashboard  Dispute   Evidence
                           Packet     Certificate
```

---

# 33. The Most Important Distinction

PaySynapse has three major layers:

## Layer 1 — Truth

**Deterministic Reconciliation**

Answers:

> **What happened mathematically?**

Uses:

- Amount comparisons
- MDR calculations
- GST calculations
- Settlement matching
- Bank matching
- Status rules
- Duplicate detection
- SLA calculations

---

## Layer 2 — Understanding

**AI Investigation**

Answers:

> **Why might it have happened?**

Uses Gemini to:

- Analyze exception context
- Identify possible root causes
- Find patterns across exceptions
- Suggest investigation steps
- Prioritize issues

---

## Layer 3 — Proof

**Digital Twin + Evidence**

Answers:

> **Can we visualize and demonstrate what happened?**

Provides:

- Five-stage transaction topology
- Step-through playback
- Node inspection
- Raw transaction data
- Validation results
- UTR traceability
- Dispute packets
- Tamper-evident evidence hashes

---

# 34. One Complete Example

Suppose a customer pays ₹50,000.

### Step 1 — Order

```text
Order = ₹50,000
```

### Step 2 — Payment

```text
Payment = ₹50,000
Status = CAPTURED
```

### Step 3 — Charges

```text
MDR = 1.8%
Fee = ₹900

GST = 18% × ₹900
    = ₹162
```

### Step 4 — Expected Settlement

```text
₹50,000 - ₹900 - ₹162
= ₹48,938
```

### Step 5 — Gateway Settlement

```text
Gateway says:
₹48,938
```

### Step 6 — Bank

```text
Bank receives:
₹48,500
```

### Step 7 — Reconciliation

```text
Expected = ₹48,938
Actual   = ₹48,500

Variance = ₹438
```

### Final result

```text
Exception:
SHORT_SETTLEMENT

Severity:
HIGH

Variance:
₹438
```

### AI investigation

```text
Possible causes:
- Additional deduction
- Adjustment
- Incorrect fee configuration
- Settlement discrepancy

Recommended checks:
- Gateway settlement report
- Adjustment records
- Fee configuration
- Bank UTR
```

The Digital Twin visually shows the exact stage where the expected and actual flow diverged.

---

# 35. One-Line Definitions

| Term | Simple Meaning |
|---|---|
| **Merchant** | Business receiving the customer's money |
| **Order** | Purchase recorded by the merchant |
| **Payment** | Customer's payment transaction |
| **Gateway** | Service that processes the payment |
| **Capture** | Gateway has successfully processed the payment for the payment flow |
| **MDR** | Payment processing fee charged as a percentage |
| **GST** | Tax applied according to the applicable tax rule |
| **Settlement** | Transfer/settlement of funds to the merchant |
| **Bank Credit** | Money actually appearing in the merchant's bank |
| **UTR** | Reference used to identify/trace a bank transfer |
| **Reconciliation** | Comparing records to verify they agree |
| **Expected Amount** | Amount PaySynapse calculates should arrive |
| **Actual Amount** | Amount actually recorded by the downstream system |
| **Variance** | Difference between expected and actual |
| **SLA** | Expected service/time standard |
| **T** | Reference transaction date/time |
| **T+1** | One day/business day after T, depending on configured convention |
| **T+2** | Two days/business days after T |
| **T+3** | Three days/business days after T |
| **Missing Settlement** | Payment exists but settlement is missing beyond allowed window |
| **Fee Discrepancy** | Actual fee differs from expected fee |
| **Short Settlement** | Actual settlement is lower than expected |
| **SLA Breach** | Settlement took longer than allowed |
| **Status Mismatch** | Connected systems disagree on transaction status |
| **Duplicate Entry** | Multiple records appear to represent the same financial event |
| **Digital Twin** | Digital representation of the transaction's financial lifecycle |
| **Deterministic** | Same input + same rules = same result |
| **Root-Cause Analysis** | Investigation into why an exception occurred |
| **Evidence Hash** | Cryptographic fingerprint used to detect evidence changes |
