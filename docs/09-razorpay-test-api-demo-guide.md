# Razorpay Test API Demo Guide — End-to-End Live Integration

This guide provides a complete, battle-tested playbook for setting up and presenting a **live payment reconciliation demo** using the real **Razorpay Test API**, **Cloudflare Public Tunneling**, and **PaySynapse**.

---

## 1. Architecture of the Live Demo Flow

```
[Customer Pays via Test Payment Link / Checkout]
                        │
                        ▼ (Test Card / Netbanking / UPI)
             [Razorpay Test Gateway]
                        │
                        ▼ (Fires Real HTTPS Webhook POST)
         [Cloudflare Tunnel (*.trycloudflare.com)]
                        │
                        ▼
      [PaySynapse Server: /api/webhooks/razorpay]
                        │
                        ├─▶ 1. Idempotent Ingestion (Order, Payment, Fee)
                        ├─▶ 2. Resolves Method-Aware MDR Pricing Matrix
                        ├─▶ 3. Executes Deterministic 5-Point Lifecycle Math
                        └─▶ 4. Surfaces on Digital Twin & Exception Center
```

---

## 2. Prerequisites & Quick Setup

1. **PaySynapse Running Locally**:
   ```powershell
   npm run dev
   # Accessible at http://localhost:3000
   ```
2. **Next.js Tunnel Whitelist (`next.config.mjs`)**:
   Ensure `next.config.mjs` allows tunnel domains:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     allowedDevOrigins: [
       '127.0.0.1',
       'localhost',
       '*.trycloudflare.com',
       '*.ngrok-free.app'
     ],
   };
   export default nextConfig;
   ```
3. **Free Razorpay Account**: [https://dashboard.razorpay.com](https://dashboard.razorpay.com) (Toggle to **Test Mode**).

---

## 3. Step-by-Step Configuration

### **Step 1: Start the Cloudflare Tunnel (Zero Sign-up, Zero Install)**
In a separate terminal window, start Cloudflare Quick Tunnel:
```powershell
npx cloudflared tunnel --url http://localhost:3000
```
Look for the generated `.trycloudflare.com` URL in the output, for example:
```text
https://spots-westminster-remain-surprised.trycloudflare.com
```
> **Important**: Keep this terminal window open during your demo.

---

### **Step 2: Save Razorpay API Keys in PaySynapse**
1. In [Razorpay Dashboard (Test Mode)](https://dashboard.razorpay.com/) $\to$ **Settings** $\to$ **API Keys** $\to$ **Generate Test Key**.
2. Copy your **Key ID** (`rzp_test_...`) and **Key Secret**.
3. Open PaySynapse in your browser: [`http://localhost:3000/integrations`](http://localhost:3000/integrations).
4. Under the **Razorpay Payment Gateway** card, paste both keys and click **Save**.

---

### **Step 3: Configure Webhook in Razorpay Dashboard**
1. In Razorpay Dashboard (Test Mode), go to **Settings** $\to$ **Webhooks** $\to$ **Add New Webhook**.
2. Set the fields:
   * **Webhook URL**:
     ```text
     https://your-tunnel-id.trycloudflare.com/api/webhooks/razorpay
     ```
     *(Make sure to append `/api/webhooks/razorpay` to the tunnel URL)*
   * **Active Events**: Check the following:
     * `payment.captured`
     * `payment.failed`
     * `order.paid`
3. Click **Save** / **Create Webhook**.

---

## 4. Running the Live Payment Walkthrough

### **Step 4: Create a Test Payment Link**
1. In Razorpay Dashboard, go to **Payment Links** $\to$ **Create Payment Link**.
2. Set **Amount**: e.g., `₹800.00` or `₹2,500.00`.
3. Set **Description**: `Acme Enterprise Order`.
4. Click **Create Link** and open the generated link in a new browser tab.

---

### **Step 5: Complete the Payment**
* **Netbanking Test**: Select Netbanking $\to$ Choose any bank (e.g. HDFC/ICICI) $\to$ Click **Success**.
* **Card Test**: Number: `4111 2222 3333 4444`, Expiry: `12/28`, CVV: `123` $\to$ Click **Success**.
* **UPI Test**: VPA / UPI ID: `success@razorpay` $\to$ Click **Success**.

---

## 5. What Happens Live in PaySynapse & Why Exceptions Appear

Immediately after completing payment, open [`http://localhost:3000/transactions`](http://localhost:3000/transactions) or [`http://localhost:3000/digital-twin`](http://localhost:3000/digital-twin).

You will see the payment ingested live (e.g. `pay_TW6eSQNYy8KQF2`). Here is why the exceptions appear:

### **Exception 1: `MISSING_SETTLEMENT` (In-Flight Funds)**
* **Why it happens**: Customer paid ₹800 and Razorpay captured it on Day $T+0$. However, bank clearance takes $T+1$ or $T+2$ days.
* **FinOps Meaning**: PaySynapse tracks captured funds in real-time and warns that the gateway has not settled the money into the merchant's bank account yet.

### **Exception 2: `FEE_MISMATCH` (Contract Overcharge Detected!)**
* **Why it happens**: In PaySynapse [`/integrations`](http://localhost:3000/integrations), your contractual pricing rule is configured (e.g., Netbanking = Flat ₹15.00).
* Razorpay Test Gateway billed ₹20.76 (2.2% + GST).
* **FinOps Meaning**: PaySynapse audits the fee arithmetic and flags a **₹5.76 Overcharge Variance**.

---

## 6. How to Showcase This in a Demo / Presentation

### **Live Visual Topology Inspection**

![PaySynapse Live Digital Twin Financial Lineage](images/digital-twin-live-demo.png)

1. **Step-Through on Digital Twin ([`/digital-twin`](http://localhost:3000/digital-twin))**:
   * Search the live payment ID (e.g., `pay_TW6eSQNYy8KQF2`).
   * Click `▶ Step-Through` to visually watch the money flow across the 5 nodes:
     * **01. Merchant Order**: `order_TW6eItTm1fkiWl` (₹800.00) $\to$ `PAID`
     * **02. Gateway Payment**: `pay_TW6eSQNYy8KQF2` (₹800.00 via Netbanking) $\to$ `CAPTURED`
     * **03. Charges & GST**: Deductions: -₹23.92 (Fee: ₹20.76 | GST: ₹3.16)
     * **04. Settlement Batch**: Flagged with red alert connector: `⚠️ Missing / Unsettled` (Gateway payout pending)
     * **05. Nodal Bank UTR**: ₹0.00 (Pending bank clearance)
   * Open the **Validation Checks** tab in the Inspector to show the exact arithmetic and SLA status.

2. **Generate Official RBI Legal Dispute Notice ([`/exceptions`](http://localhost:3000/exceptions))**:
   * Open the **Exception Center**.
   * Locate the `FEE_MISMATCH` exception for your live test payment.
   * Click **"Generate Dispute Notice"**.
   * Show the automatically generated legal notice citing **RBI Master Directions** and **Section 10A of the IT Act 2000**, with the exact live Payment ID and ₹5.76 fee discrepancy!
   * Click **Print / Save as PDF**.

3. **Autonomous Investigation with Gemini AI ([`/copilot`](http://localhost:3000/copilot))**:
   * Open the **AI Copilot**.
   * Ask: *"Analyze the fee discrepancy on my recent live payment."*
   * Watch Gemini explain the contract rate vs billed fee variance in plain English with 1-click remediation.

---

## 7. Common Mistakes & Gotchas (Troubleshooting Cheatsheet)

| Issue Encountered | Root Cause | Solution |
| :--- | :--- | :--- |
| **Razorpay error: `The hostname is not allowed`** | Razorpay blocks `.loca.lt` (Localtunnel) domains for security. | Use Cloudflare Tunnel (`npx cloudflared tunnel --url http://localhost:3000`) which produces `.trycloudflare.com` (100% accepted). |
| **Cloudflare error: `malformed HTTP response "Unauthorized"`** | Next.js 15/16 dev server blocks external hosts by default. | Add `'*.trycloudflare.com'` to `allowedDevOrigins` in `next.config.mjs`. |
| **ngrok error: `ERR_NGROK_121`** | Installed ngrok CLI version is older than `3.20.0`. | Run `ngrok update` or switch to Cloudflare Tunnel. |
| **Webhook shows 404 or fails in Razorpay** | Webhook URL missing endpoint path. | Ensure URL ends with `/api/webhooks/razorpay` (e.g. `https://xxx.trycloudflare.com/api/webhooks/razorpay`). |
| **Duplicate fee entries on single payment** | Razorpay fires both `order.paid` and `payment.captured` webhooks. | The webhook handler uses **idempotent fee upserting** (`prisma.fee.deleteMany` before insert). |
