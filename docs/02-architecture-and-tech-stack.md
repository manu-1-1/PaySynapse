# Module 02: System Architecture & Tech Stack

## 2.1 High-Level System Architecture

```
                                +-----------------------+
                                |  External Gateways    |
                                | (Razorpay Webhooks)   |
                                +-----------+-----------+
                                            |
                                            v
+-------------------------------------------------------------------------------+
|                             PaySynapse Next.js App                            |
|                                                                               |
|   +-----------------------+     +-------------------+     +------------------+|
|   | Middleware (Security) | --> | API Routes / App  | --> | Next.js Engine   ||
|   +-----------------------+     +---------+---------+     +------------------+|
|                                           |                                   |
|               +---------------------------+---------------------------+       |
|               |                           |                           |       |
|               v                           v                           v       |
|   +-----------------------+   +-----------------------+   +------------------+|
|   | Reconciliation Engine |   | Gemini AI SDK Engine  |   | UI Dashboard     ||
|   |  (lib/reconciliation) |   |   (lib/ai/gemini)     |   | (React 19 / UI)  ||
|   +-----------+-----------+   +-----------+-----------+   +------------------+|
|               |                           |                                   |
+---------------|---------------------------|-----------------------------------+
                |                           |
                v                           v
+-------------------------------------------------------+
|                 Prisma ORM (5.22)                     |
|           PostgreSQL / SQLite Database                |
+-------------------------------------------------------+
```

---

## 2.2 Technology Stack Technical Breakdown

### Core Frameworks & Runtime
* **Next.js 16.3.3 (App Router)**: Hybrid Server & Client Rendering, API Route handlers, Server Actions capability, and middleware request interception.
* **React 19.2.8**: Component architecture utilizing hooks (`useState`, `useEffect`, `useCallback`) and client components (`'use client'`).
* **Node.js**: v18+ execution environment.

### Database & ORM
* **Prisma ORM 5.22.0**: Type-safe query generator, schema migrations, declarative relation management, and seed script integration.
* **PostgreSQL / SQLite**: Target relational database powering transactions, reconciliation ledgers, and audit logs.

### Artificial Intelligence & Data Processing
* **Google Gemini AI SDK (`@google/genai` v2.19.0)**: Powered by `gemini-2.5-flash` model for structured JSON analysis, natural language text-to-insight querying, and confidence scoring.

### Styling & UI Design System
* **Tailwind CSS v4.0**: Utility-first CSS engine with custom `@theme` variables, keyframe animations (`glow`, `pulse`, `counter`), and backdrop filters.
* **Lucide React Icons**: Iconography for fintech nodes, exception statuses, and navigation.
* **Recharts 3.10.1**: Operations analytics visualizer (Pie Charts, Responsive Container, Bar Charts, Settlement Velocity Area Charts).
* **Next Themes**: Dark/Light mode switcher with persistent system preference support.

### Auth & Security
* **jose (v6.2.10)**: Edge-compatible JSON Web Token (JWT) verification and signing.
* **bcryptjs (v3.0.3)**: Salted password hashing for administrator and operator user accounts.

---

## 2.3 Comprehensive Repository Directory Map

```
PaySynapse/
├── app/                              # Next.js 16 App Router Structure
│   ├── (dashboard)/                  # Authenticated Route Group
│   │   ├── analytics/page.jsx        # Operations & Settlement Analytics UI
│   │   ├── copilot/page.jsx          # AI Natural Language Chat UI
│   │   ├── dashboard/page.jsx        # Master Overview Dashboard & KPIs
│   │   ├── digital-twin/page.jsx     # 5-Stage Lifecycle Node Visualizer
│   │   ├── exceptions/page.jsx       # Exception Resolution Center UI
│   │   ├── integrations/page.jsx     # API Credentials & Gateway Config UI
│   │   ├── transactions/page.jsx     # Detailed Ledger & Lineage UI
│   │   └── layout.jsx                # Dashboard Shell (Header + Sidebar)
│   ├── api/                          # REST API Handlers
│   │   ├── ai/
│   │   │   ├── copilot/route.js      # Natural Language Query Endpoint
│   │   │   └── investigate/route.js  # Automated Root Cause Analysis Endpoint
│   │   ├── analytics/route.js        # Analytics Aggregation Endpoint
│   │   ├── auth/
│   │   │   ├── login/route.js        # Auth Login & JWT Cookie Issuer
│   │   │   ├── logout/route.js       # Auth Logout Endpoint
│   │   │   └── me/route.js           # Session Verification Endpoint
│   │   ├── exceptions/               # Exception Resolution & Audit Route
│   │   ├── export/route.js           # CSV/JSON Data Exporter
│   │   ├── reconciliation/route.js   # Manual & Auto Engine Execution Route
│   │   ├── settings/route.js         # Configuration Management Route
│   │   ├── simulate/route.js         # Anomaly Injection Sandbox Route
│   │   ├── transactions/route.js     # Ledger Queries Route
│   │   └── webhooks/razorpay/route.js # Gateway Event Ingestion Route
│   ├── globals.css                   # Theme Tokens, Animations & Glassmorphism
│   ├── layout.js                     # Root Application Shell & Theme Provider
│   └── page.js                       # Landing & Authentication Page
├── components/                       # UI Subsystems
│   ├── Header.jsx                    # Top Navigation Bar & Action Triggers
│   ├── Sidebar.jsx                   # Collapsible Left Navigation Bar
│   └── ThemeProvider.jsx             # Color Scheme Context Provider
├── docs/                             # Project Technical Documentation
├── lib/                              # Core Domain Engine
│   ├── ai/
│   │   └── investigate.js            # Gemini AI Fact-Based Prompt Generator
│   ├── reconciliation/
│   │   └── engine.js                 # 100% Deterministic Matching Logic
│   └── utils.js                      # Tailwind Merging & Helper Functions
├── prisma/                           # Database Architecture
│   ├── schema.prisma                 # Schema Model Definitions
│   └── seed.js                       # Seed Data Generator
├── scripts/                          # System Utilities
│   ├── generate-demo-data.js         # Synthetic Dataset Generator
│   ├── simulate-webhook.js           # Gateway Webhook Payload Simulator
│   └── test-reconciliation.js        # CLI Verification Script
├── middleware.js                     # Edge Security & JWT Authentication Interceptor
├── next.config.mjs                   # Next.js Build & Runtime Configuration
└── package.json                      # Project Dependencies & NPM Scripts
```

---

## 2.4 Security & Authentication Workflow
1. **Edge Interception**: `middleware.js` inspects every incoming HTTP request (except public routes `/`, `/api/auth/*`, `/api/webhooks/*`).
2. **Token Verification**: Reads `auth_token` from HTTP-Only cookie and verifies signature using `jose.jwtVerify`.
3. **Session Rejection**: If invalid or expired, immediately redirects user to `/` login and clears cookie.
