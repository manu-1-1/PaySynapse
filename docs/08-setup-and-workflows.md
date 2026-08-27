# Module 08: Setup, Testing & Operational Workflows

## 8.1 Prerequisites & Installation

### System Requirements
* Node.js v18.0.0 or higher
* npm v9.0.0 or higher
* Git

### Step-by-Step Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/manu-1-1/PaySynapse.git
   cd PaySynapse
   ```

2. **Install node dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="paysynapse_secure_jwt_secret_2026"
   GEMINI_API_KEY="your_google_gemini_api_key_here"
   RAZORPAY_KEY_ID="rzp_test_your_key_id"
   RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
   ```

4. **Initialize Database & Generate Client**:
   ```bash
   npx prisma db push
   ```

---

## 8.2 Demo Dataset & Anomaly Generation

PaySynapse includes scripts to generate synthetic transaction datasets with realistic healthy and exception states.

### Generate Synthetic Transactions:
```bash
npm run generate-demo-data
```
This script ([`scripts/generate-demo-data.js`](file:///d:/Projects/PaySynapse/scripts/generate-demo-data.js)) automatically:
* Creates standard merchant and user accounts (`ops@demo.paysynapse.com`).
* Generates 100+ orders, payments, fees, settlements, and bank transactions.
* Plants deliberate anomalies (Amount Mismatches, Fee Overcharges, Missing Settlements, Status Mismatches, Delayed Settlements).

---

## 8.3 CLI Testing & Webhook Simulation

### 1. Execute Full Reconciliation Test via CLI:
```bash
npm run test-reconciliation
```
Runs the engine across all stored payments and prints global match rates and exception totals directly in the terminal.

### 2. Simulate Gateway Webhook Notification:
```bash
node scripts/simulate-webhook.js
```
Sends a simulated Razorpay `payment.captured` webhook payload to `http://localhost:3000/api/webhooks/razorpay`, testing live ingestion and instant matching.

---

## 8.4 Standard Operations Workflow

### Scenario: Resolving a "Missing Settlement" Exception

```
1. Operator logs into PaySynapse Dashboard (ops@demo.paysynapse.com / password123).
                                |
                                v
2. Navigates to Exception Center (/exceptions) and filters by Severity: HIGH.
                                |
                                v
3. Selects Exception EX-8921 (MISSING_SETTLEMENT on Payment rzp_pay_7721).
                                |
                                v
4. Clicks "Investigate with AI" -> Gemini 2.5 Flash analyzes payment facts and generates:
   "Payment was captured 4 days ago. No settlement batch has been received."
   Recommended Action: "File dispute ticket with Razorpay Nodal Operations."
                                |
                                v
5. Operator clicks "File Gateway Dispute" in Resolution Modal and enters audit notes.
                                |
                                v
6. Engine updates Exception status to RESOLVED and creates an entry in AuditLog.
```
