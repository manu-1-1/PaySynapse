# Module 04: Deterministic Reconciliation Engine

## 4.1 Engine Philosophy
The PaySynapse Reconciliation Engine ([`lib/reconciliation/engine.js`](file:///d:/Projects/PaySynapse/lib/reconciliation/engine.js)) is **100% deterministic**. It does not perform probabilistic fuzzy logic or statistical guessing when evaluating money.

Financial matching is governed strictly by algebraic verification:

$$\text{Expected Net Settlement} = \text{Gross Payment} - \text{Gateway Fees} - \text{Taxes (GST)} - \text{Refunds}$$

$$\text{Discrepancy Variance} = \text{Expected Net Settlement} - \text{Actual Bank Settlement}$$

---

## 4.2 Standard Financial Constants
* **Standard Gateway MDR (Fee Rate)**: $1.8\%$ (`0.018`) of Gross Payment Amount.
* **Standard GST Tax Rate**: $18\%$ (`0.18`) of Gateway MDR Fee Amount.
* **Settlement SLA Threshold**: $3 \text{ days}$ (T+3 max before flagging `DELAYED_SETTLEMENT`).

---

## 4.3 9 Exception Types & Rule Conditions

The engine evaluates each transaction against 9 predefined anomaly rules:

### Rule 1: `STATUS_MISMATCH`
* **Trigger Conditions**:
  1. Payment is marked `FAILED` in gateway records, but a `Settlement` record exists.
  2. Order is marked `FAILED` in merchant database, but payment is marked `CAPTURED`.
* **Severity**: `HIGH`
* **Financial Impact**: Entire expected settlement or captured payment amount.

### Rule 2: `FEE_MISMATCH`
* **Trigger Condition**:
  $$\text{Actual Total Fees} \neq \text{Gross Payment} \times 0.018$$
* **Severity**: `MEDIUM`
* **Financial Impact**: $|\text{Expected Fee} - \text{Actual Fee}|$.

### Rule 3: `MISSING_REFUND`
* **Trigger Condition**: Payment status is `REFUNDED`, but no entries exist in `Refund` table.
* **Severity**: `HIGH`
* **Financial Impact**: Full gross payment amount.

### Rule 4: `REFUND_MISMATCH`
* **Trigger Condition**: Payment has refund records, but total refunded amount does not match full gross payment (or expected partial refund terms).
* **Severity**: `HIGH`
* **Financial Impact**: $|\text{Gross Payment} - \text{Total Refunded}|$.

### Rule 5: `MISSING_SETTLEMENT`
* **Trigger Condition**: Payment status is `CAPTURED`, but no settlement record exists in the system.
* **Severity**: `HIGH`
* **Financial Impact**: Expected net settlement value.

### Rule 6: `DUPLICATE_TRANSACTION`
* **Trigger Condition**: Multiple settlement records are linked to a single payment ID.
* **Severity**: `HIGH`
* **Financial Impact**: Value of the duplicate settlement.

### Rule 7: `AMOUNT_MISMATCH`
* **Trigger Condition**: Settlement record exists, but actual settlement amount does not equal expected net settlement.
* **Severity**: `HIGH`
* **Financial Impact**: $|\text{Expected Settlement} - \text{Actual Settlement}|$.

### Rule 8: `DELAYED_SETTLEMENT`
* **Trigger Condition**: Time difference between payment `capturedAt` and settlement `settledAt` exceeds 3 days.
* **Severity**: `LOW`
* **Financial Impact**: ₹0.00 (Operational timing delay warning).

### Rule 9: `ORPHAN_BANK_TRANSACTION`
* **Trigger Condition**: A `BankTransaction` record exists in bank feeds without any matching `settlementId`.
* **Severity**: `HIGH`
* **Financial Impact**: Full bank credit amount.

---

## 4.4 Lifecycle & State Transitions

```
[ Incoming Payment / Trigger ]
               |
               v
  Fetch 5-Node Graph Data (Order, Payment, Fees, Refunds, Settlements, Bank Txs)
               |
               v
     Calculate Expected Settlement & Check 9 Exception Rules
               |
      +--------+--------+
      |                 |
(Exceptions = 0)   (Exceptions > 0)
      |                 |
      v                 v
Status: MATCHED   Status: EXCEPTION
      |                 |
      +--------+--------+
               |
               v
  Upsert `Reconciliation` Record
               |
               v
Mark prior OPEN exceptions as `OBSOLETE` & Insert new `Exception` records
               |
               v
    Write entry to `AuditLog`
```
