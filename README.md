# Emotion Journal

A privacy‑focused journaling web app that uses AI to detect emotions from your writing and provides empathetic, personalised feedback. Built with Next.js 15, Prisma, PostgreSQL, and the Groq API.

![Screenshot Placeholder](https://via.placeholder.com/800x400?text=Emotion+Journal+Dashboard)

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Demo Mode](#demo-mode)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

- ✍️ **Write journal entries** – rich text editor with speech‑to‑text voice input (Web Speech API).
- 🤖 **Automatic emotion detection** – powered by Groq (Llama 3.1 8B) to identify emotions like joy, sadness, anxiety, gratitude, etc.
- 💬 **Empathetic AI summaries** – each saved entry receives a warm, validating one‑sentence summary.
- 📊 **Analytics dashboard** – visual breakdown of emotions, frequent topics, and writing frequency using Recharts.
- 🔐 **Authentication** – secure login/signup with NextAuth.js (credentials provider), passwords hashed with bcrypt.
- 🔄 **Password reset** – username‑based flow without email (temporary tokens stored in database).
- ⚙️ **User settings** – change password, delete account.
- 🎨 **Glassmorphic UI** – custom backgrounds, floating cards, and smooth animations.
- 📱 **Responsive design** – works on desktop and mobile devices.
- 🧪 **Demo mode** – one‑click login as `demo_user` to explore the app without registration.

## Tech Stack

| Category          | Technology                                          |
|-------------------|-----------------------------------------------------|
| Framework         | Next.js 15 (App Router, server‑less API routes)    |
| Language          | TypeScript                                          |
| Authentication    | NextAuth.js (Credentials provider)                 |
| Database ORM      | Prisma                                              |
| Database          | PostgreSQL                                          |
| AI / LLM          | Groq API (model: `llama-3.1-8b-instant`)           |
| Styling           | Tailwind CSS + custom glass‑card classes           |
| Charts            | Recharts                                            |
| Icons             | Lucide React                                        |
| Voice input       | Web Speech API (webkitSpeechRecognition)            |
| Password hashing  | bcryptjs                                            |
| Data validation   | Zod                                                 |

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL database (local or cloud, e.g., Neon, Supabase, or Docker)
- A Groq API key – get one free at [console.groq.com](https://console.groq.com)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/emotion-journal.git
   cd emotion-journal
Install dependencies
bash
npm install
Set up environment variables (see next section)
Environment Variables

Create a .env.local file in the project root with the following variables:

env
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/emotion_journal"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"      # generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Groq API
GROQ_API_KEY="your-groq-api-key"

# Optional: for production deployment
# NEXTAUTH_URL="https://your-production-domain.com"
Important: Never commit .env.local to version control.
Database Setup

Run Prisma migrations to create the database schema
bash
npx prisma migrate dev --name init
(Optional) Seed the database with a demo user
You can use the provided keep-alive.js script or create a seed file. For a quick manual insert:
sql
INSERT INTO "User" (id, name, password) 
VALUES ('demo_id', 'demo_user', '$2a$10$...hashed...');
(Use bcrypt to hash demo123456)
Verify the database connection
bash
npx prisma studio
Opens a visual database explorer at http://localhost:5555.
Running the Application

Development mode

bash
npm run dev
Open http://localhost:3000

Production build

bash
npm run build
npm start
Demo Mode

The landing page includes a “Try Demo” button that automatically logs in with the credentials:

Username: demo_user
Password: demo123456
If the demo user does not exist in your database, the button will show an error. Ensure the user is seeded (see Database Setup).

API Endpoints

All endpoints are under /api/ and require authentication (except signup, login, and public routes).

Method	Endpoint	Description
POST	/api/signup	Create a new user
POST	/api/auth/[...nextauth]	NextAuth authentication
GET	/api/journal-entries	Fetch all entries for the logged‑in user
POST	/api/journal-entries	Create a new entry (emotion detection)
GET	/api/journal-entries/[id]	Get a single entry
PUT	/api/journal-entries/[id]	Update an entry (re‑detects emotion)
DELETE	/api/journal-entries/[id]	Delete an entry
GET	/api/analytics	Aggregated stats (emotion counts, topics, frequency)
POST	/api/sentiment-summary	Generate empathetic summary for an entry
POST	/api/reset-password-direct	Reset password using username (no email)
POST	/api/forgot-password	Generate a password reset token and store it
POST	/api/change-password	Change password for authenticated user
POST	/api/delete-account	Permanently delete user account
GET	/api/check-user	Check if a username exists (for reset flow)
POST	/api/demo-login	Alternative demo login endpoint
Project Structure

text
emotion-journal/
├── app/
│   ├── (protected)/                     # Routes requiring authentication
│   │   ├── layout.tsx                   # Protected layout wrapper
│   │   ├── journal/
│   │   │   ├── [id]/page.tsx            # Read‑only view
│   │   │   ├── edit/[id]/page.tsx       # Edit form
│   │   │   ├── new/page.tsx             # New entry form
│   │   │   ├── trends/page.tsx          # Analytics dashboard
│   │   │   └── page.tsx                 # Journal list
│   │   └── settings/page.tsx            # User settings (change password, delete account)
│   ├── api/
│   │   ├── analytics/route.ts
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── change-password/route.ts
│   │   ├── check-user/route.ts
│   │   ├── delete-account/route.ts
│   │   ├── demo-login/route.ts
│   │   ├── forgot-password/route.ts
│   │   ├── journal-entries/
│   │   │   ├── [id]/route.ts
│   │   │   └── route.ts
│   │   ├── reset-password-direct/route.ts
│   │   ├── sentiment-summary/route.ts
│   │   └── signup/route.ts
│   ├── forgot-password/page.tsx
│   ├── login/page.tsx
│   ├── reset-password/page.tsx
│   ├── signup/page.tsx
│   ├── providers.tsx                    # NextAuth client provider
│   ├── layout.tsx                       # Root layout
│   ├── page.tsx                         # Landing page (demo/login/signup)
│   └── globals.css                      # Tailwind + custom animations
├── components/
│   └── VoiceInput.tsx                   # Speech‑to‑text component
├── lib/
│   └── prisma.ts                        # Prisma client singleton
├── prisma/
│   ├── schema.prisma                    # Database models
│   └── migrations/                      # Auto‑generated migration files
├── public/                              # Static assets
├── .env.local                           # Environment variables (not committed)
├── .gitignore
├── next.config.ts
├── package.json
├── keep-alive.js                        # Optional script for keeping the app awake
├── eslint.config.mjs
├── postcss.config.js
└── README.md
Usage Guide

Sign up or use Demo mode.
On the journal list, click “+ Write New Entry”.
Enter a title, optional subject (e.g., Work, Health), and write or speak your entry.
Click “Save Entry” – the AI will analyse the text, detect the primary emotion, and generate a short empathetic summary.
In the journal list, you can:
View the full entry (read‑only) – click the emotion badge to see the stored summary.
Edit the entry – the emotion will be re‑detected on save.
Delete an entry.
Go to “View Trends” to see bar charts (emotion breakdown), pie chart (top topics), and a line chart (writing frequency).
Go to “Settings” to change your password or delete your account.
Troubleshooting

Issue	Solution
prisma: Command not found	Run npx prisma instead, or install globally npm i -g prisma
NEXTAUTH_SECRET missing	Generate a secret: openssl rand -base64 32 and add to .env.local
Groq API returns 401	Check your GROQ_API_KEY and that you have credits at Groq.
Speech recognition not working	Use Chrome, Edge, or Safari (desktop). iOS has limitations.
Demo login fails	Ensure the database has a user with name = 'demo_user'. Seed it.
Error: Cannot find module 'sharp'	Install sharp: npm install sharp (used for image optimisation).
Environment variables not loaded	Restart the dev server after creating .env.local.
404 on API routes	Ensure the API route file exists and exports proper GET/POST handlers.
License

MIT – Free for personal and educational use.

Developed as a final project for CTEC3451 - Development Project.
