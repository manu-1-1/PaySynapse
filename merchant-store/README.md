# 🛒 CyberDeck Merchant Storefront

> **Next.js 16 E-Commerce Storefront & Payment Gateway Simulator**  
> Leg 1 of the **PaySynapse 3-Tier Tripartite Financial Infrastructure**

---

## 📌 Overview: What is this Project?

The **CyberDeck Merchant Storefront** is a consumer-facing hardware e-commerce application designed to simulate real-world e-commerce checkout flows and order lifecycles. Within the **PaySynapse** ecosystem, it acts as the primary transaction generator (Leg 1) that initiates customer payments, collects transaction tokens via Razorpay Checkout, and synchronizes real-time order intents with the central **PaySynapse Reconciler** engine.

```
┌─────────────────────────────────┐
│     CyberDeck Merchant Store    │  ◄── (You are here: Port 3001)
│     - Products & Cart           │
│     - Razorpay Checkout SDK     │
└────────────────┬────────────────┘
                 │ 1. Payment Captured
                 ▼
┌─────────────────────────────────┐      3. Settlement Batch
│   PaySynapse Core Reconciler    │ ◄───────────────────────────┐
│   (Port 3000 - 5-Point Match)   │                             │
└─────────────────────────────────┘                             │
                                                  ┌─────────────┴─────────────┐
                                                  │   Apex Nodal Bank Portal  │
                                                  │   (Port 3002 - RBI Escrow)│
                                                  └───────────────────────────┘
```

---

## 🎯 Role in the PaySynapse Ecosystem

In a production fintech setup, financial reconciliation cannot exist in a vacuum; it requires a tripartite alignment across:
1. **The Merchant Order Ledger** (CyberDeck Storefront — `:3001`)
2. **The Payment Aggregator** (Razorpay Webhooks / API)
3. **The Escrow & Banking Rail** (Apex Nodal Bank Simulator — `:3002`)

When a user purchases an item in this store:
- An official Razorpay order is registered via `/api/order`.
- The customer executes payment via the Razorpay Standard Checkout modal.
- Upon success, the client records the order and dispatches a sync payload via `/api/sync-paysynapse` to the local PaySynapse webhook handler at `http://localhost:3000/api/webhooks/razorpay`.
- This triggers the first 2 legs of the **5-point deterministic reconciliation engine** (`ORDER_CREATED` & `PAYMENT_CAPTURED`).

---

## 📂 Project Architecture & What's Inside

```
merchant-store/
├── public/                     # Static assets (product images, icons)
│   └── images/                 # Hardware catalog imagery (keypad, earbuds, etc.)
├── src/
│   └── app/
│       ├── api/
│       │   ├── order/
│       │   │   └── route.js    # Creates Razorpay Orders via official SDK
│       │   ├── refund/
│       │   │   └── route.js    # Initiates payment refunds against Razorpay
│       │   └── sync-paysynapse/
│       │       └── route.js    # Dispatches captured payment to PaySynapse Reconciler
│       ├── context/
│       │   └── StoreContext.js # Cart state, items persistence, order history in localStorage
│       ├── orders/
│       │   └── page.js         # Customer Order History dashboard & sync inspector
│       ├── globals.css         # Tailwind CSS v4 styling & dark theme tokens
│       ├── layout.js          # Root HTML layout & Razorpay Checkout script injector
│       └── page.js            # Cyberpunk hardware product grid, drawer, & checkout
├── .env.example                # Template for Razorpay sandbox credentials
├── Dockerfile                  # Containerized deployment recipe for port 3001
├── package.json                # Dependencies: Next.js 16, Razorpay SDK, React 19, Tailwind CSS v4
└── README.md                   # This documentation file
```

### Key Modules Explained

| Path | Purpose & Functionality |
| :--- | :--- |
| **`src/app/page.js`** | Primary storefront displaying 6 cyberpunk hardware products (Matrix Keypad, AeroPulse Earbuds, Neo Glass XR, MagCharge Dock, Carbon Mouse, Lightbar). Manages shopping cart and triggers Razorpay modal. |
| **`src/app/orders/page.js`** | Order management view displaying completed customer orders, Razorpay Payment IDs, transaction timestamps, and payment statuses. |
| **`src/app/api/order/route.js`** | Server-side handler that instantiates `new Razorpay(...)` and generates an `order_id` in paise (`amount * 100`) with INR currency. |
| **`src/app/api/sync-paysynapse/route.js`** | Bridges the store with PaySynapse core reconciler (`:3000`), formatting the payment into a standard `payment.captured` event with calculated 2% gateway fees + 18% GST. |
| **`src/app/context/StoreContext.js`** | Global React state provider handling cart additions, item quantities, total calculation, and saving order receipts into browser storage. |

---

## ⚙️ Environment Configuration

Create a `.env` file in the `merchant-store` directory based on `.env.example`:

```bash
cp .env.example .env
```

Set your Razorpay Sandbox API keys:

```env
# Server-side credentials (obtained from Razorpay Dashboard > Settings > API Keys)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here

# Client-side public key used by the checkout JavaScript script
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

> [!TIP]
> You can obtain free sandbox keys by signing up at [dashboard.razorpay.com](https://dashboard.razorpay.com) in Test Mode. If keys are omitted or dummy values are used, order initialization will return an error when communicating with Razorpay.

---

## 🚀 How to Run & Use the Storefront

### 1. Standalone Execution

From within the `merchant-store` directory:

```bash
# Install dependencies
npm install

# Start development server on port 3001
npm run dev
```

The store is now live at: **`http://localhost:3001`**

### 2. Ecosystem Execution (From Repository Root)

You can also run all three applications simultaneously from the root `PaySynapse` directory:

```bash
# Run merchant store only
npm run dev:merchant

# Or launch all 3 apps concurrently (Reconciler :3000, Store :3001, Bank :3002)
npm run dev:all
# Or on Windows:
scripts\start-ecosystem.bat
```

---

## 💳 Step-by-Step: Making a Test Purchase

1. Open **`http://localhost:3001`** in your browser.
2. Select any product (e.g., *CyberDeck Matrix Keypad* — ₹499) and click **Add to Cart** or **Buy Now**.
3. Open the cart drawer and click **Proceed to Checkout**.
4. The Razorpay modal pops up:
   - **Card**: Use Razorpay test card `4111 1111 1111 1111`, any future expiry (e.g. `12/28`), and CVV `123`.
   - **OTP**: Enter `123456` or click **Success**.
   - **UPI**: Use `success@razorpay` to simulate an instant UPI approval.
5. Upon confirmation:
   - A success banner will display the generated **Payment ID** (e.g., `pay_P9x...`).
   - The purchase appears in **My Orders** (`http://localhost:3001/orders`).
   - An automatic background dispatch sends the transaction to **PaySynapse Reconciler** on `http://localhost:3000`.
6. Open the PaySynapse Core Dashboard at `http://localhost:3000` to watch the digital twin register the order and payment nodes live!

---

## 📡 API Reference

### `POST /api/order`
Creates a Razorpay order before opening the checkout modal.
- **Request Body**:
  ```json
  { "amount": 499 }
  ```
- **Response**:
  ```json
  {
    "id": "order_P9xYz12345678",
    "entity": "order",
    "amount": 49900,
    "currency": "INR",
    "status": "created"
  }
  ```

### `POST /api/sync-paysynapse`
Transfers the captured payment payload to PaySynapse core webhook receiver (`:3000`).
- **Request Body**:
  ```json
  {
    "paymentId": "pay_P9x...",
    "orderId": "order_P9x...",
    "amount": 499,
    "currency": "INR",
    "method": "card"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "synced": { "received": true, "paymentId": "pay_P9x..." }
  }
  ```

### `POST /api/refund`
Triggers a refund test request against Razorpay.
- **Request Body**:
  ```json
  {
    "paymentId": "pay_P9x...",
    "amount": 499
  }
  ```

---

## 🔧 Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Razorpay modal does not appear** | Missing or incorrect `NEXT_PUBLIC_RAZORPAY_KEY_ID`. | Verify `.env` has valid `rzp_test_...` key and restart the server (`npm run dev`). |
| **"Failed to initialize order"** | Invalid `RAZORPAY_KEY_SECRET` or network block. | Ensure server credentials match your Razorpay sandbox account. |
| **Orders not showing in PaySynapse (`:3000`)** | Core PaySynapse app is not running. | Ensure `http://localhost:3000` is active. Check terminal output for sync errors. |
| **Port 3001 already in use** | Another process is occupying port 3001. | Kill the process occupying port 3001 (`npx kill-port 3001`) or check running background node tasks. |
