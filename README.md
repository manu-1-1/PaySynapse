<div align="center">
  <img src="public/icon.svg" alt="PaySynapse Logo" width="100" height="100" />
  
  # PaySynapse
  
  **Autonomous Financial Reconciliation & Exception Intelligence Engine**

  [![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
  [![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75FF?style=flat-square&logo=google)](https://ai.google.dev/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

  *Catch missing settlements, gateway overcharges, short-settlements, and orphaned transactions instantly with 100% deterministic ledger matching and AI root-cause analysis.*

</div>

---

## 🌟 Overview

**PaySynapse** is an enterprise-grade financial operations platform designed for high-volume payment processing. It bridges the gap between payment gateways (Razorpay, Stripe, etc.), internal order ledgers, and bank clearing statements.

By replacing manual spreadsheet matching with a **deterministic reconciliation engine** and **AI-powered exception triaging**, PaySynapse eliminates revenue leakage and provides complete transparency into your financial operations.

---

## ✨ Key Features

### 1. ⚡ 100% Deterministic Reconciliation Engine
* **5-Point Node Matching**: Validates Order $\rightarrow$ Payment $\rightarrow$ Gateway Fees & GST $\rightarrow$ Net Settlement $\rightarrow$ Bank UTR Clearance.
* **Instant Discrepancy Detection**: Catches missing settlements, fee overcharges, short settlements, status mismatches, and duplicate transactions.
* **Audit Compliant**: Strict ledger math without speculative or hallucinated numbers.

### 2. 🌐 Transaction Digital Twin
* **Visual Node Graph**: Interactive 5-stage node visualizer showing the exact physical lifecycle of every payment.
* **Chronological Timeline View**: Audit trail of every gateway webhook, ledger entry, and bank clearing timestamp.
* **Interactive Sandbox**: Inject synthetic anomalies (dropped settlements, fee overcharges, missing refunds) in real-time to test system resilience.

### 3. 🤖 AI Copilot & Root Cause Analysis
* **Gemini AI Integration**: Autonomous investigation engine powered by Google Gemini AI.
* **Natural Language Copilot**: Ask questions like *"What is our total risk exposure?"* or *"Explain anomaly on payment rzp_pay_123"*.
* **Automated Action Recommendations**: Provides step-by-step remediation advice for operations teams.

### 4. 🛠️ One-Click & Autonomous Resolution
* Execute automated recovery actions directly from the dashboard:
  * Force retry missing refunds
  * Query nodal bank settlement status
  * File dispute tickets for gateway overcharges
  * Request short-settlement true-ups
  * Auto-reverse duplicate ledger entries

### 5. 📊 Operations Analytics & Settlement Velocity
* Real-time metrics for Global Match Rate, Total Processed Volume, and Financial Risk Exposure.
* **Settlement Velocity Charting**: T+0, T+1, T+2, and delayed settlement breakdown.
* **Exception Distribution Breakdown**: Categorized pie chart analysis of open discrepancy types.

### 6. 🎨 Premium Modern Fintech UI
* Built with glassmorphism, dynamic dark/light mode, gradient accents, smooth keyframe animations, and animated KPI counters.
* Fully responsive layout optimized for all desktop and mobile viewports.

---

## 🏗️ Architecture & Tech Stack

```
PaySynapse Platform
├── Frontend: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, Recharts
├── Backend: Next.js API Routes, Next Middleware, Webhook Handlers
├── Database & ORM: SQLite / PostgreSQL via Prisma ORM 5.22
├── AI Engine: Google Gemini AI SDK (@google/genai 2.19)
└── Auth & Security: JWT (jose), bcryptjs password hashing, HTTP-Only Cookies
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/manu-1-1/PaySynapse.git
   cd PaySynapse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your_jwt_secret_key_here"
   GEMINI_API_KEY="your_google_gemini_api_key"
   RAZORPAY_KEY_ID="rzp_test_your_key_id"
   RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
   ```

4. **Initialize Database & Seed Demo Data**:
   ```bash
   # Push Prisma schema to SQLite database
   npx prisma db push

   # Generate realistic demo dataset (Orders, Payments, Settlements, Exceptions)
   npm run generate-demo-data
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Account Credentials

Default login credentials pre-configured for instant demo access:

| Email | Password | Role |
| :--- | :--- | :--- |
| `ops@demo.paysynapse.com` | `password123` | Financial Operations Admin |

---

## 🧪 Testing & Webhook Simulation

Simulate live Razorpay gateway webhooks to watch real-time exception detection in action:

```bash
# Send a simulated Razorpay payment webhook
node scripts/simulate-webhook.js

# Execute full reconciliation engine test
npm run test-reconciliation
```

---

## 📂 Project Structure

```
PaySynapse/
├── app/
│   ├── (dashboard)/             # Authenticated Dashboard Routes
│   │   ├── analytics/           # Operations & Settlement Analytics
│   │   ├── copilot/             # AI Copilot Natural Language Interface
│   │   ├── dashboard/           # Reconciliation Overview & KPIs
│   │   ├── digital-twin/        # 5-Stage Transaction Lifecycle Visualizer
│   │   ├── exceptions/          # Exception Center & Resolution Triage
│   │   ├── integrations/        # API Keys & Gateway Configuration
│   │   └── transactions/        # Transaction Ledger & Lineage Details
│   ├── api/                     # REST API Endpoints & Webhooks
│   │   ├── ai/                  # Gemini AI Investigation Routes
│   │   ├── analytics/           # Analytics Data Aggregation
│   │   ├── auth/                # Login, Logout & Session Management
│   │   ├── exceptions/          # Exception Filtering & Resolution
│   │   ├── simulate/            # Anomaly Injection Sandbox
│   │   ├── transactions/        # Ledger Queries & Details
│   │   └── webhooks/razorpay/   # Live Gateway Webhook Handler
│   ├── globals.css              # Glassmorphic Design System & Keyframe Animations
│   ├── icon.svg                 # SVG App Icon & Favicon
│   ├── layout.js                # Root Layout & Theme Provider
│   └── page.js                  # Landing & Auth Page
├── components/                  # Reusable UI Components (Header, Sidebar, ThemeProvider)
├── lib/                         # Core Business Logic (Reconciliation Engine, Gemini AI Client)
├── prisma/                      # Database Schema & Seed Scripts
└── scripts/                     # Webhook Simulation & Test Utilities
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ by the PaySynapse Engineering Team.</sub>
</div>
