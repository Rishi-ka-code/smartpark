# 🅿️ SMARTPARK — Smart Parking Finder & Reservation Platform

A production-quality full-stack smart parking platform with real-time slot management, intelligent parking recommendations, interactive parking maps, and seamless booking flows. Designed for malls, airports, universities, and smart-city systems.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?logo=socket.io)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss)

---

## ✨ Features

### For Users
- 🗺️ **Interactive Parking Map** — Real-time SVG parking map with live slot status updates
- 🔍 **Smart Recommendations** — Intelligent slot matching based on proximity, availability, and congestion
- 📱 **Instant Reservations** — Book your parking slot before you arrive
- 🧭 **Walking Navigation** — Get route directions to your reserved slot
- 📋 **Booking History** — View past and current reservations
- 🔔 **Real-time Updates** — Live slot availability via WebSocket

### For Admins
- 📊 **Analytics Dashboard** — Occupancy rates, peak hours, zone statistics
- 🏗️ **Slot Management** — Add, remove, and update parking slots
- 📑 **Booking Management** — View and manage all bookings
- 📈 **Daily Reports** — Revenue and occupancy reports

### Technical
- 🔐 **JWT Authentication** — Secure signup/login with role-based access
- ⚡ **WebSocket Real-time** — Socket.io for live updates
- 🧠 **Hidden Intelligence** — Graph-based algorithms for optimal recommendations (invisible to users)
- 🎨 **Modern UI** — Dark theme, smooth animations, responsive design

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS 3, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Real-time** | Socket.io |
| **Auth** | JWT + bcryptjs |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |

---

## 📁 Project Structure

```
smartpark/
├── README.md
├── backend/
│   ├── package.json
│   ├── .env
│   ├── server.js                  # Express + Socket.io entry
│   ├── models/
│   │   ├── User.js                # User model with auth
│   │   ├── ParkingArea.js         # Parking zones/areas
│   │   ├── ParkingSlot.js         # Individual slots
│   │   ├── Booking.js             # Reservation records
│   │   └── Analytics.js           # Usage analytics
│   ├── controllers/
│   │   ├── authController.js      # Signup, login, profile
│   │   ├── parkingController.js   # Areas, slots, recommendations
│   │   ├── bookingController.js   # Reserve, cancel, complete
│   │   ├── navigationController.js # Route calculation
│   │   ├── analyticsController.js # Statistics & reports
│   │   └── adminController.js     # Admin operations
│   ├── routes/
│   │   ├── auth.js
│   │   ├── parking.js
│   │   ├── booking.js
│   │   ├── navigation.js
│   │   ├── analytics.js
│   │   └── admin.js
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & role check
│   │   ├── errorHandler.js        # Global error handling
│   │   └── validate.js            # Request validation
│   ├── algorithms/                # 🧠 Hidden intelligence layer
│   │   ├── graph.js               # Graph construction
│   │   ├── slotRecommendation.js  # Nearest slot finder
│   │   ├── routeOptimizer.js      # Shortest path calculator
│   │   └── priorityManager.js     # Slot scoring & ranking
│   ├── services/
│   │   ├── parkingService.js      # Parking business logic
│   │   ├── bookingService.js      # Booking business logic
│   │   ├── analyticsService.js    # Analytics aggregation
│   │   └── socketService.js       # Real-time event emission
│   └── seed/
│       └── seeder.js              # Database seed (200+ slots)
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/
        │   ├── AuthContext.jsx     # Authentication state
        │   ├── ParkingContext.jsx  # Parking data & socket
        │   └── BookingContext.jsx  # Booking state
        ├── services/
        │   ├── api.js             # Axios instance
        │   └── socket.js          # Socket.io client
        ├── pages/
        │   ├── LandingPage.jsx    # Hero + features + stats
        │   ├── LoginPage.jsx      # Authentication
        │   ├── SignupPage.jsx     # Registration
        │   ├── DashboardPage.jsx  # Map-first parking view
        │   ├── HistoryPage.jsx    # Booking history
        │   └── AdminPage.jsx     # Admin management
        └── components/
            ├── Navbar.jsx         # Landing navigation
            ├── ParkingMap.jsx     # Interactive SVG map
            ├── SlotTooltip.jsx    # Slot hover info
            ├── RecommendationCard.jsx
            ├── BookingCard.jsx
            ├── StatsBar.jsx
            ├── LoadingSkeleton.jsx
            ├── EmptyState.jsx
            ├── ProtectedRoute.jsx
            └── AnimatedCounter.jsx
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ — [Download](https://nodejs.org/)
- **MongoDB** 6+ — [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)

### 1. Clone & Install

```bash
# Navigate to the project
cd smartpark

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

The backend `.env` file is pre-configured for local development:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartpark
JWT_SECRET=smartpark_jwt_secret_key_2024
```

Update `MONGODB_URI` if using MongoDB Atlas or a different connection string.

### 3. Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Or run directly
mongod --dbpath /path/to/data
```

### 4. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- 👤 **Admin user**: `admin@smartpark.com` / `admin123`
- 👤 **Regular user**: `user@smartpark.com` / `user123`
- 🅿️ **4 Parking Areas** (Zones A–D)
- 🏷️ **200+ Parking Slots** with realistic statuses
- 📋 **20 Sample Bookings**
- 📊 **7 days of Analytics data**

### 5. Start the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

### 6. Open in Browser

Navigate to **http://localhost:3000**

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

### Parking
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/parking` | Get all parking areas | ❌ |
| GET | `/api/parking/slots` | Get slots (filter: zone, floor, status) | ❌ |
| GET | `/api/parking/recommended-slot` | Get smart recommendation | ✅ |
| PUT | `/api/parking/slot-status/:id` | Update slot status | 🔒 Admin |

### Bookings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/booking/reserve` | Reserve a slot | ✅ |
| GET | `/api/booking/history` | Get booking history | ✅ |
| PUT | `/api/booking/cancel/:id` | Cancel a booking | ✅ |
| PUT | `/api/booking/complete/:id` | Complete a booking | ✅ |

### Navigation
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/navigation/:slotId` | Get route to slot | ✅ |

### Analytics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analytics` | Dashboard statistics | 🔒 Admin |
| GET | `/api/analytics/occupancy` | Current occupancy | ❌ |
| GET | `/api/analytics/peak-hours` | Peak hour analysis | 🔒 Admin |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/bookings` | All bookings | 🔒 Admin |
| POST | `/api/admin/slot` | Add parking slot | 🔒 Admin |
| DELETE | `/api/admin/slot/:id` | Remove parking slot | 🔒 Admin |
| PUT | `/api/admin/area/:id` | Update parking area | 🔒 Admin |
| GET | `/api/admin/report` | Daily report | 🔒 Admin |

---

## 🔄 Real-time Events (Socket.io)

| Event | Direction | Description |
|-------|-----------|-------------|
| `slot_update` | Server → Client | Slot status changed |
| `booking_update` | Server → Client | New booking or status change |
| `stats_update` | Server → Client | Occupancy stats updated |

---

## 🧠 Architecture Notes

The backend uses a hidden intelligence layer (`algorithms/`) that implements:
- **Graph-based parking model** — Slots are nodes, walkways are edges
- **Optimal slot recommendation** — Priority-weighted scoring based on distance, congestion, floor, and position
- **Route optimization** — Shortest path from entry gate to recommended slot
- **Dynamic occupancy management** — Real-time availability tracking

These algorithms operate transparently — users only see recommendations, distances, and routes without any technical implementation details.

---

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/smartpark` |
| `JWT_SECRET` | JWT signing secret | `smartpark_jwt_secret_key_2024` |

---

## 🎨 Design Philosophy

- **Dark theme** with emerald/teal accent colors
- **Map-first interface** — the parking map is the centerpiece
- **Micro-animations** via Framer Motion for premium feel
- **Glassmorphism** for overlays and panels
- **Responsive** — works on desktop and mobile
- Inspired by Google Maps, Tesla navigation, and Apple design language

---

## 📄 License

This project is built for educational and demonstration purposes.
