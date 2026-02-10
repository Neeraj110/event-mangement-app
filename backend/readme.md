# Spot – Backend Architecture & Flow (MERN + TS + Socket.io)

This document defines the complete backend architecture, data models, roles, and runtime flows for the Spot event management platform.

Tech Stack:
- Node.js + Express
- TypeScript
- MongoDB (Mongoose)
- Socket.io
- Redis
- Stripe
- JWT Authentication

Backend is the **source of truth**. Frontend never decides permissions or analytics.

---

## 1. Core Roles (RBAC)

### USER
- Explore events
- View event pages
- Buy tickets
- View own tickets

### ORGANIZER
- Create & manage own events
- View bookings & check-ins for own events
- View real-time analytics for own events

### ADMIN
- Moderate platform
- Manage users & organizers
- Remove fake/scam events
- View platform-wide analytics
- Handle disputes & abuse

Roles are enforced **only on backend**.

---

## 2. Core Models (MongoDB)

### User
- name
- email
- password (hashed)
- role: user | organizer | admin
- isPremium
- interests[]
- location
- createdAt

Used for:
- Auth
- Permissions
- Personalization
- Subscription checks

---

### Event
- title
- description
- category
- location (city, lat, lng)
- startDate / endDate
- coverImage
- organizerId (User ref)
- capacity
- isPublished
- createdAt

Static metadata only.
❌ No analytics stored here.

---

### Ticket
- eventId
- userId
- ticketCode (UUID)
- qrPayload (signed)
- status: valid | used | cancelled
- checkedInAt
- createdAt

Used for:
- QR generation
- Fraud prevention
- Entry validation

---

### CheckIn
- eventId
- ticketId
- scannedBy (organizer)
- scannedAt

Source of truth for:
- Historical analytics
- Audit trails
- Dispute resolution

---

### Subscription
- userId
- plan: free | pro
- stripeCustomerId
- stripeSubscriptionId
- status
- currentPeriodEnd

Used for:
- Feature gating
- Analytics access
- Monetization

---

### AnalyticsEvent (optional but powerful)
- eventId
- type: view | click | checkin
- userId (optional)
- createdAt

Used for:
- Funnels
- Trends
- Recommendations

---

## 3. Authentication Flow

1. User logs in
2. Backend issues JWT
3. JWT stored in HTTP-only cookie
4. Every protected route:
   - Verify token
   - Attach user to request
   - Check role

❌ Frontend never trusts itself.

---

## 4. Event Creation Flow (Organizer)

1. Organizer submits event data
2. Backend validates with Zod
3. Event saved as `isPublished = false`
4. Organizer publishes event
5. Event becomes visible on Explore

AI suggestions are **pre-save helpers**, not mandatory.

---

## 5. Explore & Discovery Flow

- Public endpoints
- Server-side filtering:
  - category
  - location
  - date
- Views logged as AnalyticsEvent (async)

SEO & discovery depend on backend data quality.

---

## 6. Ticket Purchase Flow

1. User selects event
2. Backend checks capacity
3. Stripe payment intent created
4. On success:
   - Ticket created
   - QR payload generated
5. Ticket returned to user

Payment logic is backend-only.

---

## 7. QR Check-in Flow (Critical)

1. QR scanned at entry
2. Backend validates:
   - ticket exists
   - belongs to event
   - not already used
3. Ticket marked used
4. CheckIn record created
5. Redis counter incremented
6. Socket.io emits update

This flow is atomic. Partial success is not allowed.

---

## 8. Real-time Analytics Architecture

### Why Redis
- MongoDB is slow for live counts
- Redis supports atomic increments

### Flow
- Redis stores live counters
- MongoDB stores history
- Socket.io pushes updates

Example:
- `event:{id}:checkins`
- `event:{id}:views`

---

## 9. Socket.io Usage Rules

- Socket server runs with Express
- One instance
- Room-based:
  - `event:{eventId}`
  - `organizer:{userId}`

Frontend:
- Can only listen
- Cannot emit analytics

---

## 10. Organizer Dashboard Logic

Organizer can see:
- Live check-ins
- Tickets sold
- Event-specific analytics

Organizer CANNOT:
- See other organizers’ data
- Access platform metrics

Access enforced server-side.

---

## 11. Admin Dashboard Logic

Admin can:
- View all events
- Suspend users
- Remove events
- View platform-wide analytics
- Resolve disputes

Admin data is never exposed to organizer APIs.

---

## 12. Failure & Fallback Strategy

If Redis fails:
- System continues
- Real-time updates paused
- Data still saved in MongoDB

System degrades gracefully, never crashes.

---

## 13. What Backend Never Does

- UI decisions
- Trust frontend analytics
- Store counters in MongoDB
- Mix roles in one permission layer

---

## 14. Guiding Principle

Backend decides:
- Who can do what
- What data is visible
- What is real vs fake
- What is counted

Frontend only renders.

---

End of backend architecture.
