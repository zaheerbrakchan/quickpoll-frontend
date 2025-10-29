# 🗳️ QuickPoll – Frontend

A real-time polling web application built with **Next.js**, **TypeScript**, and **WebSockets**, enabling users to create, vote, and like polls with live updates.

👉 **Live Demo:** https://quickpoll-frontend-sable.vercel.app/

---

## 🚀 Features

- 🔐 **Authentication:** Register / Login users with JWT-based auth.
- 🗳️ **Create & Vote on Polls:** Users can create polls and vote in real time.
- ❤️ **Like Polls:** Like or unlike polls instantly.
- ⚡ **Real-time Updates:** WebSocket integration ensures polls, likes, and votes update globally without refresh.
- 🌗 **Responsive & Modern UI:** Built with TailwindCSS and Framer Motion for smooth animations.
- 🧭 **Protected Interactions:** Guests can view polls but must log in to interact.

---

## 🧩 System Design Overview

### 🏗️ Architecture

```text
Frontend (Next.js + TypeScript)
│
│  ├── /pages
│  │     ├── index.tsx        # Home page displaying polls
│  │     ├── create.tsx       # Poll creation page
│  │     ├── login.tsx        # User login
│  │     └── register.tsx     # User registration
│  │
│  ├── /components
│  │     ├── PollList.tsx     # Fetches and displays all polls
│  │     ├── PollCard.tsx     # Each poll card with live WebSocket updates
│  │     ├── Navbar.tsx       # Navigation bar with auth buttons
│  │     
│  │
│  ├── /hooks
│  │     └── useAuth.ts       # Custom hook for auth context
│  │
│  ├── /lib
│  │     └── api.ts           # Handles all REST API calls
│  │
│  ├── /styles
│  │     └── globals.css      # Tailwind base styles
│  │
│  ├── .env.local.example     # Environment variable sample
│  └── next.config.js
│

```

### ⚙️ Data Flow

1. **Frontend → Backend (REST):**
   - Auth (`/login`, `/register`)
   - Fetch polls, votes, likes, delete poll

2. **Backend → Frontend (WebSocket):**
   - New poll creation and delete poll broadcast 
   - Live vote & like updates

---

## 🧠 Tech Stack

| Category | Technologies |
|-----------|---------------|
| Framework | Next.js 16 (Turbopack) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Animations | Framer Motion |
| Real-time | WebSocket |
| Hosting | Vercel |
| Auth | JWT (via backend) |

---

## 🛠️ Local Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/quickpoll-frontend.git
cd quickpoll-frontend
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Setup Environment Variables
I didn't kept in .env file as of now as we have less URLS so please find below

on the top of api.ts file in lib folder add base url like below
BASE_URL=https://your-backend-url.onrender.com

in PollCard.tsx and PollList.tsx please replace wsUrl with your ws url
wsUrl=wss://your-backend-url.onrender.com/ws/polls/{id}

in PollList.tsx please replace wsUrl with your ws url
wsUrl=wss://your-backend-url.onrender.com/ws/polls/

```

### 4️⃣ Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) 🎉

### 5️⃣ Build for Production
```bash
npm run build
npm start
```

---

## 🔌 API Reference (Frontend Usage)

| Action | Endpoint | Method |
|--------|-----------|--------|
| Fetch all polls | `/polls` | GET |
| Create poll | `/polls` | POST |
| Vote | `/polls/{poll_id}/vote` | POST |
| Like poll | `/polls/{poll_id}/like` | POST |
| WebSocket stream | `/ws/polls` | WS |

---

## 🌐 Deployment

This frontend is deployed on **Vercel**  
Each push to `main` triggers automatic deployment via GitHub integration.

---



---

## 👨‍💻 Contributors

- [Zaheer Brakchan](https://github.com/zaheerbrakchan)
- Backend + Frontend Integration
- WebSocket & Real-time updates

---
