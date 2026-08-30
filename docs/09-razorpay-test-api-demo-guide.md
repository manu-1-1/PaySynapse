# Razorpay Test API Demo Guide — End-to-End Live Integration

This guide walks you through setting up and running a **live end-to-end payment reconciliation demo** using the real **Razorpay Test API**, **Live Webhooks**, and **PaySynapse**.

---

## 1. Overview of the Demo Flow

```
[Razorpay Test Payment Link / Checkout]
                  │
                  ▼ (Customer pays via test UPI / Card)
       [Razorpay Test Gateway]
                  │
                  ▼ (Fires HTTPS Webhook)
           [ngrok Public Tunnel]
                  │
                  ▼
[PaySynapse Local Server: /api/webhooks/razorpay]
                  │
                  ├─▶ 1. Verifies Signature & Logs WebhookEvent
                  ├─▶ 2. Ingests Order, Payment, and Fees
                  ├─▶ 3. Executes Deterministic 5-Point Reconciliation
                  └─▶ 4. Displays on Digital Twin & Exception Center
```

---

## 2. Prerequisites

1. **PaySynapse Running Locally**:
   ```bash
   npm run dev
   # Accessible at http://localhost:3000
   ```
2. **Free Razorpay Account**: [https://dashboard.razorpay.com](https://dashboard.razorpay.com) (Toggle to **Test Mode**).
3. **Tunneling Tool (ngrok)**: Download from [https://ngrok.com](https://ngrok.com) or install via npm/choco:
   ```bash
   npm install -g ngrok
   ```

---

## 3. Step-by-Step Configuration

### **Step 1: Generate Razorpay Test API Keys**
1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Ensure the top-right toggle is set to **Test Mode** (Amber banner).
3. In the left navigation, go to **Settings** $\to$ **API Keys**.
4. Click **Generate Test Key**.
5. Copy your:
   * **Key ID**: (Starts with `rzp_test_...`)
   * **Key Secret**: (Keep this confidential)

---

### **Step 2: Save Keys in PaySynapse**
1. Open PaySynapse in your browser: [`http://localhost:3000/integrations`](http://localhost:3000/integrations).
2. Under the **Razorpay Payment Gateway** card:
   * Paste your **Key ID** and click **Save**.
   * Paste your **Key Secret** and click **Save**.
3. The status indicator will turn green: **`Configured`**.

---

### **Step 3: Expose Localhost to the Internet via ngrok**
Open a new terminal window and run:
```bash
ngrok http 3000
```
ngrok will provide a public HTTPS forwarding address, for example:
```text
Forwarding: https://abcd-1234-5678.ngrok-free.app -> http://localhost:3000
```
> **Note**: Keep this terminal window open while running the demo.

---

### **Step 4: Configure Webhooks in Razorpay Dashboard**
1. In your Razorpay Dashboard (Test Mode), navigate to **Settings** $\to$ **Webhooks**.
2. Click **Add New Webhook** (`+`).
3. Set the fields:
   * **Webhook URL**: `https://your-ngrok-url.ngrok-free.app/api/webhooks/razorpay`
     *(Replace with your actual ngrok URL)*
   * **Secret**: Leave blank or set a custom secret (if set, also save it in PaySynapse `/integrations`).
   * **Active Events**: Check the following checkboxes:
     * `payment.captured`
     * `payment.failed`
     * `order.paid`
4. Click **Create Webhook**.

---

## 4. Running the Live Payment Demo

### **Step 5: Create a Test Payment Link**
You do not need to build a custom checkout website; Razorpay provides instant Payment Links:
1. In Razorpay Dashboard, go to **Payment Links** $\to$ **Create Payment Link**.
2. Set **Amount**: e.g., `₹2,500.00`.
3. Set **Description**: `Demo Laptop Sleeve / Acme Order`.
4. Click **Create Link** and copy the generated link.

---

### **Step 6: Make a Live Test Payment**
Open the copied payment link in a new browser tab:

#### **Test Payment Options**:
* **Option A: Test UPI**:
  * Select **UPI / QR**.
  * Enter VPA / UPI ID: `success@razorpay` (or scan the test QR code).
* **Option B: Test Credit / Debit Card**:
  * Card Number: `4111 2222 3333 4444` (or any valid test card number).
  * Expiry: Any future date (e.g. `12/28`).
  * CVV: `123`.
  * OTP: `123456` (or click "Success" on the mock OTP page).

---

### **Step 7: Watch Real-Time Ingestion & Reconciliation**

1. **Terminal / ngrok Log**:
   * You will see a `POST /api/webhooks/razorpay 200 OK` hit in your terminal.
2. **What PaySynapse Did Automatically**:
   * Verified the incoming webhook payload and logged the raw payload to `WebhookEvent`.
   * Created the `Order` and `Payment` records in the database.
   * Extracted the gateway fee & tax deducted by Razorpay.
   * Executed `reconcilePayment()` with your **Method-Aware MDR Pricing Matrix**.
   * Flagged that the payment is in-flight on Day 0 (**`MISSING_SETTLEMENT`**).

---

## 5. Live Inspection Across PaySynapse Modules

### **1. Inspect on Digital Twin ([`/digital-twin`](http://localhost:3000/digital-twin))**
1. Navigate to the **Digital Twin** page.
2. Search for the Razorpay Payment ID (e.g. `pay_...`) or Order ID.
3. Click `▶ Step-Through` to watch the money flow across the 5 nodes:
   * **01. Order**: `ORD_...` (₹2,500.00) $\to$ **PAID**
   * **02. Payment**: `pay_...` (₹2,500.00 via UPI/CARD) $\to$ **CAPTURED**
   * **03. Charges**: Verified against contractual MDR rules.
   * **04. Settlement**: Shows in-flight / pending status.
4. Click on the **Validation Checks** tab in the Node Inspector to see live arithmetic checks.

### **2. Inspect in Exception Center ([`/exceptions`](http://localhost:3000/exceptions))**
1. Open the **Exception Center**.
2. See the flagged in-flight / settlement status for your test transaction.
3. Click **"Generate Dispute Notice"** to preview an automated legal notice citing **RBI Master Directions** and **Section 10A of the IT Act 2000**.

### **3. Ask Google Gemini AI Copilot ([`/copilot`](http://localhost:3000/copilot))**
1. Open the **AI Copilot** page.
2. Enter a natural language prompt:
   ```text
   Analyze recent transaction pay_123456789 and explain the settlement risk.
   ```
3. Gemini AI will inspect the live database state and deliver a full root-cause breakdown with recommended next steps.

---

## 6. Testing Failure & Anomaly Scenarios

To demonstrate PaySynapse's anomaly intelligence to auditors or stakeholders:

| Scenario to Test | How to Trigger in Razorpay Test Mode | What PaySynapse Detects |
| :--- | :--- | :--- |
| **Payment Failure / Status Mismatch** | On the Razorpay test payment modal, select **Failure** during the mock OTP step. | Flags **`STATUS_MISMATCH`** (Order vs Payment failure). |
| **MDR Fee Overcharge** | In PaySynapse [`/integrations`](http://localhost:3000/integrations), change the Card MDR rate from 1.8% to 1.0%. Pay via card. | Flags **`FEE_MISMATCH`** because Razorpay deducted more than the newly configured rate! |
| **Instant Terminal Simulation** | Run `node scripts/simulate-webhook.js` in terminal. | Instantly fires an authentic synthetic webhook payload into the engine. |

---

## 7. Troubleshooting & FAQs

### Q: ngrok shows `502 Bad Gateway` or `Connection Refused`?
* Ensure your Next.js dev server is running on port 3000 (`npm run dev`).

### Q: Razorpay Webhook shows `Signature Verification Failed`?
* Ensure the Webhook Secret configured in Razorpay matches the `RAZORPAY_WEBHOOK_SECRET` saved in PaySynapse on `/integrations`. If no secret was set in Razorpay, leave it blank.

### Q: Why does the new test payment show `MISSING_SETTLEMENT`?
* This is correct financial behavior on Day $T+0$. A captured payment has not cleared the banking network yet. In production, the status transitions to `MATCHED` once the midnight bank statement (MT940/CAMT.053) or `settlement.processed` event clears.
