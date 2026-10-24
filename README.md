# 🛒 BazarPool — Community-Based Wholesale Group-Buying Platform

[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

**BazarPool** is a fullstack community group-buying platform that empowers households, university students, and hostel communities to collectively purchase essential commodities directly from wholesale suppliers and farmers. By aggregating demand to meet bulk wholesale thresholds, consumers save **25%–40%** while suppliers secure guaranteed bulk order commitments.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Layer (Next.js 16 + Tailwind CSS)"]
        UI[Campaign Explorer & Progress Bar]
        AuthUI[Role-Based Portals: Consumer, Supplier, Coordinator]
        WalletUI[Double-Entry Virtual Wallet UI]
        QRScanner[QR Token Pickup Verifier]
    end

    subgraph API["Backend API Layer (Express.js + TypeScript)"]
        Router[RESTful API Router]
        AuthMiddleware[JWT Auth & RBAC Guards]
        ZodValidator[Zod Request Validation]
        
        subgraph Engine["Core Business Engines"]
            CommitEngine["Concurrency-Safe Commitment Engine (Row Locking)"]
            WalletEngine["Double-Entry Ledger & Fund Reservation"]
            ExpiryWorker["Automated Expiry & Idempotent Refund Worker (Cron)"]
            QRVerifier["One-Time Token Redemption Validator"]
        end
    end

    subgraph DB["Database Layer (PostgreSQL + Prisma ORM)"]
        Prisma[(Prisma ORM)]
        UsersTable[(Users & Profiles)]
        CampaignsTable[(Campaigns & Products)]
        CommitmentsTable[(Commitments)]
        WalletLedger[(WalletAccounts & Auditable Ledger)]
        OrdersTable[(Orders & PickupTokens)]
    end

    Client -->|REST API with JWT| API
    Router --> AuthMiddleware --> ZodValidator --> Engine
    Engine --> Prisma --> DB
```

---

## 🌟 Key Engineering Highlights

### 1. Concurrency-Safe Commitments & Race-Condition Defense
- Multi-user race condition protection: When multiple consumers commit for the remaining capacity simultaneously, **Prisma Transactions (`prisma.$transaction`)** ensure total commitments never exceed the campaign's `targetQuantity`.
- Over-subscription prevention at the database level.

### 2. Double-Entry Virtual Wallet & Atomic Reservations
- Follows fintech ledger standards: separate `availableBalance` and `reservedBalance`.
- When placing a commitment, funds are atomically reserved.
- Upon campaign locking, reserved funds are permanently debited.
- If a campaign fails to hit target by deadline, **100% of reserved funds are automatically refunded**.

### 3. Automated Expiry & Idempotent Refund Engine
- A dedicated background worker (`node-cron`) checks for campaigns passing their deadline without meeting target.
- Automatically transitions status: `OPEN` → `EXPIRED` → `REFUNDED`.
- Uses deterministic `idempotencyKey` (`REFUND-<commitmentId>`) to guarantee zero duplicate refunds.

### 4. Cryptographic QR-Code Pickup Verification
- Once a campaign is locked, unique secure tokens (`BP-XXXX-XXXX`) and QR codes are generated.
- Hub Coordinators verify tokens via a dedicated scanner interface. Double redemptions are strictly rejected (`409 Conflict`).

---

## 🚀 Quick Setup & Local Execution

### Prerequisites
- **Node.js** v18+ 
- **PostgreSQL** or **Docker**

### Step 1: Clone & Configure Backend

```bash
cd bazar-pool/backend
npm install
```

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` is set to your PostgreSQL instance (e.g. `postgresql://postgres:postgrespassword@localhost:5432/bazarpool_db?schema=public`).

*(Optional)* If you have Docker installed, start PostgreSQL with one command:
```bash
docker compose up -d
```

Push Prisma schema and seed demo data:
```bash
npx prisma db push
npm run prisma:seed
```

Start the backend server:
```bash
npm run dev
```
> Server runs on **`http://localhost:5000`** (Health check: `/api/v1/health`)

---

### Step 2: Configure & Run Frontend

In a new terminal:
```bash
cd bazar-pool/frontend
npm install
npm run dev
```
> Web application runs on **`http://localhost:3000`**

---

## 🔑 Demo Accounts for Evaluation

| Role | Email | Password | What You Can Test |
| :--- | :--- | :--- | :--- |
| **Consumer** | `consumer@gmail.com` | `password123` | Commit to pools, view wallet, view QR Pickup Passes |
| **Wholesaler** | `supplier@agrofarm.com` | `password123` | Launch wholesale pools, dispatch locked campaigns |
| **Hub Lead** | `coordinator@dhanmondi.com` | `password123` | Verify QR token codes, authorize product handovers |
| **Admin** | `admin@bazarpool.com` | `password123` | Full system metrics, pickup hubs, and audit logs |

---

## 📑 API Endpoint Specification

### Authentication
- `POST /api/v1/auth/register` — Create account with initial simulated wallet balance
- `POST /api/v1/auth/login` — Sign in and receive JWT token
- `GET /api/v1/auth/me` — Retrieve profile & wallet status

### Campaigns & Commitments
- `GET /api/v1/campaigns` — Filter by category, city, and status
- `POST /api/v1/campaigns` — Supplier creates group-buying pool
- `POST /api/v1/commitments/:campaignId` — Atomic commitment with wallet reservation
- `GET /api/v1/commitments/me` — Consumer commitment history and QR passes

### Virtual Wallet
- `GET /api/v1/wallet` — View available & reserved balances and ledger history
- `POST /api/v1/wallet/top-up` — Simulate instant wallet balance top-up

### Fulfillment & Verification
- `POST /api/v1/fulfillment/:campaignId/dispatch` — Mark campaign as dispatched
- `POST /api/v1/fulfillment/:campaignId/arrive-at-hub` — Mark orders ready for pickup
- `POST /api/v1/fulfillment/verify-pickup` — Verify QR token code and record handover

### Notifications
- `GET /api/v1/notifications` — Retrieve consumer/supplier notifications
- `PATCH /api/v1/notifications/:id/read` — Mark notification as read
- `PATCH /api/v1/notifications/read-all` — Mark all notifications as read

### Admin & Operations
- `GET /api/v1/admin/stats` — System analytics, processed volumes, campaign distribution
- `GET /api/v1/admin/hubs` — List active pickup hubs
- `POST /api/v1/admin/hubs` — Register new neighborhood community pickup hub

---

## 🧪 Automated Test Suite

Run the backend test suite:
```bash
cd bazar-pool/backend
npm test
```
Tests cover:
- Concurrency-safe capacity checks & oversubscription prevention
- Double-entry virtual wallet ledger conservation
- Automated expiry refund idempotency
- One-time QR token redemption and double-spending prevention

---

## 👨‍💻 Author & Submission
- **Author:** Mohaimen Hridoy
- **Track:** Fullstack Web Development (Next.js, Express, Prisma, TypeScript, PostgreSQL)
