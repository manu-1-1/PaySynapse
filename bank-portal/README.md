# 🏛️ Apex Nodal Bank Simulator

> **Enterprise RBI Nodal Escrow & Bank Clearing Simulator**  
> Leg 3 of the **PaySynapse 3-Tier Tripartite Financial Infrastructure**

---

## 📌 Overview: What is this Project?

The **Apex Nodal Bank Simulator** is an enterprise-grade banking portal and clearing engine designed to simulate statutory **RBI Nodal Escrow Accounts** for payment aggregators and merchants. In modern Indian payment infrastructure (under RBI guidelines for Payment Aggregators & Payment Gateways - PAPG), customer funds must be held in a specialized nodal/escrow vault before clearance to the merchant's commercial bank account.

This simulator models the final banking leg of the transaction lifecycle:
1. **Holding Funds in Nodal Escrow**: Tracking segregated regulatory pool balances.
2. **Authorizing Bank Clearance**: Issuing official Reserve Bank of India (RBI) **Unique Transaction References (UTRs)** (e.g., `APEXUTIB948102847`).
3. **Statement Feed Generation**: Generating financial statements in standard `.CSV` and international banking standard **SWIFT MT940** formats.
4. **Banking Chaos Studio**: Intentionally injecting real-world edge cases (short settlements, SLA delays, AML compliance holds, duplicate credits) to test PaySynapse's **5-point reconciliation engine**.

```
┌─────────────────────────────────┐
│     CyberDeck Merchant Store    │
│     (Port 3001 - Orders & Cart) │
└────────────────┬────────────────┘
                 │ Payment Initiated
                 ▼
┌─────────────────────────────────┐      Clearing Feeds & UTRs
│   PaySynapse Core Reconciler    │ ◄───────────────────────────┐
│   (Port 3000 - 5-Point Match)   │                             │
└─────────────────────────────────┘                             │
                                                  ┌─────────────┴─────────────┐
                                                  │   Apex Nodal Bank Portal  │ ◄── (You are here: Port 3002)
                                                  │   - RBI Escrow Vault      │
                                                  │   - UTR Settlement Engine │
                                                  │   - Banking Chaos Studio  │
                                                  └───────────────────────────┘
```

---

## 🎯 Role in the PaySynapse Ecosystem

PaySynapse enforces a **5-point deterministic reconciliation model**:
- **Leg 1**: Merchant Order (`ORDER_CREATED`)
- **Leg 2**: Gateway Capture (`PAYMENT_CAPTURED`)
- **Leg 3**: Gateway Fee & Tax Verification (`FEE_CALCULATED`)
- **Leg 4**: Settlement Batch Creation (`SETTLEMENT_PROCESSED`)
- **Leg 5**: **Nodal Bank Wire Clearance & UTR Verification (`BANK_CREDITED`)**

The **Apex Nodal Bank Simulator** is responsible for **Leg 5**. Without bank-side authorization and UTR generation, a transaction remains un-reconciled. When an operator approves a settlement in this portal, the simulator writes the corresponding `BankTransaction` record to the shared ledger, allowing PaySynapse to achieve 100% matched status across all 5 verification dimensions.

---

## 📂 Project Architecture & What's Inside

```
bank-portal/
├── prisma/
│   └── schema.prisma           # Shared PostgreSQL database schema (Payments, Settlements, UTRs)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chaos/
│   │   │   │   └── route.js    # Injects edge-case anomalies into settlement transactions
│   │   │   ├── export/
│   │   │   │   └── route.js    # Generates MT940 & CSV bank statement feeds
│   │   │   ├── settle/
│   │   │   │   └── route.js    # Clears settlements & creates bank transactions with UTRs
│   │   │   ├── settlements/
│   │   │   │   └── route.js    # Fetches settlement pipeline records & escrow metrics
│   │   │   └── sync/
│   │   │       └── route.js    # Synchronizes bank ledger with PaySynapse core reconciler
│   │   ├── chaos/
│   │   │   └── page.js         # Chaos Studio UI: inject short settlement, SLA delays, AML holds
│   │   ├── escrow/
│   │   │   └── page.js         # Statutory Escrow Pool dashboard (RBI balances, audits)
│   │   ├── statements/
│   │   │   └── page.js         # Statement Explorer & 1-click MT940/CSV downloader
│   │   ├── globals.css         # High-contrast banking dashboard styles & glowing tokens
│   │   ├── layout.js          # Persistent sidebar navigation & active node monitors
│   │   └── page.js            # Live Settlement Pipeline (Pending, Settled, Anomaly views)
│   └── lib/
│       └── prisma.js           # Prisma client singleton connecting to PostgreSQL
├── .env.example                # Template for database & ecosystem service URLs
├── Dockerfile                  # Containerized deployment recipe for port 3002
├── package.json                # Dependencies: Next.js 16, Prisma 5.22, Lucide Icons, React 19
└── README.md                   # This documentation file
```

### Key Modules Explained

| Path | Purpose & Functionality |
| :--- | :--- |
| **`src/app/page.js`** | **Settlement Clearing Dashboard**: Displays the real-time settlement pipeline. Allows operators to clear individual records or trigger batch clearing with instant UTR generation. |
| **`src/app/chaos/page.js`** | **Banking Chaos Studio**: Interactive sandbox to deliberately inject anomalies (e.g. ₹150 wire deduction, T+6 SLA delay) to verify AI anomaly detection in PaySynapse. |
| **`src/app/escrow/page.js`** | **Statutory Nodal Escrow Vault**: Monitors statutory compliance under RBI PAPG guidelines, displaying total escrow balance, daily inflows, cleared outflows, and statutory audit health. |
| **`src/app/statements/page.js`** | **Statement Explorer**: Search transaction references, download standard `.CSV` or banking standard **SWIFT MT940** feeds, and trigger direct sync to PaySynapse. |
| **`src/app/api/settle/route.js`** | Generates RBI-compliant UTR identifiers (`APEXUTIB...`), updates settlement records to `SETTLED`, and writes `BankTransaction` ledger entries. |
| **`src/app/api/chaos/route.js`** | Orchestrates four types of banking failure modes directly in the database to test reconciler robustness. |
| **`prisma/schema.prisma`** | The relational database schema shared with PaySynapse core, defining models for `Payment`, `Settlement`, `BankTransaction`, `Reconciliation`, and `Exception`. |

---

## ⚙️ Environment Configuration

Create a `.env` file in the `bank-portal` directory based on `.env.example`:

```bash
cp .env.example .env
```

Ensure the configuration points to your PostgreSQL database and local PaySynapse services:

```env
# Shared PostgreSQL database connection string
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/paysynapse?schema=public"

# Cross-service endpoints
NEXT_PUBLIC_PAYSYNAPSE_URL="http://localhost:3000"
NEXT_PUBLIC_MERCHANT_STORE_URL="http://localhost:3001"
```

> [!IMPORTANT]
> The `DATABASE_URL` should match the database used by the main **PaySynapse** app so that bank ledger updates are immediately reflected in the core reconciler.

---

## 🚀 How to Run & Use the Bank Portal

### 1. Standalone Execution

From within the `bank-portal` directory:

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client bindings
npx prisma generate

# 3. Start development server on port 3002
npm run dev
```

The bank portal is now live at: **`http://localhost:3002`**

### 2. Ecosystem Execution (From Repository Root)

From the root `PaySynapse` workspace:

```bash
# Run bank portal only
npm run dev:bank

# Or launch all 3 apps concurrently (Reconciler :3000, Store :3001, Bank :3002)
npm run dev:all
# Or on Windows:
scripts\start-ecosystem.bat
```

---

## 🧪 Operational Workflows

### 1. Authorizing Settlement Clearance (Standard Flow)

1. Open **`http://localhost:3002`** to view the **Settlement Pipeline**.
2. Identify a settlement in **PENDING** status (originated from a store purchase).
3. Click the **"Settle & Generate UTR"** button on the row (or click **"Batch Settle All Pending"**).
4. The system immediately:
   - Marks the settlement as `SETTLED`.
   - Generates an authentic RBI UTR (e.g. `APEXUTIB982341729`).
   - Creates a matching credit in `BankTransaction`.
   - Deducts funds from the Nodal Escrow Vault balance.
5. Switch to **PaySynapse Core** (`http://localhost:3000/reconciliation`) to watch the transaction achieve **100% RECONCILED** status.

---

### 2. Injecting Anomalies via the Banking Chaos Studio

Navigate to **`http://localhost:3002/chaos`** to stress-test your reconciliation rules:

| Anomaly Scenario | What it Simulates | Expected PaySynapse Behavior |
| :--- | :--- | :--- |
| **Short Settlement** | An intermediary bank wire fee is silently deducted (e.g., -₹150 deduction on net amount). | Flagged as `AMOUNT_MISMATCH` with high severity in PaySynapse AI Exception Copilot. |
| **SLA Breach** | Clearance timestamp delayed by 5–6 business days beyond the RBI T+1/T+2 regulatory requirement. | Flagged as `SLA_BREACH` exception with recommended escalation to partner bank. |
| **Compliance Freeze** | AML/PMLA freeze placed on the merchant escrow payout. | Marked as `COMPLIANCE_HOLD`, preventing final ledger reconciliation. |
| **Duplicate Credit** | Bank ledger records the same UTR credit twice. | Flagged as `DUPLICATE_CREDIT`, alerting financial operations to potential double payout. |

**To test an anomaly**:
1. Select a settlement from the dropdown.
2. Select your desired scenario (e.g., *Short Settlement* with ₹150 deduction).
3. Click **"Inject Anomaly"**.
4. Click the link provided in the response to jump straight to the PaySynapse Exception Copilot (`http://localhost:3000/exceptions`) to see the AI diagnostic and recommended resolution steps.

---

### 3. Generating & Exporting Statements

Navigate to **`http://localhost:3002/statements`**:
- **Export CSV**: Generates a standard comma-separated ledger file containing transaction dates, descriptions, references, debits, credits, and closing balances.
- **Export ISO MT940**: Generates a SWIFT MT940 flat text file compliant with international electronic banking standards:
  - `:20:` Transaction Reference Number
  - `:25:` Nodal Account Number
  - `:60F:` Opening Balance
  - `:61:` Statement Line (UTR, Value Date, Entry Date, Amount)
  - `:86:` Information to Account Owner
  - `:62F:` Closing Available Balance
- **Push Sync to PaySynapse**: Instantly sends the current ledger snapshot to `http://localhost:3000` to re-trigger automatic batch reconciliation.

---

## 📡 API Reference

### `GET /api/settlements?filter=ALL|PENDING|SETTLED|ANOMALY`
Returns settlement batches, statutory escrow balance, inflow/outflow metrics, and recent bank transactions.

### `POST /api/settle`
Clears one or all pending settlements.
- **Request Body (Single)**:
  ```json
  { "settlementId": "settle_01..." }
  ```
- **Request Body (Batch)**:
  ```json
  { "batch": true }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Settlement cleared successfully",
    "utr": "APEXUTIB83910283"
  }
  ```

### `POST /api/chaos`
Injects an intentional financial anomaly into a settlement.
- **Request Body**:
  ```json
  {
    "scenario": "SHORT_SETTLEMENT",
    "settlementId": "settle_01...",
    "customAmount": 150,
    "delayDays": 5
  }
  ```

### `GET /api/export?format=csv|mt940`
Downloads real-time bank ledger statements in CSV or SWIFT MT940 format.

### `POST /api/sync`
Forces a synchronization event with PaySynapse core reconciler.

---

## 🔧 Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **`PrismaClientInitializationError`** | PostgreSQL database is not reachable at `DATABASE_URL`. | Verify PostgreSQL is running (`docker compose up -d db` or local service) and connection string in `.env` is correct. |
| **`Cannot find module '@prisma/client'`** | Prisma schema was not generated for this package. | Run `npx prisma generate` inside `bank-portal/`. |
| **Port 3002 already in use** | Another process is occupying port 3002. | Kill the process occupying port 3002 (`npx kill-port 3002`) or free the port. |
| **Sync to PaySynapse fails** | PaySynapse core app is not running on port 3000. | Ensure the main PaySynapse application is started at `http://localhost:3000`. |
