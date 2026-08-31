# 10 — Digital Twin & Simulation Guide

This document provides a comprehensive, plain-English, and technical reference for the **PaySynapse Digital Twin Financial Lineage Visualizer** (`/digital-twin`), its 5-stage topology graph, the 8 simulation test scenarios, and the autonomous remediation (Auto-Fix) engine.

---

## 1. The Core Problem: Why Digital Twin Exists

When an online business operates, money flows across three completely separate systems:
1. **Merchant Store / Cart** (where orders are created)
2. **Payment Gateway (e.g. Razorpay)** (which charges customer cards and takes fees)
3. **Merchant Bank Account** (where physical payouts land)

In high-volume e-commerce, financial leakages happen frequently:
* The gateway charges higher fees than agreed in the contract.
* The gateway marks a payout as "settled", but the money never actually reaches the merchant's bank account.
* The gateway accidentally disburses double payments or short-settles amounts.

The **Digital Twin** acts like an **X-ray / Real-Time Package Tracker** for every single rupee as it travels from the customer's cart to the merchant's bank account.

---

## 2. The 5-Stage Financial Topology Architecture

The Digital Twin breaks every transaction into **5 sequential financial nodes**:

```
[01. ORDER] ──➔ [02. PAYMENT] ──➔ [03. CHARGES] ──➔ [04. SETTLEMENT] ──➔ [05. BANK (NODAL)]
(Merchant Cart) (Razorpay Capture) (MDR Fee & GST)  (Gateway Payout)   (Cleared in Bank)
```

| Node | Stage Name | Description | Key Telemetry Verified |
| :--- | :--- | :--- | :--- |
| **01** | **Merchant Order** | Customer purchase initiated on merchant checkout. | Order ID, Gross Amount, Currency (ISO INR). |
| **02** | **Gateway Charge** | Customer payment authorized and captured by Razorpay. | Payment ID (`pay_...`), State (`CAPTURED`), Webhook HMAC signature. |
| **03** | **Fees & Tax** | Deductions applied by Gateway (Merchant Discount Rate + 18% GST). | MDR Commission rate, 18% GST component, Ledger deduction parity. |
| **04** | **Settlement Batch** | Gateway net payout batch scheduled for disbursement. | Settlement Batch ID (`setl_...`), Net amount, T+1 SLA delivery window. |
| **05** | **Nodal Bank UTR** | Actual physical funds credited to the merchant's escrow bank account. | Bank UTR Reference (`CMS/.../UTR_...`), Escrow Clearance timestamp. |

---

## 3. What is a "Nodal Bank Account"?

Under Reserve Bank of India (RBI) regulations for Payment Aggregators (like Razorpay, Cashfree, Stripe India):
* Customer money collected online **cannot** sit directly in the gateway's private bank account.
* Instead, funds must be held in a specialized, regulated **Nodal Escrow Account** (operated via partner banks like HDFC, ICICI, or Axis Bank).
* **Node 05 (Nodal Bank UTR)** represents **Proof of Physical Funds Receipt in the Bank**. Even if Razorpay claims an order is "Settled" in Node 04, PaySynapse does not consider it reconciled until Node 05 confirms physical bank clearance via a unique UTR number.

---

## 4. The 8 Simulation Scenarios Explained

The simulation buttons at the top of `/digital-twin` allow engineers and auditors to intentionally inject edge-case anomalies into the pipeline to watch how PaySynapse detects and resolves them:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SIMULATION SCENARIOS GRID                              │
├──────────────┬──────────────────┬──────────────────┬─────────────────┬─────────────────┤
│ Normal Flow  │ Missing Settl.   │ Fee Discrepancy  │ Short Settl.    │ T+10 Delay      │
├──────────────┼──────────────────┼──────────────────┼─────────────────┼─────────────────┤
│ Duplicate Tx │ Status Mismatch  │ Missing Refund   │                 │                 │
└──────────────┴──────────────────┴──────────────────┴─────────────────┴─────────────────┘
```

---

### Scenario 1: Normal Flow (`PERFECT_MATCH`)
* **Real-World Story:** A customer buys ₹5,000 shoes. Razorpay takes the standard 1.8% Card MDR (₹90.00) + 18% GST (₹16.20) = ₹106.20. The remaining ₹4,893.80 arrives safely in your bank account with a valid UTR number within 24 hours (T+1).
* **Graph Behavior:** All 5 nodes turn **Green**. Arithmetic balance shows zero variance.
* **Auto-Fix Action:** None needed — lineage is 100% matched.

---

### Scenario 2: Missing Settlement (`MISSING_SETTLEMENT`)
* **Real-World Story:** The customer pays ₹5,000 and Razorpay debits their card. However, Razorpay fails to include the payout in their daily settlement file. The merchant bank statement shows ₹0.00.
* **Graph Behavior:** Node 04 turns **Red ("Unsettled")**, Node 05 shows **₹0.00**, and the anomaly detector flags ₹4,893.80 as missing funds.
* **Auto-Fix Action (`Query Nodal Bank Status`):** Queries the nodal bank's clearing API, locates the stuck batch, generates the bank settlement record with a cleared UTR, and brings Node 04/05 into green reconciled parity.

---

### Scenario 3: Fee Discrepancy (`FEE_MISMATCH`)
* **Real-World Story:** The merchant signed a contract with Razorpay for a flat **₹15.00** fee on Netbanking transactions. On this ₹5,000 payment, Razorpay mistakenly billed **₹45.00** (overcharging the merchant by +₹35.40).
* **Graph Behavior:** Node 03 (Charges) turns **Amber/Yellow ("Overcharged Fee")**, and the ledger displays a **-₹35.40 financial leakage**.
* **Auto-Fix Action (`File Dispute Ticket to Gateway`):** Corrects the fee calculation back to the contracted ₹15 flat rate, updates the GST, adjusts the ledger payout to ₹4,982.30, and generates an audit dispute record to reclaim the overcharge.

---

### Scenario 4: Short Settlement (`AMOUNT_MISMATCH`)
* **Real-World Story:** Expected net payout was ₹4,893.80. But Razorpay only transferred **₹4,543.80** into the merchant bank account — an unexplained deficit of **-₹350.00**.
* **Graph Behavior:** The balance bar shows an alert: **"⚠️ Variance: -₹350.00 Shortfall"**.
* **Auto-Fix Action (`Request Short-Settlement True-Up`):** Files a true-up adjustment credit for the ₹350 deficit, balancing the expected and actual settlement accounts.

---

### Scenario 5: T+10 Delayed Settlement (`DELAYED_SETTLEMENT`)
* **Real-World Story:** Razorpay's service contract mandates a **T+1** settlement window (payout within 1 business day). Here, the funds took **10 days (T+10)** to clear into the merchant's bank account.
* **Graph Behavior:** Node 04 flags **"SLA Breach: 9 Days Overdue"** in amber.
* **Auto-Fix Action (`Record SLA Violation`):** Reconciles the amount while recording the contractual SLA violation for vendor penalty calculations and interest recovery.

---

### Scenario 6: Duplicate Entry (`DUPLICATE_TRANSACTION`)
* **Real-World Story:** Razorpay's webhook or batch processor fired twice, causing 2 identical settlement batches (`setl_...` and `setl_dup_...`) to be credited for the same single order.
* **Graph Behavior:** Node 04 alerts **"⚠️ Multiple Settlements (2) for Single Payment"**.
* **Auto-Fix Action (`Auto-Reverse Duplicate Ledger Entry`):** Voids and removes the duplicate payout record to prevent double accounting entries.

---

### Scenario 7: Status Mismatch (`STATUS_MISMATCH`)
* **Real-World Story:** The merchant website crashed during checkout callback and recorded the order as **FAILED**. However, Razorpay's gateway captured the customer's money successfully. The customer lost money and received no order confirmation.
* **Graph Behavior:** Node 01 shows **Red (FAILED)**, while Node 02 shows **Green (CAPTURED)**.
* **Auto-Fix Action (`Sync Status from Gateway`):** Synchronizes the merchant database with Razorpay's webhook API, sets the order state to **PAID**, and releases the order for fulfillment.

---

### Scenario 8: Missing Refund (`MISSING_REFUND`)
* **Real-World Story:** A customer requested a return and the merchant issued a ₹5,000 refund. However, Razorpay never posted the reversal credit to the nodal bank within the banking cutoff window.
* **Graph Behavior:** Node 02 shows **REFUNDED**, but Node 04/05 show missing reversal credits.
* **Auto-Fix Action (`Force Retry Refund API`):** Re-triggers the refund dispatch API to ensure the credit lands back in the customer's account.

---

## 5. Smooth Simulation Engine & Playback Controls

To ensure users can see and understand how financial mechanics operate under the hood, the Digital Twin includes a **Multi-Stage Progression Engine**:

1. **Sequential 5-Stage Stepping:** When a simulation runs, it transitions smoothly through each node (1 ➔ 2 ➔ 3 ➔ 4 ➔ 5) with animated glowing laser flow beams along the connectors.
2. **Simulation Explainer HUD:** A dynamic heads-up banner above the graph displays live mechanical explanations of what is happening at the active stage for that specific scenario.
3. **Playback & Speed Controls:**
   * **`0.5x Slow`**: 2.4s per stage — ideal for deep inspection, training, and presentations.
   * **`1x Normal`**: 1.5s per stage — balanced smooth flow.
   * **`2x Fast`**: 0.7s per stage — quick review.
   * **`Pause / Resume`** & **`Replay`**: Inspect telemetry at any checkpoint or re-run the simulation animation at any time.
   * **`Skip`**: Instantly jump to the final completed state.

---

## 6. Investigation & Exception Resolution Workflow

PaySynapse enforces a clean separation of concerns between visual simulation/tracking and production dispute resolution:

1. **Digital Twin Visualizer (`/digital-twin`):**
   * **Real-Time 5-Node Graph Inspection:** Step through live data across Order, Payment, Charges, Settlement, and Nodal Bank.
   * **Simulation Sandbox:** Inject edge cases to inspect broken topology and telemetry without accidental modifications.
   * **AI Root Cause Analysis:** Click **"Ask AI to Investigate"** to get an autonomous diagnosis and recommended remediation steps powered by Google Gemini.
   * **Direct Exception Desk Link:** Seamlessly jump to the Exception Center to manage and resolve flagged records.

2. **Exception Management Desk (`/exceptions`):**
   * Review all open, investigating, and resolved anomalies across the entire ledger.
   * Generate official RBI-compliant **Dispute Packets** with pre-filled emails to Razorpay and nodal banks.
   * Apply official resolution notes and maintain immutable audit log trails.
