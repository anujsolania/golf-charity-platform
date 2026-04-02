# Golf Charity Subscription Platform 🏌️

A full-stack MERN subscription platform combining golf performance tracking, charity fundraising, and a monthly prize draw system.

## Tech Stack
- **MongoDB Atlas** + Mongoose
- **Express.js** + Node.js REST API
- **React 18** + Vite (frontend)
- **Vanilla CSS** with glassmorphism design system
- **JWT** authentication
- **Stripe** payment integration (test mode)
- **Cloudinary** file uploads
- **Nodemailer** email notifications
- **Recharts** admin analytics

## Quick Start

### 1. Server Setup
```bash
cd server
npm install
# Edit .env with your credentials
npm run dev    # runs on http://localhost:5000
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev    # runs on http://localhost:5173
```

### Default Admin Login
- Email: `admin@golfcharity.com`
- Password: `Admin@123`

## Environment Variables

### Server (`server/.env`)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:5000/api
```

## Features
- ✅ User auth (JWT, bcrypt)
- ✅ Monthly/yearly subscription plans
- ✅ Rolling 5-score tracking (Stableford 1–45)
- ✅ Monthly draw engine (random + algorithm modes)
- ✅ 40/35/25% prize pool split with jackpot rollover
- ✅ Charity selection + contribution % slider
- ✅ Winner verification with proof upload
- ✅ Full admin dashboard (users, draws, charities, winners, reports)
- ✅ Recharts analytics
- ✅ Email notifications

## Deployment
- **Frontend**: Vercel (`cd client && npm run build`)
- **Backend**: Render (set env vars, start: `node server.js`)
- **Database**: MongoDB Atlas M0 (free tier)
