<div align="center">
  <img src="public/icon.svg" alt="PaySynapse Logo" width="90" height="90" />
  
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

## Overview

**PaySynapse** is an enterprise-grade financial operations and reconciliation platform designed for high-volume payment processing. It bridges the gap between payment gateways (Razorpay, Stripe, Cashfree), internal merchant order ledgers, and bank clearing statements.

By replacing manual spreadsheet matching with a **deterministic 5-point reconciliation engine**, **visual digital-twin topology**, **traffic stress testing studio**, and **AI-powered dispute packet generation**, PaySynapse eliminates revenue leakage and provides complete transparency into financial operations.

---

## Key Features

### 1. 100% Deterministic Reconciliation Engine
* **5-Point Lifecycle Matching**: Verifies arithmetic integrity from `01 Order` $\rightarrow$ `02 Payment` $\rightarrow$ `03 Charges & GST` $\rightarrow$ `04 Net Settlement` $\rightarrow$ `05 Bank Clearance (UTR)`.
* **Instant Discrepancy Detection**: Flags missing settlements, MDR fee overcharges, short settlements, duplicate entries, SLA delays, and status mismatches.
* **Audit Compliant**: Strict double-entry ledger mathematics without speculative numbers.

### 2. Interactive Digital Twin Topology Visualizer
* **5-Stage Pipeline Graph**: Interactive step-by-step financial topology visualization with directional connectors and status pills.
* **Step-Through Playback Controller**: `▶ Step-Through` controller to walk through each node's funds flow step-by-step.
* **Arithmetic Balance Reconciliation Bar**: Live verification of Gross Amount $-$ Gateway Fee (1.8%) $-$ GST (18%) $=$ Net Settlement.
* **Tabbed Node Inspector**: Inspect Overview, Validation Checks, and Raw JSON payload for any node in the transaction chain.
* **Preset Scenario Testing**: 1-click simulations for Normal Flow, Missing Settlement, Fee Discrepancy, Short Settlement, T+10 Settlement, and Duplicate Entries.

### 3. Traffic & Stress Test Studio (`/simulator`)
* **Real-Time Load Generator**: Dynamic slider to test throughput from 10 to 500 TPS with live latency and match rate metrics.
* **Active Chaos Fault Injection**: Toggle failure modes on the fly (Drop Settlements, Double MDR Fees, Webhook Delays, Duplicate Pay IDs).
* **Burst Load Testing**: One-click `Burst 100` concurrent transactions delivery.
* **Isolated Log Stream Terminal**: Live streaming webhook reconciliation terminal with smooth internal auto-scrolling and quick Pause/Resume controls.

### 4. Autonomous Dispute Packet Generator
* **One-Click Legal Notices**: Generates formal dispute notices citing official **RBI Master Directions** and **Section 10A of the IT Act 2000**.
* **Cryptographic Evidence Table**: Itemizes Gross Amount, Charged Fee, Net Variance, Gateway Payment ID, Order ID, and Bank UTR.
* **Export Options**: 1-click **Copy Email Notice** or **Print / Save as PDF** to send to payment aggregator legal/operations desks.

### 5. Cryptographic RBI Nodal Compliance Certificate Export
* **Verifiable Audit Proof**: Generates official RBI Escrow & Nodal Compliance Certificates directly from `/analytics`.
* **Cryptographic Merkle Root**: Includes verifiable SHA-256 Merkle root, official seal, and exact match rate statistics for regulators and auditors.

### 6. AI Copilot & Root Cause Analysis
* **Google Gemini AI Integration**: Autonomous investigation engine to diagnose anomalies and calculate net financial exposure.
* **Natural Language Copilot**: Ask natural language questions like *"What is our total risk exposure?"* or *"Analyze anomaly on payment pay_123"*.
* **Action Center Remediation**: Automated recommendations to resolve discrepancies directly from the UI.

### 7. Ledger Data Management & Sandbox Reset
* **Purge All Test Transactions**: One-click action on `/integrations` to clear all transactions and reset volume to `0` for live webhook testing.
* **Dynamic Re-Seed Volume Selector**: Choose between 50, 100, 250, 500, or 1,000 transaction datasets to re-populate and reconcile on demand.

### 8. Enterprise Razorpay-Inspired UI & Resizable Sidebar
* **Fintech Design System**: Clean typography with Inter font, `--rp-blue: #528FF0` primary branding, and crisp light/dark mode surfaces.
* **Resizable & Collapsible Sidebar**: Interactive drag-to-resize handle (68px to 380px) and one-click collapse toggle with localStorage persistence.
* **Real-Time Notification Bell**: Unread anomaly counter badge with interactive dropdown linking directly to exception triage.

---

## Architecture & Tech Stack

```
PaySynapse Platform
├── Frontend: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, Recharts
├── Backend: Next.js API Routes, Next Middleware, Webhook Handlers
├── Database & ORM: SQLite / PostgreSQL via Prisma ORM 5.22
├── AI Engine: Google Gemini AI SDK (@google/genai 2.19)
└── Auth & Security: JWT (jose), bcryptjs password hashing, HTTP-Only Cookies
```

---

## Getting Started

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

4. **Initialize Database & Seed Data**:
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

## Demo Account Credentials

Default login credentials pre-configured for instant access:

| Email | Password | Role |
| :--- | :--- | :--- |
| `ops@demo.paysynapse.com` | `password123` | Financial Operations Admin |

---

## Testing & Webhook Simulation

Simulate live Razorpay gateway webhooks to watch real-time exception detection in action:

```bash
# Send a simulated Razorpay payment webhook
node scripts/simulate-webhook.js

# Execute full reconciliation engine test
npm run test-reconciliation
```

---

## Project Structure

```
PaySynapse/
├── app/
│   ├── (dashboard)/             # Authenticated Dashboard Routes
│   │   ├── analytics/           # Operations & Settlement Analytics (+ RBI Certificate)
│   │   ├── copilot/             # AI Copilot Natural Language Interface
│   │   ├── dashboard/           # Reconciliation Overview & KPIs
│   │   ├── digital-twin/        # 5-Stage Step-Through Lifecycle Visualizer
│   │   ├── exceptions/          # Exception Center & Dispute Packet Generator
│   │   ├── integrations/        # API Keys & Ledger Sandbox Data Reset
│   │   ├── simulator/           # Traffic & Stress Test Load Generator Studio
│   │   └── transactions/        # Transaction Ledger & Lineage Details
│   ├── api/                     # REST API Endpoints & Webhooks
│   │   ├── ai/                  # Gemini AI Investigation Routes
│   │   ├── analytics/           # Analytics Data Aggregation
│   │   ├── auth/                # Login, Logout & Session Management
│   │   ├── exceptions/          # Exception Filtering, Recent Polling & Resolution
│   │   ├── settings/            # API Keys & Reset/Re-Seed Data Endpoints
│   │   ├── simulate/            # Anomaly Injection Sandbox
│   │   ├── transactions/        # Ledger Queries & Details
│   │   └── webhooks/razorpay/   # Live Gateway Webhook Handler
│   ├── globals.css              # Razorpay Fintech Design Tokens & Styles
│   ├── icon.svg                 # SVG App Icon & Favicon
│   ├── layout.js                # Root Layout with Inter Font & Theme Provider
│   └── page.js                  # Landing & Auth Page
├── components/                  # UI Components (Header, Sidebar, DisputePacketModal, ComplianceCertificateModal)
├── lib/                         # Core Logic (Reconciliation Engine, Gemini AI Client)
├── prisma/                      # Database Schema & Migrations
└── scripts/                     # Webhook Simulation & Test Utilities
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>PaySynapse Platform — Autonomous Financial Operations</sub>
</div>
