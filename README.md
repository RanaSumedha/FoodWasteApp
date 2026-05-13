# 🍛 FoodBridge — Food Waste to Hunger Solution

A full-stack MERN web application connecting restaurants with surplus food to NGOs and volunteers.

## Tech Stack

- **MongoDB** — database with geospatial indexes
- **Express.js** — REST API (port 5000)
- **React 18 + Vite** — frontend SPA (port 3000)
- **Node.js** — backend runtime
- **JWT** — authentication (bcryptjs + jsonwebtoken)
- **Leaflet / OpenStreetMap** — interactive map (no API key needed)
- **Zustand** — client state management
- **node-cron** — background expiry jobs
- **multer** — photo uploads

---

## Setup (Windows / Mac / Linux)

### Step 1 — Install Node.js (one time only)

Download and install from: https://nodejs.org (choose LTS version)

Verify installation:
```
node -v
npm -v
```

### Step 2 — Extract / Clone the project

**From zip:** Extract to any folder, e.g. `C:\Projects\foodbridge`

**From GitHub:**
```
git clone https://github.com/bhavyagupta31/foodbridge.git
cd foodbridge
```

### Step 3 — Create environment files

**Create `server/.env`** with the following content:
```
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster.mongodb.net/food-waste-hunger
JWT_SECRET=any_long_random_string_here
OPENCAGE_API_KEY=optional_for_address_search
PORT=5000
```

**Create `client/.env`** with the following content:
```
VITE_API_BASE_URL=http://localhost:5000
```

> For `MONGODB_URI`, create a free cluster at https://www.mongodb.com/atlas
> - Sign up → Create free M0 cluster → Database Access → Add user
> - Network Access → Allow from anywhere (0.0.0.0/0)
> - Connect → Drivers → copy the connection string
> - Replace `<password>` with your user's password

### Step 4 — Install dependencies

Run this once from the project root folder:
```
npm run install:all
```

### Step 5 — Run the app

Open **two** terminal / command prompt windows in the project folder:

**Terminal 1 — Backend (port 5000):**
```
npm run dev:server
```
Wait for: `✅ Connected to MongoDB` and `Server running on port 5000`

**Terminal 2 — Frontend (port 3000):**
```
npm run dev:client
```
Wait for: `Local: http://localhost:3000`

### Step 6 — Open in browser

Go to: **http://localhost:3000**

---

## User Roles

| Role | What they can do |
|------|-----------------|
| Restaurant | Post surplus food listings with photos and expiry time |
| NGO | Browse map, claim food, schedule pickups |
| Volunteer | Same as NGO |
| Admin | Manage users, moderate listings and ratings |

## Features

- Interactive map with food listings (Leaflet / OpenStreetMap)
- Real-time in-app notifications for nearby food
- Pickup scheduling with time slot validation
- Expiry countdown timers with urgency indicators
- Auto-expiry background job (cron)
- Mutual rating system after completed pickups
- Impact statistics (kg rescued, pickups completed)
- Admin dashboard with full moderation controls
- Photo uploads for food listings
- GPS location detection

## Ports

| Service | Port |
|---------|------|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
