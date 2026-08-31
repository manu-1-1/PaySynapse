# PaySynapse Development Plan

## Stage 1 — Project Foundation
- Initialize Next.js with JavaScript, Tailwind CSS, shadcn/ui, ESLint.
- Create application shell (`app/`, `components/`, `lib/`, `public/`, `scripts/`, `prisma/`).
- Setup main routes: `/dashboard`, `/transactions`, `/exceptions`, `/digital-twin`, `/analytics`, `/copilot`, `/integrations`.
- Build basic Sidebar and Header components.

## Stage 2 — Database
- Configure Prisma with PostgreSQL.
- Define schema: `Merchant`, `Order`, `Payment`, `Fee`, `Refund`, `Settlement`, `BankTransaction`, `Reconciliation`, `Exception`, `WebhookEvent`, `AuditLog`.
- Create migration and test database connection.
- Create a small seed record.

## Stage 3 — Synthetic Data
- Create `scripts/generate-demo-data.js`.
- Generate 100+ realistic transaction records with both healthy and exception states (Missing settlement, Amount mismatch, etc.).

## Stage 4 — Reconciliation Engine
- Build deterministic reconciliation logic in `lib/reconciliation/`.
- Process payments and check for expected vs actual settlements, duplicates, and timing.
- Implement exception types and calculate match rates.
- Write tests for reconciliation edge cases.

## Stage 5 — Backend APIs
- Expose endpoints in `app/api/`: `/transactions`, `/reconciliation`, `/exceptions`, `/analytics`.
- Ensure all API responses dynamically fetch from the database.

## Stage 6 — Dashboard
- Connect UI to backend APIs on the Overview page.
- Implement KPI cards (Total Transactions, Match Rate, etc.).
- Add Recharts for visualizing transaction volume, exceptions, and financial impact.

## Stage 7 — Transactions
- Build the transaction management table with search, filters, sorting, and pagination.
- Create a transaction detail view showing the full lineage (Order -> Payment -> Fee -> Refund -> Settlement -> Bank Transaction -> Reconciliation).

## Stage 8 — Exceptions
- Create the Exception Center interface displaying financial exceptions.
- Implement filtering and detailed view (Expected vs Actual).
- Allow users to mark exceptions as "Investigating" or "Resolved" with an audit note.

## Stage 9 — Digital Twin
- Build a visual timeline of a transaction's lifecycle (Order -> Payment -> Fee -> Refund -> Settlement -> Bank).
- Visually highlight missing or mismatched states.

## Stage 10 — Razorpay Integration
- Configure Razorpay Test Mode with environment variables.
- Create `/api/webhooks/razorpay` to receive, verify, and store events.
- Update database and trigger reconciliation from webhooks.

## Stage 11 — AI Investigation
- Create `lib/ai/` and `POST /api/ai/investigate`.
- Send structured financial facts to the AI to generate hypotheses and recommended actions without hallucinating numbers.

## Stage 12 — AI Copilot
- Build the AI Copilot chat interface.
- Implement text-to-SQL or text-to-intent querying for natural language insights based strictly on database records.

## Stage 13 — Analytics
- Build advanced operations analytics showing match rates, exception distribution, settlement delays, etc., using real data.

## Stage 14 — Resolution + Audit
- Ensure all important actions (reconciliation executed, exception resolved, etc.) are logged in `AuditLog`.
- Require notes for resolutions and ensure financial exceptions are never deleted.

## Stage 15 — Testing
- End-to-end testing of the complete system: Dashboard, Transactions, Exceptions, Webhooks, AI, and Resolution flows.
- Fix any critical bugs.

## Stage 16 — Final UI Polish
- Improve typography, spacing, tables, loading states, and responsiveness.
- Ensure professional, finance-oriented aesthetics.

## Stage 17 — Buildathon Demo
- Run the full demo flow smoothly without manual database manipulation.
