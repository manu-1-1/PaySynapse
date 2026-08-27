# Module 07: User Interface & Components Architecture

## 7.1 Fintech Design System
PaySynapse features an enterprise-grade dark glassmorphism design built using Tailwind CSS v4 and React 19.

Design Characteristics:
* **Dark / Light Glassmorphism**: `backdrop-blur-md bg-slate-900/80 border border-slate-800`.
* **Harmonious Palette**: Slate dark backgrounds (`#090d16`), Indigo primary accents (`#6366f1`), Emerald success indicators (`#10b981`), Amber warnings (`#f59e0b`), Rose critical alerts (`#f43f5e`).
* **Micro-Animations**: Keyframe glow animations, interactive hover scale effects, and animated KPI status pulses.

---

## 7.2 Core Shell Components

### 1. Header Component ([`components/Header.jsx`](file:///d:/Projects/PaySynapse/components/Header.jsx))
Top navigation bar present across all authenticated dashboard views.
* **Run Reconciliation Trigger**: Direct button to launch `POST /api/reconciliation/run`.
* **Simulate Anomaly Sandbox**: Dropdown trigger to inject synthetic exceptions on-the-fly.
* **Notification Feed**: Live popover showing recent exceptions and system events.
* **Theme Switcher**: Dark/Light mode toggle.
* **User Profile & Logout**: Shows current operator avatar and session clear action.

### 2. Sidebar Navigation Component ([`components/Sidebar.jsx`](file:///d:/Projects/PaySynapse/components/Sidebar.jsx))
Collapsible side bar with active route highlighting:
* Dashboard Overview (`/dashboard`)
* Transaction Ledger (`/transactions`)
* Exception Center (`/exceptions`)
* Digital Twin (`/digital-twin`)
* Operations Analytics (`/analytics`)
* AI Copilot (`/copilot`)
* Gateway Integrations (`/integrations`)

---

## 7.3 Dashboard Page Breakdown

### 1. Login & Auth Page ([`app/page.js`](file:///d:/Projects/PaySynapse/app/page.js))
* Sleek glassmorphic card with pre-filled demo login credentials button.
* Authenticates via `POST /api/auth/login` and redirects to `/dashboard`.

### 2. Reconciliation Overview Dashboard ([`app/(dashboard)/dashboard/page.jsx`](file:///d:/Projects/PaySynapse/app/(dashboard)/dashboard/page.jsx))
* **KPI Header Cards**: Total Processed Volume, Global Match Rate (%), Open Exception Financial Impact (₹), Average Settlement Velocity (Days).
* **Live Exception Monitor**: Cards highlighting top open discrepancies with immediate "Investigate with AI" action triggers.
* **Recent Activity Feed**: Real-time log of reconciliation executions and webhook events.

### 3. Transaction Ledger ([`app/(dashboard)/transactions/page.jsx`](file:///d:/Projects/PaySynapse/app/(dashboard)/transactions/page.jsx))
* Searchable table with instant filtering by status (`CAPTURED`, `FAILED`, `REFUNDED`), gateway ID, or customer email.
* Lineage Drawer: Clicking any row opens full lineage details showing Order, Payment, Gateway Fee, Settlement, and Bank UTR.

### 4. Exception Resolution Center ([`app/(dashboard)/exceptions/page.jsx`](file:///d:/Projects/PaySynapse/app/(dashboard)/exceptions/page.jsx))
* Filterable table categorized by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and status (`OPEN`, `INVESTIGATING`, `RESOLVED`).
* Automated Action Modal: File Gateway Dispute, Force Refund Retry, Auto-Reverse Duplicate, or Manual Sign-off.

### 5. Transaction Digital Twin ([`app/(dashboard)/digital-twin/page.jsx`](file:///d:/Projects/PaySynapse/app/(dashboard)/digital-twin/page.jsx))
* Visual 5-stage node graph:
  1. `Order Created` $\rightarrow$ 2. `Payment Captured` $\rightarrow$ 3. `Fees Deducted` $\rightarrow$ 4. `Gateway Settled` $\rightarrow$ 5. `Bank UTR Cleared`.
* Highlights failing or missing nodes in red/amber with detailed tooltip inspection.

### 6. Operations Analytics ([`app/(dashboard)/analytics/page.jsx`](file:///d:/Projects/PaySynapse/app/(dashboard)/analytics/page.jsx))
* Interactive Recharts widgets:
  * **Settlement Velocity Area Chart**: T+0, T+1, T+2, and T+3+ volume distribution.
  * **Exception Category Pie Chart**: Visual breakdown of open discrepancy root causes.
  * **Fee Overcharge Trend Bar Chart**: Gateway fee variance over time.

### 7. AI Copilot Chat ([`app/(dashboard)/copilot/page.jsx`](file:///d:/Projects/PaySynapse/app/(dashboard)/copilot/page.jsx))
* Interactive chat interface powered by Gemini 2.5 Flash.
* Includes suggested prompt pills (*"Show risk exposure"*, *"Summarize delayed settlements"*, *"Audit gateway fees"*).

### 8. Integrations & Settings ([`app/(dashboard)/integrations/page.jsx`](file:///d:/Projects/PaySynapse/app/(dashboard)/integrations/page.jsx))
* Configure Razorpay Test Mode keys (`Key ID`, `Key Secret`).
* Set custom `GEMINI_API_KEY` to enable live AI investigation without editing environment files.
