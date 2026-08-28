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

  *Catch missing settlements, gateway fee overcharges, short-settlements, and orphaned transactions instantly with 100% deterministic ledger matching and AI root-cause analysis.*

</div>

---

## 📌 Executive Summary

**PaySynapse** is an enterprise-grade financial operations and reconciliation platform engineered for high-volume merchants, payment aggregators, and fintechs. 

Traditional payment reconciliation relies on fragmented, retroactive batch spreadsheets that leave businesses blind to silent revenue leaks. PaySynapse solves this by providing **real-time deterministic transaction matching**, **interactive financial topology reconstruction**, **high-throughput chaos testing**, and **AI-driven dispute resolution**.

---

## ✨ Key Enterprise Capabilities

### 1. 🔍 5-Point Deterministic Reconciliation Engine
* **Complete Financial Lineage**: Verifies every transaction through a 5-step pipeline:
  $$\text{01 Order} \longrightarrow \text{02 Payment} \longrightarrow \text{03 Charges \& GST} \longrightarrow \text{04 Gateway Batch} \longrightarrow \text{05 Bank Clearance}$$
* **Mathematical Ledger Integrity**: Automatically validates:
  $$\text{Gross Payment} - (\text{MDR Fee} + \text{18\% GST}) = \text{Net Bank Credit}$$
* **Instant Discrepancy Detection**: Immediately isolates missing settlements, double ledger postings, MDR overcharges, short settlements, and SLA breaches.

### 2. 🌐 Transaction Digital Twin & Topology Visualizer
* **Interactive Node Pipeline**: Visualizes the physical fund flow across internal systems, payment gateways, and banking rails.
* **Step-Through Playback**: Step through each phase of fund movement to identify the precise moment of failure.
* **Scenario Sandbox**: Test system responses against 8 real-world payment failure profiles (*Missing Settlement, Fee Discrepancy, Short Settlement, T+10 Delay, Duplicate Entry, Status Mismatch, Missing Refund*).

### 3. ⚡ Traffic & Stress Test Studio (`/simulator`)
* **High-Throughput Ingestion Engine**: Simulate flash sales, festive peaks, and sustained traffic from 10 to 500 TPS.
* **Chaos Fault Injection**: Toggle live failure modes (Drop Gateway Settlement Batches, Inject 2x MDR Overcharges, Add Webhook Latency Delays, Duplicate Payloads).
* **Real-Time Log Stream**: Monitored sub-2ms deterministic reconciliation stream with live throughput and latency analytics.

### 4. ⚖️ Autonomous Dispute Packet Generator
* **1-Click Legal Notice Creation**: Generate pre-drafted formal dispute letters to banks and payment aggregators.
* **Statutory Compliance**: Cites official **RBI Master Directions** on Payment Aggregator Settlement SLAs and Nodal Escrow guidelines.
* **Cryptographic Evidence Table**: Generates SHA-256 Merkle root hashes and complete transaction audit histories.

### 5. 📜 Cryptographic RBI Nodal Compliance Certificate Export
* **Audit-Ready Certification**: One-click generation of watermarked, printable compliance certificates for internal audits and statutory regulators.
* **Verifiable Hashes**: Features SHA-256 cryptographic verification and match rate attestation.

### 6. 🤖 Gemini AI Investigation Copilot
* **Root-Cause Analysis**: Autonomous anomaly diagnosis powered by Google Gemini AI.
* **Natural Language Queries**: Ask questions like *"What is our total unrecovered variance across HDFC batches?"* or *"Diagnose payment pay_928172"*.
* **Action Recommendations**: Step-by-step remediation advice for operations and finance teams.

### 7. 🗄️ In-App Sandbox & Ledger Reset (`/integrations`)
* **0-Volume Purge**: One-click action to clear all test data for clean live webhook testing.
* **Dynamic Re-Seeding**: Generate 50, 100, 250, 500, or 1,000 realistic transactions with automated reconciliation.

### 8. 🎨 Clean Enterprise Fintech Design
* Designed with **Razorpay-inspired aesthetics**, crisp typography (**Inter**), balanced neutral surfaces, and an **interactive drag-to-resize sidebar**.

---

## 🏗️ Architecture & Technology Stack

```
PaySynapse Platform
├── Frontend: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, Recharts
├── Backend: Next.js API Routes, Jose JWT Middleware, Razorpay Webhook Ingestion
├── Database & ORM: SQLite / PostgreSQL via Prisma ORM 5.22
├── AI Engine: Google Gemini AI SDK (@google/genai)
└── Security: JWT Authentication, bcryptjs password hashing, HTTP-Only Cookies
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

3. **Configure Environment Variables**:
   Create a `.env` file in the project root:
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

   # Generate realistic demo records (Orders, Payments, Settlements, Exceptions)
   npm run generate-demo-data
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Demo Credentials

Use the following credentials for instant access:

| Email | Password | Role |
| :--- | :--- | :--- |
| `ops@demo.paysynapse.com` | `password123` | Financial Operations Admin |

---

## 🧪 Testing & Verification

### 1. Test Gateway Webhooks with Razorpay Test Mode
Expose your local server and configure your Razorpay webhook endpoint:
```bash
npx ngrok http 3000
```
Set webhook URL in Razorpay Dashboard to: `https://<your-ngrok-url>/api/webhooks/razorpay`

### 2. Run Deterministic Reconciliation Engine
```bash
npm run test-reconciliation
```

### 3. Generate Simulated Webhooks
```bash
node scripts/simulate-webhook.js
```

---

## 📂 Project Structure

```
PaySynapse/
├── app/
│   ├── (dashboard)/             # Authenticated Dashboard Routes
│   │   ├── analytics/           # Operations, Settlement Velocity & RBI Certificate
│   │   ├── copilot/             # AI Copilot Natural Language Investigation
│   │   ├── dashboard/           # Reconciliation Overview & Financial Health KPIs
│   │   ├── digital-twin/        # 5-Stage Transaction Topology Visualizer
│   │   ├── exceptions/          # Exception Triage & Dispute Packet Generator
│   │   ├── integrations/        # API Credentials & Sandbox Ledger Reset
│   │   ├── simulator/           # Traffic & Stress Test Studio (10-500 TPS)
│   │   └── transactions/        # Transaction Ledger & Lineage Details
│   ├── api/                     # REST API Endpoints & Webhooks
│   │   ├── ai/                  # Gemini AI Investigation Routes
│   │   ├── analytics/           # Reconciliation Metrics Aggregation
│   │   ├── auth/                # Authentication & Session Handlers
│   │   ├── exceptions/          # Exception Queries & Resolution
│   │   ├── settings/reset/      # Ledger Purge & Custom Dataset Seeding
│   │   └── webhooks/razorpay/   # Live Gateway Webhook Handler
│   ├── globals.css              # Razorpay Fintech Design Tokens & Styles
│   ├── layout.js                # Inter Font & Theme Provider
│   └── page.js                  # Authentication & Login Page
├── components/                  # UI Components (Header, Resizable Sidebar, Dispute Modal, Certificate Modal)
├── lib/                         # Business Logic (Reconciliation Engine, Gemini AI Client)
├── prisma/                      # Database Schema & Migrations
└── scripts/                     # Seed Utilities & Verification Scripts
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with PaySynapse Financial Intelligence Engine</sub>
</div>
