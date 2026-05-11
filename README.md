# HKM Prasadam Booking System

Full-stack web application for **Hare Krishna Movement (HKM) Chennai** — Thiruvanmiyur & NLBR centres. Handles public prasadam bookings, party enquiries, internal staff orders, slot management, payments, and admin user management.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Roles & Access Control](#roles--access-control)
- [API Overview](#api-overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Image Upload](#image-upload)
- [Swagger Docs](#swagger-docs)

---

## Project Structure

```
hkm-food/
├── backend/                  # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── config/
│   │   │   └── swagger.ts    # OpenAPI 3.0 config
│   │   ├── models/           # Mongoose models
│   │   │   ├── AdminUser.ts
│   │   │   ├── PrasadamBooking.ts
│   │   │   ├── PartyEnquiry.ts
│   │   │   ├── InternalOrder.ts
│   │   │   ├── SlotDate.ts
│   │   │   ├── MealMenu.ts
│   │   │   ├── Festival.ts
│   │   │   ├── Registration.ts
│   │   │   ├── Settings.ts
│   │   │   └── Counter.ts
│   │   ├── routes/           # Express routers (one per domain)
│   │   ├── middleware/       # requireAuth JWT middleware
│   │   └── server.ts         # App entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                 # Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── page.tsx          # Public booking flow
        │   ├── PaymentPage.tsx   # UPI payment + screenshot upload
        │   ├── internal/         # Staff internal order page
        │   ├── admin/            # Admin shell + all admin pages
        │   │   ├── login/
        │   │   ├── page.tsx      # Admin shell with role-based nav
        │   │   └── components/
        │   │       ├── DashboardPage.tsx
        │   │       ├── RegistrationsPage.tsx
        │   │       ├── PaymentsPage.tsx
        │   │       ├── PartyEnquiriesPage.tsx
        │   │       ├── InternalOrdersPage.tsx
        │   │       ├── SlotManagementPage.tsx  (→ SlotManagementPage.tsx at admin root)
        │   │       ├── SettingsPage.tsx
        │   │       └── AdminUsersPage.tsx
        │   └── _public/          # Public-facing sub-pages
        └── services/             # RTK Query API slices
            ├── api.ts
            ├── adminUsersApi.ts
            ├── prasadamBookingsApi.ts
            ├── partyEnquiriesApi.ts
            ├── internalOrdersApi.ts
            └── ...
```

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (`jsonwebtoken`) + bcryptjs |
| API Docs | swagger-jsdoc + swagger-ui-express |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI Library | MUI v9 (Material UI) |
| State / Data | Redux Toolkit + RTK Query |
| Forms | Controlled components + inline validation |

---

## Features

### Public
- **Prasadam Booking** — select date, location (Thiruvanmiyur / NLBR), meal slots, pay via UPI and upload screenshot
- **My Bookings** — look up bookings/coupons by mobile number
- **Party Enquiries** — submit catering enquiry for events
- **QR Code Coupons** — generated per booking for entry/verification

### Admin Panel (`/admin`)
- **Dashboard** — today's slot summary, key stats
- **Registrations** — view, search, filter all bookings
- **Payments** — approve / decline / flag payment screenshots
- **Slot Management** — configure available dates, meal types, capacity limits per location
- **Party Enquiries** — manage catering requests (accept / decline)
- **Internal Orders** — staff prasadam requests with accept & delivery tracking
- **Settings** — default meal rates, slot limits, booking window rules
- **Admin Users** — create, edit, delete admin accounts with role assignment

### Internal Staff Page (`/internal`)
- Staff can submit internal prasadam orders
- View their own past bookings

---

## Roles & Access Control

Login at `/admin/login`. Role is encoded in the JWT and stored in `localStorage`.

| Role | Pages Accessible |
|---|---|
| `superadmin` | All pages including Admin Users |
| `admin` | Dashboard, Registrations, Payments, Settings, Slots, Party, Internal |
| `accounts_manager` | Payments only |
| `kitchen_manager` | Internal Orders only |
| `gita_counter` | Registrations only |
| `prasadam_hall` | Registrations, Internal Orders |

The first superadmin is seeded automatically from environment variables on first startup if no admin users exist in the database.

---

## API Overview

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Prefix | Description | Auth |
|---|---|---|
| `POST /api/auth/login` | Admin login, returns JWT | Public |
| `/api/admin-users` | CRUD for admin user accounts | Required |
| `/api/prasadam-bookings` | Public booking submission + admin management | Mixed |
| `/api/party-enquiries` | Party catering enquiries | Mixed |
| `/api/internal-orders` | Staff internal prasadam orders | Mixed |
| `/api/slot-dates` | Available slot dates (public read) | Mixed |
| `/api/slot-management` | Full slot config for admin | Required |
| `/api/meal-menus` | Daily meal menu management | Required |
| `/api/festivals` | Festival calendar | Required |
| `/api/dashboard` | Stats for admin dashboard | Required |
| `/api/registrations` | All registrations view | Required |
| `/api/payments` | Payment approval workflow | Required |
| `/api/settings` | Default rates & booking window config | Required |
| `GET /api/health` | Health check | Public |

Full interactive docs: **`http://localhost:5000/api/docs`**

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev                 # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:3000
```

### Seed Initial Superadmin

Set these in `backend/.env` before first startup:

```env
ADMIN_EMAIL=admin@hkmchennai.org
ADMIN_PASSWORD_HASH=<bcrypt hash of your password>
```

The server seeds a superadmin automatically if the `adminusers` collection is empty.

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/hkm_prasadam

# CORS — comma-separated allowed origins
ALLOWED_ORIGINS=http://localhost:3000

# JWT
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Initial superadmin seed (used only when AdminUser collection is empty)
ADMIN_EMAIL=admin@hkmchennai.org
ADMIN_PASSWORD_HASH=<bcrypt hash>
```

---

## Image Upload

Payment proof screenshots are uploaded as **Base64-encoded strings** inside the JSON request body. No separate file upload service is used — the image data is stored directly in the MongoDB booking document.

Flow:
1. User picks an image file in the browser
2. `FileReader.readAsDataURL()` converts it to a Base64 data URL
3. The string is sent as `paymentProof` in the booking JSON payload
4. Stored in MongoDB on the `PrasadamBooking` document

> **Note:** Keep screenshots reasonably sized (< 2 MB recommended) to stay well within MongoDB's 16 MB BSON document limit.

---

## Swagger Docs

The backend serves a full OpenAPI 3.0 interactive UI:

```
http://localhost:5000/api/docs
```

Raw JSON spec:

```
http://localhost:5000/api/docs.json
```

All 13 route files have Swagger JSDoc annotations covering request bodies, path parameters, query parameters, and all response codes.
