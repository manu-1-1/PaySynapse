# Apex Nodal Bank Simulator (`bank-portal`)

**Enterprise RBI Nodal Escrow & Bank Clearing Simulator for the PaySynapse Ecosystem**

Part of the **PaySynapse 3-Feed Tripartite Financial Infrastructure**:
1. **Merchant Store** (`:3001`) — Customer Orders & Cart Checkout
2. **PaySynapse Reconciler** (`:3000`) — 5-Point Digital Twin & AI Anomaly Detection Engine
3. **Apex Nodal Bank** (`:3002`) — Nodal Escrow Vault, Real-Time UTR Clearance, and Banking Chaos Studio

---

## 🚀 Features

- **Live Settlement Pipeline**: View pending settlement batches received from Razorpay/Aggregators, and authorize clearances with real RBI UTR generation (`APEXUTIB...`).
- **Banking Chaos & Anomaly Studio**:
  - ⚡ *Short Settlement*: Simulate unauthorized bank wire fee deductions (-₹150).
  - ⏱️ *SLA Breach*: Simulate clearing delays (T+5 days).
  - 🚫 *Compliance Freeze*: Place AML holds on escrow payouts.
  - 🔁 *Duplicate Credit*: Dispatch duplicate credits to test idempotency.
- **Statement Generator & ISO Feeds**: Download `.CSV` and `MT940` bank statement feeds.
- **Direct PaySynapse Sync**: 1-click push to trigger instant 5-point reconciliation across the entire ledger.

---

## 🛠️ Running Locally

```bash
cd bank-portal
npm install
npm run dev
```

The portal will start on **`http://localhost:3002`**.
