# Module 06: API Routes & Webhooks Reference

PaySynapse provides a complete RESTful API suite designed for Next.js App Router endpoints.

---

## 6.1 Authentication Endpoints (`/api/auth`)

### `POST /api/auth/login`
* **Purpose**: Authenticate operator credentials and issue a signed JWT cookie.
* **Payload**: `{ "email": "ops@demo.paysynapse.com", "password": "password123" }`
* **Response**: `{ "success": true, "user": { "id": "...", "email": "...", "name": "...", "role": "..." } }`
* **Side Effect**: Sets HTTP-Only cookie `auth_token` valid for 24 hours.

### `POST /api/auth/logout`
* **Purpose**: Terminate active operator session.
* **Response**: `{ "success": true }`
* **Side Effect**: Clears `auth_token` cookie.

### `GET /api/auth/me`
* **Purpose**: Return profile of currently authenticated user session.
* **Response**: User object or `{ "authenticated": false }`.

---

## 6.2 Transaction & Exception Management APIs

### `GET /api/transactions`
* **Purpose**: Query paginated payment transactions with search, filter, and lineage data.
* **Query Parameters**: `search`, `status`, `page`, `limit`.
* **Response**: `{ "transactions": [...], "pagination": { "total": 120, "page": 1, "pages": 12 } }`

### `GET /api/transactions/[id]`
* **Purpose**: Fetch full 5-stage digital twin node lineage for a single transaction.
* **Response**: Includes Order, Payment, Fees, Refunds, Settlements, BankTransactions, Reconciliation, and Exceptions.

### `GET /api/exceptions`
* **Purpose**: List financial exceptions.
* **Query Parameters**: `status` (`OPEN`, `INVESTIGATING`, `RESOLVED`, `OBSOLETE`), `severity`, `type`.
* **Response**: `{ "exceptions": [...] }`

### `POST /api/exceptions/[id]/resolve`
* **Purpose**: One-click or autonomous resolution of an exception.
* **Payload**: `{ "action": "FORCE_RETRY" | "FILE_DISPUTE" | "AUTO_REVERSE" | "MARK_RESOLVED", "notes": "Resolved after gateway verification" }`
* **Response**: `{ "success": true, "exception": {...} }`
* **Side Effect**: Writes `EXCEPTION_RESOLVED` entry to `AuditLog`.

---

## 6.3 Reconciliation & Analytics APIs

### `POST /api/reconciliation/run`
* **Purpose**: Trigger automated 100% deterministic matching across all stored ledger records.
* **Response**: `{ "processed": 120, "matched": 105, "exceptions": 15, "matchRate": "87.50%" }`

### `GET /api/analytics`
* **Purpose**: Provide aggregated metrics for operations dashboard and charts.
* **Response**: Includes Total Volume, Global Match Rate, Open Exception Financial Impact, Settlement Velocity Breakdown, and Exception Type Distribution.

---

## 6.4 AI Investigation Endpoints (`/api/ai`)

### `POST /api/ai/investigate`
* **Purpose**: Trigger Gemini 2.5 Flash root-cause analysis on a specific exception.
* **Payload**: `{ "exceptionId": "uuid-string" }`
* **Response**: `{ "explanation": "...", "confidence": 0.95, "recommendedAction": "..." }`

### `POST /api/ai/copilot`
* **Purpose**: Conversational AI query interface.
* **Payload**: `{ "message": "What is our risk exposure today?" }`
* **Response**: `{ "response": "We currently have 15 open exceptions...", "mocked": false }`

---

## 6.5 Webhook Handlers & Sandbox Simulation

### `POST /api/webhooks/razorpay`
* **Purpose**: Ingest live Razorpay payment and settlement webhooks.
* **Headers**: `X-Razorpay-Signature`, `X-Razorpay-Event-Id`.
* **Events Handled**: `payment.captured`, `payment.failed`, `refund.processed`, `settlement.processed`.
* **Side Effect**: Verifies idempotency via `WebhookEvent`, updates `Payment` status, and triggers `reconcilePayment()`.

### `POST /api/simulate/anomaly`
* **Purpose**: Inject synthetic financial anomalies for testing platform response.
* **Payload Options**:
  * `MISSING_SETTLEMENT`: Drops settlement record for captured payment.
  * `FEE_OVERCHARGE`: Increases gateway fee amount by ₹50.
  * `STATUS_MISMATCH`: Marks payment as FAILED while retaining settlement.
* **Response**: `{ "success": true, "paymentId": "...", "exceptionCreated": "..." }`
