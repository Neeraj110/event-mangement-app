# 🎫 Spot — Event Management Platform

A full-stack event management application with ticket booking, Razorpay payments, real-time check-ins via Socket.io, admin dashboard, organizer analytics, and personalized event recommendations.

---

## 📐 Architecture Overview

```
backend/
├── index.ts                  # Express + HTTP server + Socket.io + graceful shutdown
├── config/                   # Database, Redis, Socket.io, Passport OAuth
├── controllers/              # Business logic (8 controllers)
├── middlewares/               # Auth, file upload, validation
├── models/                   # Mongoose schemas (10 models)
├── routes/                   # Express routers (8 route files)
├── schemas/                  # Zod validation schemas
├── types/                    # TypeScript type definitions
└── utils/                    # Cloudinary, caching, cron, mailer, cookies

frontend/
├── app/                      # Next.js pages (admin, events, organizer, etc.)
├── components/               # Reusable UI components
├── lib/                      # API client, TanStack Query hooks, Zustand stores
└── types/                    # Shared TypeScript interfaces
```

---

## 🗄️ Data Models

### User (`models/user.model.ts`)

Stores all user accounts — regular users, organizers, and admins.

| Field          | Type     | Description                                                |
| -------------- | -------- | ---------------------------------------------------------- |
| `name`         | String   | Unique display name                                        |
| `email`        | String   | Unique email address                                       |
| `password`     | String   | Bcrypt-hashed password (optional for OAuth users)          |
| `role`         | Enum     | `"user"`, `"organizer"`, or `"admin"`                      |
| `profileImage` | String   | Avatar URL                                                 |
| `interests`    | String[] | User's event category interests (used for personalization) |
| `isPremium`    | Boolean  | Whether user has an active subscription                    |
| `googleId`     | String   | Google OAuth identifier                                    |
| `githubId`     | String   | GitHub OAuth identifier                                    |
| `refreshToken` | String   | JWT refresh token for session management                   |

**Methods:**

- `generateAccessToken()` — Creates a short-lived JWT access token
- `generateRefreshToken()` — Creates a long-lived JWT refresh token
- `comparePassword(plain)` — Compares plaintext password against bcrypt hash

---

### Event (`models/event.model.ts`)

Stores event listings created by organizers.

| Field         | Type            | Description                                          |
| ------------- | --------------- | ---------------------------------------------------- |
| `title`       | String          | Event title                                          |
| `description` | String          | Full event description                               |
| `category`    | String          | Event category (e.g., "Music", "Tech", "Sports")     |
| `location`    | Object          | `{ city: String, lat: Number, lng: Number }`         |
| `startDate`   | Date            | Event start date/time                                |
| `endDate`     | Date            | Event end date/time                                  |
| `coverImage`  | String          | Cloudinary image URL                                 |
| `price`       | Number          | Ticket price in INR                                  |
| `capacity`    | Number          | Max number of attendees                              |
| `organizerId` | ObjectId → User | Reference to the organizer                           |
| `isPublished` | Boolean         | Whether event is visible to users (default: `false`) |
| `isArchived`  | Boolean         | Auto-set to `true` after event ends (via cron)       |

**Indexes:** `organizerId`, `(category, isPublished)`, `(startDate, isPublished)`, `(isPublished, createdAt)`

---

### Ticket (`models/ticket.model.ts`)

Represents a purchased ticket for an event.

| Field         | Type             | Description                                    |
| ------------- | ---------------- | ---------------------------------------------- |
| `ticketCode`  | String           | Unique alphanumeric code (for QR scanning)     |
| `eventId`     | ObjectId → Event | Which event this ticket is for                 |
| `userId`      | ObjectId → User  | Who purchased the ticket                       |
| `status`      | Enum             | `"valid"`, `"used"`, or `"cancelled"`          |
| `checkedInAt` | Date             | Timestamp when ticket was scanned at the venue |

---

### PaymentTransaction (`models/paymentTransaction.model.ts`)

Records every Razorpay payment for audit and payout tracking.

| Field               | Type             | Description                                        |
| ------------------- | ---------------- | -------------------------------------------------- |
| `razorpayOrderId`   | String           | Razorpay order ID                                  |
| `razorpayPaymentId` | String           | Razorpay payment ID (unique)                       |
| `eventId`           | ObjectId → Event | Event the payment is for                           |
| `organizerId`       | ObjectId → User  | Organizer who receives the payment                 |
| `userId`            | ObjectId → User  | User who made the payment                          |
| `amount`            | Number           | Total payment amount                               |
| `quantity`          | Number           | Number of tickets purchased                        |
| `platformFee`       | Number           | Platform's cut from the payment                    |
| `organizerShare`    | Number           | Amount owed to the organizer                       |
| `status`            | Enum             | `"created"`, `"success"`, `"failed"`, `"refunded"` |

---

### Payout (`models/payout.model.ts`)

Tracks admin-approved payouts to organizers.

| Field         | Type            | Description                           |
| ------------- | --------------- | ------------------------------------- |
| `organizerId` | ObjectId → User | Who is being paid                     |
| `amount`      | Number          | Payout amount                         |
| `periodStart` | Date            | Start of the payout period            |
| `periodEnd`   | Date            | End of the payout period              |
| `status`      | Enum            | `"pending"` or `"paid"`               |
| `paidAt`      | Date            | When the payout was marked as cleared |

---

### CheckIn (`models/checkIn.model.ts`)

Audit log for each ticket scan at an event venue.

| Field       | Type              | Description                      |
| ----------- | ----------------- | -------------------------------- |
| `ticketId`  | ObjectId → Ticket | Which ticket was scanned         |
| `eventId`   | ObjectId → Event  | Which event                      |
| `scannedBy` | ObjectId → User   | Organizer who performed the scan |
| `scannedAt` | Date              | Timestamp of the scan            |

---

### OTP (`models/otp.model.ts`)

Temporary one-time passwords for email verification and password reset.

| Field       | Type   | Description                                   |
| ----------- | ------ | --------------------------------------------- |
| `email`     | String | Recipient email                               |
| `otp`       | String | Bcrypt-hashed 6-digit code                    |
| `purpose`   | Enum   | `"signup"` or `"forgot-password"`             |
| `createdAt` | Date   | Auto-expires after **10 minutes** (TTL index) |

**Pre-save hook:** Hashes the OTP with bcrypt before storing.

---

### PendingUser (`models/pendingUser.model.ts`)

Temporary user record created during the OTP signup flow, before email is verified.

| Field       | Type     | Description                                   |
| ----------- | -------- | --------------------------------------------- |
| `name`      | String   | Display name                                  |
| `email`     | String   | Email address                                 |
| `password`  | String   | Bcrypt-hashed password                        |
| `role`      | Enum     | `"user"` or `"organizer"`                     |
| `interests` | String[] | Selected interests                            |
| `createdAt` | Date     | Auto-expires after **15 minutes** (TTL index) |

---

### Subscription (`models/subscription.model.ts`)

User subscription records for premium features.

| Field              | Type            | Description                          |
| ------------------ | --------------- | ------------------------------------ |
| `userId`           | ObjectId → User | Subscriber                           |
| `plan`             | Enum            | `"free"` or `"pro"`                  |
| `status`           | Enum            | `"active"` or `"cancelled"`          |
| `currentPeriodEnd` | Date            | When the current billing period ends |

---

### AnalyticsEvent (`models/analyticsEvent.model.ts`)

Stores analytics/tracking events for future reporting.

---

## 🔐 Authentication & Middleware

### `authMiddleware` (`middlewares/auth.middleware.ts`)

Extracts the JWT access token from the `Authorization: Bearer <token>` header, verifies it, and attaches the full user document to `req.user`. Returns `401` if the token is missing or invalid.

### `optionalAuth` (`middlewares/auth.middleware.ts`)

Same as `authMiddleware`, but **does not block** unauthenticated requests. If a valid token is present, `req.user` is set; otherwise, the request continues with `req.user = undefined`. Used for personalized endpoints that also serve anonymous users.

### `authorizeRoles(...roles)` (`middlewares/auth.middleware.ts`)

Role-based access control. Checks if `req.user.role` is in the allowed roles list. Returns `403 Forbidden` if not authorized.

### `multer.middleware.ts`

Configures Multer for file uploads (event cover images). Files are stored temporarily on disk before being uploaded to Cloudinary.

### `validateResource` (`middlewares/validateResource.ts`)

Generic Zod schema validator middleware. Validates `req.body`, `req.query`, or `req.params` against a provided Zod schema.

---

## 🔌 API Endpoints

### 👤 User Routes — `/api/users`

| Method | Endpoint                | Auth | Description                                                                                                                                              |
| ------ | ----------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/register`             | ❌   | **Step 1:** Validates input, creates a `PendingUser`, generates 6-digit OTP, sends verification email via Nodemailer. Does NOT create the real user yet. |
| `POST` | `/verify-otp`           | ❌   | **Step 2:** Verifies the OTP, moves `PendingUser` → `User`, generates JWT tokens, sets refresh token cookie.                                             |
| `POST` | `/resend-otp`           | ❌   | Deletes expired OTPs for the email, generates a new OTP, and resends.                                                                                    |
| `POST` | `/forgot-password`      | ❌   | Looks up user by email, generates OTP (purpose: `"forgot-password"`), sends reset email.                                                                 |
| `POST` | `/reset-password`       | ❌   | Verifies forgot-password OTP, hashes and saves the new password.                                                                                         |
| `POST` | `/login`                | ❌   | Validates email + password, returns JWT access token + refresh token cookie.                                                                             |
| `POST` | `/logout`               | ✅   | Clears the refresh token from DB and cookie.                                                                                                             |
| `POST` | `/refresh`              | ❌   | Reads refresh token from cookie, verifies it, issues a new access token + rotated refresh token.                                                         |
| `GET`  | `/profile`              | ✅   | Returns the authenticated user's profile (excludes password).                                                                                            |
| `PUT`  | `/profile`              | ✅   | Updates name, interests, and/or profile image (Cloudinary upload). Deletes old image from Cloudinary if replaced.                                        |
| `POST` | `/upgrade-to-organizer` | ✅   | Changes the user's role from `"user"` to `"organizer"`. Issues new tokens with updated role.                                                             |
| `GET`  | `/auth/google`          | ❌   | Initiates Google OAuth flow. Accepts `?role=organizer` query param.                                                                                      |
| `GET`  | `/auth/google/callback` | ❌   | Google OAuth callback — creates or links user, issues tokens, redirects to frontend.                                                                     |
| `GET`  | `/auth/github`          | ❌   | Initiates GitHub OAuth flow.                                                                                                                             |
| `GET`  | `/auth/github/callback` | ❌   | GitHub OAuth callback.                                                                                                                                   |

---

### 🎪 Event Routes — `/api/events`

| Method   | Endpoint        | Auth     | Description                                                                                                                                                                                                                                             |
| -------- | --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/`             | ❌       | Lists all published, non-archived events with pagination (`?page=1&limit=10`). Sorted by `startDate DESC`. **Redis cached** (60s).                                                                                                                      |
| `GET`    | `/personalized` | Optional | Returns events sorted by user interest match. If authenticated user has `interests[]`, events matching those categories appear first, followed by remaining events. Falls back to regular listing for anonymous users. **Redis cached** (60s per user). |
| `GET`    | `/:id`          | ❌       | Fetches a single event by ID with populated organizer info. **Redis cached** (120s).                                                                                                                                                                    |
| `POST`   | `/`             | ✅       | Creates a new event. Requires organizer auth. Accepts multipart form with `coverImage` file upload → Cloudinary. Sets `isPublished: false` by default. Invalidates event list caches.                                                                   |
| `PUT`    | `/:id`          | ✅       | Updates an event. Only the owning organizer (or admin) can update. Cannot update past/ongoing events. Handles image replacement on Cloudinary. Invalidates caches.                                                                                      |
| `DELETE` | `/:id`          | ✅       | Deletes an event. Blocked if any active or used tickets exist. Removes Cloudinary image. Invalidates all related caches.                                                                                                                                |

---

### 💳 Payment Routes — `/api/payments`

| Method | Endpoint          | Auth | Description                                                                                                                                                                                                                                                                                                                                      |
| ------ | ----------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST` | `/create-order`   | ✅   | Creates a Razorpay order for ticket purchase. Validates event exists, is published, has capacity. Calculates `platformFee` and `organizerShare`. Creates a `PaymentTransaction` with status `"created"`. Returns `razorpayOrderId` to the frontend for Razorpay checkout.                                                                        |
| `POST` | `/verify-payment` | ✅   | Verifies the Razorpay payment signature using HMAC-SHA256. **Atomically** decrements event capacity using `findOneAndUpdate` with `$gte` guard to prevent overselling. Creates ticket(s) with unique `ticketCode`s. Updates transaction status to `"success"`. Emits `tickets:update` via Socket.io with remaining capacity. Invalidates caches. |

**Security:**

- Rate limited: 10 requests/minute per IP
- Server-side Razorpay signature verification
- Atomic capacity decrement prevents race conditions
- Payment ID deduplication via unique index

---

### 🎫 Ticket Routes — `/api/tickets`

| Method | Endpoint      | Auth | Description                                                                                                                         |
| ------ | ------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/my-tickets` | ✅   | Returns all tickets owned by the authenticated user, sorted by most recent. Populates event title, cover image, date, and location. |
| `GET`  | `/:id`        | ✅   | Returns a single ticket (only if owned by the requesting user).                                                                     |

---

### 📋 Check-In Routes — `/api/checkin`

| Method | Endpoint          | Auth           | Description                                                                                                                                                                                                 |
| ------ | ----------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/`               | ✅ (Organizer) | Scans a ticket: validates event ownership → validates ticket code → marks ticket as `"used"` → creates `CheckIn` audit record → emits `checkin:update` via Socket.io with live counts → invalidates caches. |
| `GET`  | `/stats/:eventId` | ✅ (Organizer) | Returns check-in statistics: `checkedIn`, `totalSold`, `remaining`, `capacity`, `allCheckedIn`. **Redis cached** (30s).                                                                                     |
| `GET`  | `/logs/:eventId`  | ✅ (Organizer) | Returns the 50 most recent check-in logs with ticket/user details.                                                                                                                                          |

**Real-time Socket.io Payload (`checkin:update`):**

```json
{
  "eventId": "...",
  "checkedIn": 45,
  "totalSold": 100,
  "remaining": 55,
  "capacity": 200,
  "allCheckedIn": false,
  "lastCheckIn": {
    "ticketCode": "ABC123",
    "userName": "John Doe",
    "checkedInAt": "2026-02-23T12:00:00Z"
  }
}
```

---

### 🏢 Organizer Routes — `/api/organizer`

| Method | Endpoint            | Auth           | Description                                                                                                                       |
| ------ | ------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/events`           | ✅ (Organizer) | Lists all events created by the authenticated organizer, sorted by newest first.                                                  |
| `GET`  | `/events/:id/stats` | ✅ (Organizer) | Returns detailed stats for a specific event: tickets sold, revenue, checked-in count, remaining capacity. **Redis cached** (60s). |

---

### 📊 Subscription Routes — `/api/subscriptions`

| Method | Endpoint  | Auth | Description                                                                                                                       |
| ------ | --------- | ---- | --------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/`       | ✅   | Creates a new subscription (plan: `"pro"`, 30-day period). Sets `user.isPremium = true`. Prevents duplicate active subscriptions. |
| `GET`  | `/status` | ✅   | Returns the user's premium status, role, and active subscription details.                                                         |

---

### 🛡️ Admin Routes — `/api/admin`

| Method   | Endpoint              | Auth       | Description                                                                                                                                                                                                                                                            |
| -------- | --------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/check-exists`       | ❌         | Checks if an admin account already exists (only one admin allowed).                                                                                                                                                                                                    |
| `POST`   | `/register`           | ❌         | Registers the first admin account. Blocked if an admin already exists.                                                                                                                                                                                                 |
| `GET`    | `/users`              | ✅ (Admin) | Returns all users (excludes passwords).                                                                                                                                                                                                                                |
| `GET`    | `/events`             | ✅ (Admin) | Returns all events with populated organizer info.                                                                                                                                                                                                                      |
| `DELETE` | `/events/:id`         | ✅ (Admin) | Deletes an event by admin override.                                                                                                                                                                                                                                    |
| `PATCH`  | `/events/:id/publish` | ✅ (Admin) | Toggles event `isPublished` status.                                                                                                                                                                                                                                    |
| `GET`    | `/payments`           | ✅ (Admin) | Returns all payment transactions with populated user/event data.                                                                                                                                                                                                       |
| `GET`    | `/organizer-payments` | ✅ (Admin) | **Aggregated organizer payment summaries.** For each organizer: total earned (from `PaymentTransaction.organizerShare`), total paid (from `Payout` records), remaining balance, and payment status (`fully_paid` / `partially_paid` / `unpaid`). Sorted: unpaid first. |
| `POST`   | `/payouts`            | ✅ (Admin) | **Approve a payout.** Validates organizer exists and has role `"organizer"`. Calculates remaining balance. Blocks if payout amount exceeds remaining. Creates a `Payout` record with `status: "paid"`. Returns updated balance breakdown.                              |

---

## ⚙️ Configuration

### Database (`config/db.ts`)

Connects to MongoDB using Mongoose with the `MONGODB_URI` environment variable.

### Redis (`config/redis.ts`)

Initializes an `ioredis` client for caching. Features:

- Auto-reconnect on connection loss
- Graceful disconnect on server shutdown
- Connects using `REDIS_URL` from environment

### Socket.io (`config/socket.ts`)

Real-time WebSocket server attached to the HTTP server. Features:

- **JWT Authentication** — Clients must pass a valid access token during handshake
- **Event Rooms** — Clients can join `event:<eventId>` rooms to receive live updates
- Events emitted: `checkin:update`, `tickets:update`

### Passport (`config/passport.ts`)

OAuth 2.0 strategies for Google and GitHub login:

- Finds existing users by OAuth ID or email
- Creates new users if not found
- Supports role selection during signup (`?state=organizer`)

---

## 🧰 Utility Functions

### Cache (`utils/cache.ts`)

Generic Redis cache helpers:

| Function                           | Description                                                      |
| ---------------------------------- | ---------------------------------------------------------------- |
| `cacheGet<T>(key)`                 | Retrieves and JSON-parses a cached value                         |
| `cacheSet(key, value, ttlSeconds)` | Stores a JSON-serialized value with TTL                          |
| `cacheDelete(key)`                 | Deletes a single cache entry                                     |
| `cacheDeletePattern(pattern)`      | Deletes all keys matching a glob pattern (e.g., `events:list:*`) |

### Cloudinary (`utils/cloudinary.ts`)

| Function                       | Description                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| `uploadOnCloudinary(filePath)` | Uploads a local file to Cloudinary and returns the secure URL      |
| `deleteOnCloudinary(imageUrl)` | Extracts the public ID from a Cloudinary URL and deletes the asset |

### Mailer (`utils/mailer.ts`)

| Function                            | Description                                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `sendOTPEmail(email, otp, purpose)` | Sends a styled HTML email with a 6-digit OTP code. Supports `"signup"` and `"forgot-password"` templates. Uses Nodemailer with Gmail SMTP. |

### Cookie (`utils/cookie.ts`)

| Function                            | Description                                                      |
| ----------------------------------- | ---------------------------------------------------------------- |
| `setRefreshTokenCookie(res, token)` | Sets an HttpOnly, Secure, SameSite cookie with the refresh token |
| `clearRefreshTokenCookie(res)`      | Clears the refresh token cookie                                  |

### Cron (`utils/cron.ts`)

| Function                  | Description                                                                                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `startEventArchiveCron()` | Runs daily at midnight. Sets `isArchived = true` on events whose `endDate` has passed. Tickets and payment records are preserved for user history. |

---

## 🔒 Security Features

| Feature                        | Implementation                                                   |
| ------------------------------ | ---------------------------------------------------------------- |
| **Rate Limiting**              | Global: 200 req/15min. Payments: 10 req/min. Auth: 20 req/15min  |
| **NoSQL Injection Prevention** | `express-mongo-sanitize` on `req.body` and `req.params`          |
| **Helmet**                     | Sets secure HTTP headers                                         |
| **CORS**                       | Whitelist-based with credentials support                         |
| **JWT Authentication**         | Access tokens (short-lived) + refresh tokens (HttpOnly cookies)  |
| **Password Hashing**           | Bcrypt with salt rounds = 10                                     |
| **OTP Hashing**                | OTPs are bcrypt-hashed before storage                            |
| **Atomic Capacity Checks**     | `findOneAndUpdate` with `$gte` guard prevents ticket overselling |
| **Payment Verification**       | Server-side Razorpay HMAC-SHA256 signature verification          |
| **Graceful Shutdown**          | SIGTERM/SIGINT handlers close HTTP server and Redis connection   |

---

## 🌐 Real-Time Features (Socket.io)

### Connection

Clients connect with a JWT access token:

```js
const socket = io("http://localhost:5000", {
  auth: { token: "your-access-token" },
});
```

### Event Rooms

```js
// Join an event room to receive live updates
socket.emit("join-event", eventId);

// Leave an event room
socket.emit("leave-event", eventId);
```

### Incoming Events

| Event            | When                             | Payload                                                                             |
| ---------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| `checkin:update` | A ticket is scanned at the venue | `{ eventId, checkedIn, totalSold, remaining, capacity, allCheckedIn, lastCheckIn }` |
| `tickets:update` | A ticket purchase is verified    | `{ eventId, remainingCapacity }`                                                    |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (Atlas or local)
- Redis (Cloud or local)
- Razorpay account (for payments)
- Cloudinary account (for image uploads)
- Google & GitHub OAuth credentials (for social login)

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb+srv://...

# Redis
REDIS_URL=redis://default:password@host:port

# JWT
ACCESS_TOKEN_SECRET=your-access-secret
REFRESH_TOKEN_SECRET=your-refresh-secret

# Razorpay
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Email (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Installation

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Tech Stack

| Layer           | Technology                                  |
| --------------- | ------------------------------------------- |
| **Runtime**     | Node.js + TypeScript                        |
| **Framework**   | Express.js                                  |
| **Database**    | MongoDB + Mongoose                          |
| **Cache**       | Redis (ioredis)                             |
| **Real-time**   | Socket.io                                   |
| **Payments**    | Razorpay                                    |
| **Auth**        | JWT + Passport.js (Google, GitHub OAuth)    |
| **File Upload** | Multer + Cloudinary                         |
| **Email**       | Nodemailer                                  |
| **Validation**  | Zod                                         |
| **Security**    | Helmet, CORS, Rate Limiting, Mongo Sanitize |
| **Scheduling**  | node-cron                                   |
| **Frontend**    | Next.js + TanStack Query + Zustand          |

---

## 📄 License

This project is for educational and portfolio purposes.
