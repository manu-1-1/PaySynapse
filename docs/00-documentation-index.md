# PaySynapse Documentation Master Index

Welcome to the comprehensive technical documentation for **PaySynapse** — the Autonomous Financial Reconciliation & Exception Intelligence Engine.

This documentation suite is organized sequentially into numbered modules for maximum clarity and ease of navigation.

---

## Documentation Modules

1. [01 — Project Overview](file:///d:/Projects/PaySynapse/docs/01-project-overview.md)
   * Core Problem & Business Context
   * Executive Summary & Platform Purpose
   * Primary Capabilities & Key Differentiators
   * Financial Audit & Compliance Guarantees

2. [02 — Architecture & Tech Stack](file:///d:/Projects/PaySynapse/docs/02-architecture-and-tech-stack.md)
   * High-Level System Architecture & Flow Diagram
   * Technology Stack (Next.js 16, React 19, Prisma, Tailwind v4, Google Gemini AI)
   * Directory & Repository Structure Breakdown
   * Security, JWT Authentication & Middleware

3. [03 — Database Schema & Data Models](file:///d:/Projects/PaySynapse/docs/03-database-schema-and-models.md)
   * Entity-Relationship Model (ERD)
   * Comprehensive Schema Definitions (User, Merchant, Order, Payment, Fee, Refund, Settlement, BankTransaction, Reconciliation, Exception, WebhookEvent, AuditLog, Setting)
   * Data Types, Indexes, Constraints & Relations

4. [04 — Deterministic Reconciliation Engine](file:///d:/Projects/PaySynapse/docs/04-reconciliation-engine.md)
   * 5-Point Node Matching Methodology
   * Mathematical Formulas (Expected vs Actual Settlement)
   * Exception Types & Classification Rules (STATUS_MISMATCH, FEE_MISMATCH, MISSING_REFUND, REFUND_MISMATCH, MISSING_SETTLEMENT, AMOUNT_MISMATCH, DELAYED_SETTLEMENT, DUPLICATE_TRANSACTION, ORPHAN_BANK_TRANSACTION)
   * Ledger Audit Logging & State Transitions

5. [05 — AI Copilot & Gemini Investigation Engine](file:///d:/Projects/PaySynapse/docs/05-ai-copilot-and-gemini.md)
   * Google Gemini 2.5 Flash SDK Integration
   * Structured Fact Ingestion & Anti-Hallucination Guardrails
   * Automated Root Cause Analysis Workflow
   * Natural Language Copilot Chat Engine & Fallbacks

6. [06 — API Routes & Webhook Reference](file:///d:/Projects/PaySynapse/docs/06-api-routes-and-webhooks.md)
   * Authentication Endpoints (`/api/auth`)
   * Transaction & Exception Management APIs (`/api/transactions`, `/api/exceptions`)
   * Reconciliation Trigger & Analytics Endpoints (`/api/reconciliation`, `/api/analytics`)
   * Gemini AI Endpoints (`/api/ai/investigate`, `/api/ai/copilot`)
   * Razorpay Webhook Handler (`/api/webhooks/razorpay`) & Simulation (`/api/simulate`)

7. [07 — User Interface & Components](file:///d:/Projects/PaySynapse/docs/07-ui-pages-and-components.md)
   * Glassmorphic Modern Fintech Design System
   * Layout, Navigation Sidebar & Dynamic Header
   * Page Breakdown: Dashboard Overview, Transactions Ledger, Exception Center, Digital Twin Visualizer, Analytics, AI Copilot, Settings & Login

8. [08 — Setup, Testing & Operational Workflows](file:///d:/Projects/PaySynapse/docs/08-setup-and-workflows.md)
   * Installation & Environment Configuration
   * Seed Data & Synthetic Anomaly Data Generation
   * Webhook Simulation & End-to-End Testing
   * Operations Workflows (Investigating, Resolving, and Dispute Filing)

---

