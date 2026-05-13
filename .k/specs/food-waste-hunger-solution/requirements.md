# Requirements Document

## Introduction

A web application built on the MERN stack with Firebase integration that connects restaurants with surplus food to NGOs and volunteers who can redistribute it to people in need. Restaurants post available food listings with expiry times and GPS location. Nearby NGOs and volunteers receive real-time alerts, schedule pickups, and rate the experience. The platform aims to reduce food waste while addressing hunger at a city scale.

## Glossary

- **Platform**: The full-stack web application described in this document
- **Restaurant**: A registered business user that uploads surplus food listings
- **NGO**: A registered non-governmental organization user that claims and picks up food
- **Volunteer**: A registered individual user that claims and picks up food on behalf of beneficiaries
- **Listing**: A food availability record created by a Restaurant, including quantity, description, expiry time, and GPS location
- **Claim**: An action by an NGO or Volunteer to reserve a Listing for pickup
- **Pickup**: The physical collection of food associated with a Claim
- **Scheduler**: The subsystem responsible for managing Pickup time slots
- **Notifier**: The subsystem responsible for sending real-time alerts to nearby NGOs and Volunteers
- **Tracker**: The subsystem responsible for GPS-based location services
- **Rating**: A post-Pickup review submitted by either party (Restaurant or NGO/Volunteer)
- **Expiry**: The datetime after which a Listing is no longer available for Claim
- **Auth**: The authentication and authorization subsystem (Firebase Auth)

---

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a Restaurant, NGO, or Volunteer, I want to register and log in securely, so that I can access role-appropriate features of the Platform.

#### Acceptance Criteria

1. THE Auth SHALL support registration with email and password for the roles: Restaurant, NGO, and Volunteer.
2. WHEN a user submits a registration form, THE Auth SHALL validate that the email is unique and the password meets a minimum length of 8 characters.
3. IF a user provides invalid credentials during login, THEN THE Auth SHALL return a descriptive error message without revealing which field is incorrect.
4. WHEN a user successfully authenticates, THE Auth SHALL issue a session token valid for 24 hours.
5. WHILE a session token is expired, THE Platform SHALL redirect the user to the login page on any authenticated request.
6. THE Auth SHALL support Google OAuth as an alternative sign-in method.

---

### Requirement 2: Food Listing Creation

**User Story:** As a Restaurant, I want to upload surplus food availability with details and my location, so that nearby NGOs and Volunteers can find and claim it.

#### Acceptance Criteria

1. WHEN a Restaurant submits a new Listing, THE Platform SHALL record the food name, quantity, unit, description, pickup window start time, and Expiry datetime.
2. THE Tracker SHALL capture the Restaurant's GPS coordinates at the time of Listing creation and associate them with the Listing.
3. IF a Restaurant submits a Listing with an Expiry datetime in the past, THEN THE Platform SHALL reject the Listing and return a validation error.
4. IF a Restaurant submits a Listing with quantity less than or equal to zero, THEN THE Platform SHALL reject the Listing and return a validation error.
5. WHEN a Listing is successfully created, THE Platform SHALL set its status to "available".
6. THE Platform SHALL allow a Restaurant to upload at least one photo per Listing.
7. WHEN a Listing's Expiry datetime is reached, THE Platform SHALL automatically set the Listing status to "expired".

---

### Requirement 3: Real-Time Nearby Alerts

**User Story:** As an NGO or Volunteer, I want to receive real-time alerts when food becomes available near me, so that I can act quickly before it expires.

#### Acceptance Criteria

1. WHEN a new Listing is created, THE Notifier SHALL identify all NGO and Volunteer accounts whose saved location is within a configurable radius (default 10 km) of the Listing's GPS coordinates.
2. WHEN eligible recipients are identified, THE Notifier SHALL deliver an in-app notification to each recipient within 30 seconds of Listing creation.
3. WHERE a user has enabled browser push notifications, THE Notifier SHALL also send a push notification to that user's registered device.
4. THE Notifier SHALL include in each notification: food name, quantity, Restaurant name, distance in kilometers, and time remaining until Expiry.
5. IF the Notifier fails to deliver a notification, THEN THE Notifier SHALL retry delivery up to 3 times with exponential backoff before logging the failure.

---

### Requirement 4: Listing Discovery and Map View

**User Story:** As an NGO or Volunteer, I want to browse and search available food listings on a map, so that I can find the most suitable pickup opportunities near me.

#### Acceptance Criteria

1. THE Platform SHALL display all active Listings on an interactive map using GPS coordinates as markers.
2. WHEN a user applies a distance filter, THE Platform SHALL show only Listings within the specified radius of the user's current or saved location.
3. WHEN a user selects a map marker, THE Platform SHALL display a summary card showing food name, quantity, Restaurant name, distance, and time remaining until Expiry.
4. THE Platform SHALL provide a list view alternative to the map view, sortable by distance and by time remaining until Expiry.
5. WHILE a Listing status is "expired" or "claimed", THE Platform SHALL exclude it from active search results and map markers.

---

### Requirement 5: Pickup Scheduling

**User Story:** As an NGO or Volunteer, I want to schedule a pickup time for a food listing, so that the Restaurant knows when to expect collection.

#### Acceptance Criteria

1. WHEN an NGO or Volunteer claims a Listing, THE Scheduler SHALL record the Claim with the claimant's identity, selected pickup time, and Listing reference.
2. WHEN a Claim is created, THE Platform SHALL set the Listing status to "claimed" and make it unavailable for further Claims.
3. WHEN a Claim is created, THE Notifier SHALL send a confirmation notification to the claimant and an alert notification to the Restaurant containing the claimant's name and scheduled pickup time.
4. THE Scheduler SHALL only allow pickup times within the Listing's defined pickup window and before the Listing's Expiry datetime.
5. IF a claimant attempts to schedule a pickup outside the allowed window, THEN THE Scheduler SHALL reject the request and return a descriptive error.
6. WHEN a claimant cancels a Claim before the scheduled pickup time, THE Platform SHALL set the Listing status back to "available" and notify the Restaurant.

---

### Requirement 6: Expiry Tracking

**User Story:** As a Restaurant, I want the platform to track and surface expiry information prominently, so that food is collected before it goes to waste.

#### Acceptance Criteria

1. THE Platform SHALL display a countdown timer on each Listing card showing time remaining until Expiry.
2. WHEN a Listing has less than 2 hours remaining until Expiry and its status is still "available", THE Notifier SHALL send a reminder alert to all eligible NGOs and Volunteers within the configured radius.
3. WHEN a Listing's Expiry datetime is reached and its status is still "available", THE Platform SHALL set the Listing status to "expired" and notify the creating Restaurant.
4. THE Platform SHALL display Listings with less than 2 hours until Expiry with a visual urgency indicator distinct from standard Listings.
5. THE Platform SHALL allow a Restaurant to extend the Expiry datetime of an "available" Listing by up to 4 hours after the original Expiry.

---

### Requirement 7: Rating System

**User Story:** As a Restaurant or NGO/Volunteer, I want to rate the other party after a completed pickup, so that the community can identify reliable partners.

#### Acceptance Criteria

1. WHEN a Pickup is marked as completed, THE Platform SHALL make a rating prompt available to both the Restaurant and the claimant for 48 hours.
2. THE Platform SHALL accept ratings on a scale of 1 to 5 stars with an optional text comment of up to 500 characters.
3. IF a user attempts to submit more than one rating for the same completed Pickup, THEN THE Platform SHALL reject the duplicate and return an error.
4. THE Platform SHALL display the average rating and total rating count on each Restaurant and NGO/Volunteer profile page.
5. WHEN a new rating is submitted, THE Platform SHALL recalculate and update the recipient's average rating immediately.
6. THE Platform SHALL require a minimum of 3 completed Pickups before displaying a public average rating for any account.

---

### Requirement 8: Pickup Completion and History

**User Story:** As a Restaurant or NGO/Volunteer, I want to mark pickups as completed and view my history, so that I can track impact and maintain accountability.

#### Acceptance Criteria

1. WHEN a claimant arrives for pickup, THE Platform SHALL allow either the Restaurant or the claimant to mark the Pickup as "completed".
2. WHEN a Pickup is marked as "completed", THE Platform SHALL record the completion timestamp and associate it with the Claim.
3. THE Platform SHALL display a history of all past Listings to the Restaurant, including status, claimant name, and completion timestamp.
4. THE Platform SHALL display a history of all past Claims to the NGO or Volunteer, including Listing details, Restaurant name, and completion timestamp.
5. THE Platform SHALL display aggregate impact statistics on each user's profile: total food weight rescued (kg), total Pickups completed, and total Listings created (for Restaurants).

---

### Requirement 9: GPS Location Management

**User Story:** As any user, I want to set and update my location, so that distance calculations and alerts are accurate.

#### Acceptance Criteria

1. WHEN a user grants browser location permission, THE Tracker SHALL use the browser's Geolocation API to populate the user's current coordinates.
2. THE Platform SHALL allow a user to manually enter an address as an alternative to GPS-based location.
3. WHEN a manually entered address is submitted, THE Tracker SHALL geocode the address to GPS coordinates using a geocoding service and store the result.
4. IF the Tracker fails to geocode an address, THEN THE Platform SHALL display a descriptive error and prompt the user to re-enter the address.
5. THE Platform SHALL display the user's currently saved location on their profile settings page.

---

### Requirement 10: Admin Dashboard

**User Story:** As a Platform administrator, I want a dashboard to monitor activity and manage users, so that I can ensure the platform operates safely and effectively.

#### Acceptance Criteria

1. THE Platform SHALL restrict access to the admin dashboard to accounts with the "admin" role.
2. THE Platform SHALL display on the admin dashboard: total active Listings, total Pickups completed today, total registered users by role, and total food weight rescued to date.
3. WHEN an admin deactivates a user account, THE Platform SHALL prevent that account from logging in and hide its Listings from public view.
4. THE Platform SHALL allow an admin to remove any Listing that violates platform guidelines.
5. THE Platform SHALL provide an admin view of all submitted ratings with the ability to remove ratings that violate community standards.
