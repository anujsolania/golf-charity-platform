# ⛳ Golf Charity Subscription Platform

A full-stack MERN subscription platform combining golf performance tracking, charity fundraising, and a monthly prize draw system.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + React Router v7 |
| **Backend** | Node.js + Express.js REST API |
| **Database** | MongoDB Atlas + Mongoose ODM |
| **Auth** | JWT + bcrypt |
| **Payments** | Stripe (test mode, webhook handler included) |
| **File Uploads** | Cloudinary (winner proof images) |
| **Email** | Nodemailer (welcome, subscription, draw results, winner notifications) |
| **Analytics** | Recharts (admin reports) |
| **Styling** | Vanilla CSS + glassmorphism design system |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Backend
cd server
npm install
cp .env.example .env    # ← fill in your credentials

# Frontend
cd ../client
npm install
cp .env.example .env    # ← set VITE_API_URL
```

### 2. Configure Environment Variables

**`server/.env`** — required values:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/golf-charity
JWT_SECRET=your_32_char_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

**`client/.env`**:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the Database

Run this **once** on a fresh database to create the admin account and sample charities:

```bash
cd server
node utils/seed.js
```

**Default Admin Credentials:**
| Field | Value |
|---|---|
| Email | `admin@golfcharity.com` |
| Password | `Admin@123` |

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client && npm run dev
```

---

## ✅ Feature Checklist

### Core Platform
- ✅ User auth (register, login, JWT, bcrypt, profile, password change)
- ✅ Monthly / yearly subscription plans
- ✅ Subscription access control (non-subscribers restricted from protected features)

### Scores
- ✅ Stableford score entry (1–45 range)
- ✅ Rolling 5-score window (oldest auto-replaced)
- ✅ Edit & delete scores
- ✅ Subscription required to manage scores

### Draw Engine
- ✅ Monthly draws using Stableford scores as entry numbers
- ✅ Random mode (pure lottery) + Algorithm mode (score-frequency weighted)
- ✅ Simulation mode before publishing
- ✅ Jackpot rollover if no 5-match winner
- ✅ Prize split: 5-match 40% / 4-match 35% / 3-match 25%
- ✅ Notifications sent to all subscribers on publish

### Charity System
- ✅ Minimum 10% subscription contribution to selected charity
- ✅ Adjustable contribution percentage (slider up to 100%)
- ✅ Independent one-off donations
- ✅ Charity listing with search/filter
- ✅ Charity profile pages
- ✅ Featured charities on homepage

### Winner Verification
- ✅ Winner selects from won draws (smart UX, no manual ID entry)
- ✅ Proof upload to Cloudinary
- ✅ Admin review workflow (Pending → Approved/Rejected → Paid)
- ✅ Email notifications at each stage

### Notifications
- ✅ In-app notification bell with live unread count
- ✅ Real-time polling (30s interval)
- ✅ Mark individual / all as read
- ✅ Triggered on: draw results, win, subscription events

### Admin Panel
- ✅ Overview with live stats (users, revenue, charity, draws, pending claims)
- ✅ User management (search, edit, delete, view scores)
- ✅ Draw management (configure, simulate, publish)
- ✅ Charity management (CRUD, featured toggle)
- ✅ Winner verification (review, approve/reject, mark paid)
- ✅ Reports & analytics (4 Recharts: user growth, prize history, charity breakdown, draw winners)

### Infrastructure
- ✅ Stripe webhook handler (subscription lifecycle events)
- ✅ Email notifications (welcome, subscription, draw results, winner)
- ✅ Mobile-first responsive design
- ✅ SPA routing on Vercel (`client/vercel.json`)
- ✅ Database seeder script (`server/utils/seed.js`)

---

## 🌐 Deployment

### Frontend → Vercel
1. Import the `client/` folder as a new Vercel project
2. Set `VITE_API_URL` to your backend URL in Vercel environment variables
3. The included `vercel.json` handles SPA routing automatically

### Backend → Render (or Railway)
1. Create a new Web Service pointing to the `server/` folder
2. Set all env vars from `server/.env.example`
3. Start command: `node server.js`
4. After deploy, run seed: `node utils/seed.js` (or use Render Shell)

### Database → MongoDB Atlas
1. Create a free M0 cluster
2. Add your IP / `0.0.0.0/0` to the allow list
3. Copy the connection string into `MONGO_URI`

---

## 📁 Project Structure

```
├── client/               # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/   # Navbar, Footer, DashboardLayout (with notification bell), AdminLayout
│   │   ├── context/      # AuthContext (JWT + subscription state)
│   │   ├── pages/
│   │   │   ├── public/   # HomePage, CharitiesPage, HowItWorksPage, PricingPage
│   │   │   ├── auth/     # LoginPage, SignupPage
│   │   │   ├── dashboard/# DashboardPage, ScoresPage, DrawsPage, CharityPage, WinnersPage, SettingsPage
│   │   │   └── admin/    # Overview, Users, Draws, Charities, Winners, Reports
│   │   ├── services/     # Axios API client with JWT interceptor
│   │   └── styles/       # globals.css — full design system
│   └── vercel.json       # SPA routing for Vercel
│
└── server/               # Express.js + MongoDB backend
    ├── config/           # DB connection, Cloudinary setup
    ├── controllers/      # auth, score, draw, subscription, charity, winner, admin, notification
    ├── middleware/        # JWT auth, admin check, subscription guard
    ├── models/           # User, Subscription, Score, Draw, DrawEntry, Charity, CharityContribution, WinnerVerification, Notification
    ├── routes/           # 8 route modules
    ├── services/         # drawEngine, prizePool, emailService
    ├── utils/
    │   └── seed.js       # Database seeder
    └── webhooks/
        └── stripe.webhook.js  # Stripe subscription lifecycle handler
```
