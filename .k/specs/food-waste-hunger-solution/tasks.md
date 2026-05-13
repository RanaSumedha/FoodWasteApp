# Implementation Plan: Food Waste to Hunger Solution

## Overview

Full MERN + Firebase web application. Tasks are ordered to build the foundation first (project setup, auth, data models), then core features (listings, claims, notifications), then supporting features (ratings, history, admin), and finally integration and wiring.

## Tasks

- [x] 1. Project scaffolding and configuration
  - Scaffold client with `npm create vite@latest client -- --template react` and install dependencies: react-router-dom, zustand, axios, leaflet, react-leaflet, firebase
  - Scaffold server with `npm init` and install: express, mongoose, firebase-admin, node-cron, cors, dotenv, fast-check, jest, supertest
  - Create `.env` files for client and server with placeholders for MongoDB URI, Firebase config, OpenCage API key, and FCM credentials
  - Set up `jest.config.js` for server and `vitest.config.js` for client
  - Configure ESLint and directory structure matching the design's `src/` layout for both client and server
  - _Requirements: all_

- [ ] 2. MongoDB connection and data models
  - [ ] 2.1 Create Mongoose models for User, Listing, Claim, Rating, and Notification
    - Implement all fields, types, and constraints from the design's data models section
    - Add all specified indexes including `2dsphere` on `location` fields, unique compound index on Rating (`claimId` + `raterId`), and remaining indexes
    - _Requirements: 1.1, 2.1, 5.1, 7.2, 3.4_
  - [ ] 2.2 Write property test for Listing creation round-trip (Property 1)
    - **Property 1: Listing Creation Round-Trip**
    - **Validates: Requirements 2.1, 2.2, 2.5**
  - [ ] 2.3 Write property test for Listing validation rejects invalid inputs (Property 2)
    - **Property 2: Listing Validation Rejects Invalid Inputs**
    - **Validates: Requirements 2.3, 2.4**

- [ ] 3. Firebase Auth integration and auth middleware
  - [ ] 3.1 Initialize Firebase Admin SDK on the server; implement `middleware/auth.js` to verify Firebase ID tokens on every protected route
    - Return `401` for missing or expired tokens
    - _Requirements: 1.4, 1.5_
  - [ ] 3.2 Implement `middleware/roles.js` role guard that checks `req.user.role` against an allowed-roles array and returns `403` if not authorized
    - _Requirements: 10.1_
  - [ ] 3.3 Implement `POST /auth/sync` route that upserts a User document from the Firebase token payload (firebaseUid, email, displayName, role)
    - _Requirements: 1.1_
  - [ ] 3.4 Write property test for expired token rejection (Property 29)
    - **Property 29: Expired Token Rejection**
    - **Validates: Requirements 1.5**
  - [ ] 3.5 Write property test for admin role enforcement (Property 26)
    - **Property 26: Admin Role Enforcement**
    - **Validates: Requirements 10.1**
  - [ ] 3.6 Write property test for password length validation (Property 28)
    - **Property 28: Password Length Validation**
    - **Validates: Requirements 1.2**

- [ ] 4. Client auth layer
  - [ ] 4.1 Initialize Firebase client SDK; implement `useAuth` hook wrapping `onAuthStateChanged`, exposing `user`, `login`, `logout`, `registerWithEmail`, and `loginWithGoogle`
    - _Requirements: 1.1, 1.6_
  - [ ] 4.2 Build `LoginForm` and `RegisterForm` components with role selector (Restaurant / NGO / Volunteer); show descriptive error messages without revealing which field is wrong
    - _Requirements: 1.2, 1.3_
  - [ ] 4.3 Build `OAuthButton` component for Google sign-in using Firebase `signInWithPopup`
    - _Requirements: 1.6_
  - [ ] 4.4 Implement protected route wrapper that redirects unauthenticated users to `/login`; wire into React Router v6 layout
    - _Requirements: 1.5_
  - [ ] 4.5 Write Vitest unit tests for `LoginForm` and `RegisterForm` rendering and validation feedback
    - _Requirements: 1.2, 1.3_

- [ ] 5. Tracker service and GPS location management
  - [ ] 5.1 Implement server `services/tracker.js` with `geocodeAddress(address)` (OpenCage API call returning `[lng, lat]`), `buildNearSphereQuery(lng, lat, radiusKm)`, and `haversineDistance(coord1, coord2)` helpers
    - Throw typed `GeocodingError` on failure; return 422 from route handler
    - _Requirements: 9.3, 9.4_
  - [ ] 5.2 Implement `PATCH /users/:id/location` route: accept GPS coordinates or address string; geocode address if provided; store GeoJSON Point on User document; return 422 with user-facing message on geocoding failure
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [ ] 5.3 Implement `useGeolocation` hook on the client using `navigator.geolocation.getCurrentPosition`; call `PATCH /users/:id/location` with the result
    - _Requirements: 9.1_
  - [ ] 5.4 Write property test for geocoding round-trip (Property 24)
    - **Property 24: Geocoding Round-Trip**
    - **Validates: Requirements 9.3, 9.5**
  - [ ] 5.5 Write property test for geocoding error propagation (Property 25)
    - **Property 25: Geocoding Error Propagation**
    - **Validates: Requirements 9.4**
  - [ ] 5.6 Write property test for proximity query correctness (Property 4)
    - **Property 4: Proximity Query Correctness**
    - **Validates: Requirements 3.1**

- [ ] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Food listing CRUD
  - [ ] 7.1 Implement `POST /listings` route (Restaurant only): validate all required fields, reject past expiry and quantity ≤ 0 with 400 errors, capture GPS from request body, set status to "available", save Listing document
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ] 7.2 Implement photo upload to Firebase Storage: accept multipart form data on listing creation, store download URLs in `photoUrls` array
    - _Requirements: 2.6_
  - [ ] 7.3 Implement `GET /listings` route with optional `lng`, `lat`, `radius` query params using `$nearSphere`; exclude listings with status other than "available"; exclude listings belonging to deactivated users
    - _Requirements: 4.1, 4.2, 4.5, 10.3_
  - [ ] 7.4 Implement `PATCH /listings/:id` route (Restaurant owner): allow updating fields and extending `expiryAt` by up to 4 hours past original expiry; reject extensions beyond 4 hours with 400
    - _Requirements: 6.5_
  - [ ] 7.5 Implement `DELETE /listings/:id` route (Restaurant owner or Admin)
    - _Requirements: 10.4_
  - [ ] 7.6 Write property test for search filter excludes non-available listings (Property 7)
    - **Property 7: Search Filter Excludes Non-Available Listings**
    - **Validates: Requirements 4.2, 4.5**
  - [ ] 7.7 Write property test for expiry extension validation (Property 15)
    - **Property 15: Expiry Extension Validation**
    - **Validates: Requirements 6.5**

- [ ] 8. Listing UI — map and list views
  - [ ] 8.1 Build `ListingForm` component with fields for food name, quantity, unit, description, pickup window start, expiry datetime, and photo upload; wire to `POST /listings`
    - _Requirements: 2.1, 2.6_
  - [ ] 8.2 Build `ListingMap` component using React-Leaflet with OpenStreetMap tiles; render a marker per active listing; show `ListingCard` summary popup on marker click (food name, quantity, restaurant name, distance, time remaining)
    - _Requirements: 4.1, 4.3_
  - [ ] 8.3 Build `ListingList` component as an alternative list view; implement client-side sort by distance and by time remaining; highlight listings with < 2 hours remaining with a visual urgency indicator
    - _Requirements: 4.4, 6.4_
  - [ ] 8.4 Build `ListingCard` component displaying countdown timer (time remaining until expiry), urgency indicator when < 2 hours remain, and all summary fields
    - _Requirements: 6.1, 6.4_
  - [ ] 8.5 Write property test for list sort order correctness (Property 8)
    - **Property 8: List Sort Order Correctness**
    - **Validates: Requirements 4.4**
  - [ ] 8.6 Write Vitest unit tests for `ListingCard` rendering and countdown timer display
    - _Requirements: 6.1_

- [ ] 9. Notifier service and real-time alerts
  - [ ] 9.1 Implement `services/notifier.js`: `findEligibleRecipients(listing)` queries Users with role NGO or Volunteer whose `location` is within `notificationRadius` km of the listing using `$nearSphere`; `createInAppNotification(recipientId, type, payload)` inserts a Notification document; `dispatchFCM(tokens, payload)` calls Firebase Admin Messaging with exponential backoff (1s, 2s, 4s delays, max 3 retries, log failure after 3rd)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ] 9.2 Wire notifier into `POST /listings`: after successful listing save, call `findEligibleRecipients` and dispatch in-app + push notifications asynchronously (non-fatal)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 9.3 Implement `services/fcm.js` on the client: register FCM token via `getToken`, store token via `PATCH /users/:id` (add to `fcmTokens`), handle foreground messages with `onMessage`
    - _Requirements: 3.3_
  - [ ] 9.4 Build `NotificationBell` and `NotificationItem` components; implement `useNotifications` hook that polls or listens for unread Notification documents for the current user
    - _Requirements: 3.2, 3.4_
  - [ ] 9.5 Write property test for notification delivery completeness (Property 5)
    - **Property 5: Notification Delivery Completeness**
    - **Validates: Requirements 3.2, 3.3, 3.4**
  - [ ] 9.6 Write property test for notification retry on failure (Property 6)
    - **Property 6: Notification Retry on Failure**
    - **Validates: Requirements 3.5**

- [ ] 10. Pickup scheduling (claims)
  - [ ] 10.1 Implement `services/scheduler.js`: `validatePickupTime(scheduledTime, listing)` checks that `scheduledTime` is within `[pickupWindowStart, expiryAt]`; return descriptive error string if invalid
    - _Requirements: 5.4, 5.5_
  - [ ] 10.2 Implement `POST /claims` route (NGO / Volunteer): validate pickup time via scheduler, atomically set listing status to "claimed" (reject with 409 if already claimed), create Claim document, dispatch confirmation notifications to claimant and restaurant
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ] 10.3 Implement `DELETE /claims/:id` route (claimant only): set listing status back to "available", set claim status to "cancelled", notify restaurant
    - _Requirements: 5.6_
  - [ ] 10.4 Implement `PATCH /claims/:id/complete` route: allow only the restaurant owner or claimant; set claim status to "completed", set listing status to "completed", record `completedAt` timestamp; return 403 for any other user
    - _Requirements: 8.1, 8.2_
  - [ ] 10.5 Build `ClaimModal` component: show available pickup time slots within the listing's window, submit claim via `POST /claims`, display confirmation or error
    - _Requirements: 5.1, 5.4, 5.5_
  - [ ] 10.6 Write property test for claim creation round-trip (Property 9)
    - **Property 9: Claim Creation Round-Trip**
    - **Validates: Requirements 5.1**
  - [ ] 10.7 Write property test for claim exclusivity (Property 10)
    - **Property 10: Claim Exclusivity**
    - **Validates: Requirements 5.2**
  - [ ] 10.8 Write property test for claim notifications to both parties (Property 11)
    - **Property 11: Claim Notifications to Both Parties**
    - **Validates: Requirements 5.3**
  - [ ] 10.9 Write property test for pickup window validation (Property 12)
    - **Property 12: Pickup Window Validation**
    - **Validates: Requirements 5.4, 5.5**
  - [ ] 10.10 Write property test for claim cancellation restores listing availability (Property 13)
    - **Property 13: Claim Cancellation Restores Listing Availability**
    - **Validates: Requirements 5.6**
  - [ ] 10.11 Write property test for pickup completion authorization and timestamp (Property 21)
    - **Property 21: Pickup Completion Authorization and Timestamp**
    - **Validates: Requirements 8.1, 8.2**

- [ ] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Expiry tracking — cron jobs
  - [ ] 12.1 Implement `jobs/expiryJob.js` with two cron tasks:
    - Every minute: query listings with `status: "available"` and `expiryAt <= now`; set each to "expired"; create a notification for the creating restaurant; log errors per-listing without aborting the batch
    - Every minute: query listings with `status: "available"` and `expiryAt` between `now` and `now + 2h`; call notifier to send reminder alerts to eligible nearby NGOs and Volunteers
    - _Requirements: 2.7, 6.2, 6.3_
  - [ ] 12.2 Write property test for expiry job marks expired listings (Property 3)
    - **Property 3: Expiry Job Marks Expired Listings**
    - **Validates: Requirements 2.7, 6.3**
  - [ ] 12.3 Write property test for expiry reminder job targets eligible users (Property 14)
    - **Property 14: Expiry Reminder Job Targets Eligible Users**
    - **Validates: Requirements 6.2**

- [ ] 13. Rating system
  - [ ] 13.1 Implement `POST /ratings` route: validate stars in {1–5} and comment ≤ 500 chars; enforce 48-hour window from `completedAt`; reject duplicate (claimId + raterId) with 409; recalculate and update ratee's `averageRating` and `ratingCount` atomically
    - _Requirements: 7.1, 7.2, 7.3, 7.5_
  - [ ] 13.2 Implement `GET /ratings/:userId` route: return ratings list; omit `averageRating` from response if `completedPickups < 3`
    - _Requirements: 7.4, 7.6_
  - [ ] 13.3 Build `RatingPrompt` component: shown to both parties after a pickup is marked complete; submit rating via `POST /ratings`; hide after 48 hours or after submission
    - _Requirements: 7.1, 7.2_
  - [ ] 13.4 Build `StarRating` and `RatingDisplay` components; show average rating and count on profile pages (only when threshold met)
    - _Requirements: 7.4, 7.6_
  - [ ] 13.5 Write property test for rating window enforcement (Property 16)
    - **Property 16: Rating Window Enforcement**
    - **Validates: Requirements 7.1**
  - [ ] 13.6 Write property test for rating input validation (Property 17)
    - **Property 17: Rating Input Validation**
    - **Validates: Requirements 7.2**
  - [ ] 13.7 Write property test for duplicate rating rejection (Property 18)
    - **Property 18: Duplicate Rating Rejection**
    - **Validates: Requirements 7.3**
  - [ ] 13.8 Write property test for average rating correctness (Property 19)
    - **Property 19: Average Rating Correctness**
    - **Validates: Requirements 7.4, 7.5**
  - [ ] 13.9 Write property test for rating threshold enforcement (Property 20)
    - **Property 20: Rating Threshold Enforcement**
    - **Validates: Requirements 7.6**

- [ ] 14. History and impact statistics
  - [ ] 14.1 Implement `GET /users/:id/listings` route (Restaurant): return all past listings with status, claimant name, and `completedAt`
    - _Requirements: 8.3_
  - [ ] 14.2 Implement `GET /users/:id/claims` route (NGO / Volunteer): return all past claims with listing details, restaurant name, and `completedAt`
    - _Requirements: 8.4_
  - [ ] 14.3 On `PATCH /claims/:id/complete`: increment `completedPickups` on both restaurant and claimant; increment `totalWeightRescued` on both using listing quantity; increment `totalListingsCreated` on restaurant at listing creation
    - _Requirements: 8.5_
  - [ ] 14.4 Build `ClaimHistory` component for NGO/Volunteer and listing history view for Restaurant; display completion timestamps and all required fields
    - _Requirements: 8.3, 8.4_
  - [ ] 14.5 Build `ImpactStats` component on `ProfilePage` showing `totalWeightRescued`, `completedPickups`, and `totalListingsCreated`
    - _Requirements: 8.5_
  - [ ] 14.6 Write property test for history completeness (Property 22)
    - **Property 22: History Completeness**
    - **Validates: Requirements 8.3, 8.4**
  - [ ] 14.7 Write property test for impact statistics consistency (Property 23)
    - **Property 23: Impact Statistics Consistency**
    - **Validates: Requirements 8.5**

- [ ] 15. Profile and location settings UI
  - [ ] 15.1 Build `ProfilePage` component: display user info, saved location, `ImpactStats`, `RatingDisplay`, and a link to history; wire `LocationSettings` sub-component to `PATCH /users/:id/location`
    - _Requirements: 9.5, 7.4, 8.5_
  - [ ] 15.2 Build `LocationSettings` component: "Use my location" button (calls `useGeolocation`), manual address input field, display of currently saved location
    - _Requirements: 9.1, 9.2, 9.4, 9.5_

- [ ] 16. Admin dashboard
  - [ ] 16.1 Implement `GET /admin/stats` route (Admin only): return total active listings, total pickups completed today, total registered users by role, and total food weight rescued to date
    - _Requirements: 10.1, 10.2_
  - [ ] 16.2 Implement `PATCH /admin/users/:id` route (Admin only): set `isActive` to false/true; deactivated users cannot authenticate (check `isActive` in auth middleware) and their listings are excluded from public queries
    - _Requirements: 10.3_
  - [ ] 16.3 Implement `DELETE /admin/listings/:id` and `DELETE /admin/ratings/:id` routes (Admin only)
    - _Requirements: 10.4, 10.5_
  - [ ] 16.4 Build `AdminDashboard` page: display stats from `/admin/stats`, `UserTable` with deactivate/reactivate controls, listing moderation table, and ratings moderation table
    - _Requirements: 10.2, 10.3, 10.4, 10.5_
  - [ ] 16.5 Write property test for deactivated user listing exclusion (Property 27)
    - **Property 27: Deactivated User Listing Exclusion**
    - **Validates: Requirements 10.3**

- [ ] 17. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. API service layer and Zustand state wiring (client)
  - [ ] 18.1 Implement `services/api.js`: Axios instance with base URL from env; request interceptor attaches Firebase ID token as `Authorization: Bearer` header; response interceptor redirects to `/login` on 401
    - _Requirements: 1.4, 1.5_
  - [ ] 18.2 Implement `useListings` Zustand store/hook: fetch listings with geo filter, expose `listings`, `fetchListings(lat, lng, radius)`, `createListing`, `claimListing`, `cancelClaim`, `completeClaim`
    - _Requirements: 4.1, 4.2, 5.1, 5.6, 8.1_
  - [ ] 18.3 Wire all pages (`HomePage`, `MapPage`, `ListingDetailPage`, `ProfilePage`, `AdminPage`) to their respective hooks and API calls; ensure role-based UI rendering (e.g., listing creation only for Restaurants, admin page only for admins)
    - _Requirements: 1.1, 10.1_

- [ ] 19. Integration tests
  - [ ] 19.1 Write integration test for full listing → claim → complete → rate flow against local MongoDB with mocked Firebase
    - _Requirements: 2.1, 5.1, 8.1, 7.1_
  - [ ] 19.2 Write integration test for expiry job end-to-end with real MongoDB queries
    - _Requirements: 2.7, 6.3_
  - [ ] 19.3 Write integration test for proximity notification targeting with seeded user locations
    - _Requirements: 3.1, 3.2_
  - [ ] 19.4 Write integration test for admin deactivation hiding listings from search
    - _Requirements: 10.3_

- [ ] 20. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with a minimum of 100 iterations per property
- Unit tests use Jest (server) and Vitest + React Testing Library (client)
- Notification failures are non-fatal and must not roll back listing creation
- All admin routes must be guarded by both `auth.js` and `roles.js` middleware
