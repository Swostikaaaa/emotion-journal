# Emotion Journal

A simple, privacy‑focused journaling web app that helps you track your emotions and reflect on your daily experiences.  
Built with **Next.js, Tailwind CSS, PostgreSQL (Neon), and Prisma**.

## Features

- **Journal entries** – Create, edit, delete, and view your entries.
- **Emotion tracking** – Choose from 19 predefined emotions (or type your own) for each entry.
- **Analytics** – See your emotion breakdown, top subjects, weekly summary, and emotion trends over time.
- **Voice input** – Speak your journal entry using the built‑in microphone (Web Speech API).
- **Export to CSV** – Download all your entries as a CSV file.
- **User accounts** – Secure sign‑up and login with username/password (passwords hashed with bcrypt).
- **Demo mode** – Try the app instantly without creating an account (demo entries are cleared each session).
- **Glassmorphic UI** – Modern, responsive design with blur effects and smooth animations.
- **Live Demo** - https://your-vercel-app-url.vercel.app

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API routes, NextAuth.js (credentials provider)
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Deployment**: Vercel

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+ (recommended 20)
- A PostgreSQL database (e.g., Neon free tier)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Swostikaaaa/emotion-journal.git
   cd emotion-journal
   ```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file with your database URL:
```plaintext
DATABASE_URL="postgresql://..."
```

4. Create a .env.local file with authentication secrets:
```plaintext
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

5. Run database migrations:
```bash
npx prisma migrate dev --name init
```

6. Start the development server:
```bash
npm run dev
```

7. Open http://localhost:3000

### Deployment

Deploy to Vercel:

Push your code to a GitHub repository.
Import the repository on Vercel.
Add environment variables (DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL with your Vercel URL).
Deploy.

### Environment Variables

| Variable     | Description                                             |
| ------------ | ------------------------------------------------------- |
| DATABASE_URL | PostgreSQL connection string (Neon)                     |
| AUTH_SECRET  | Secret key for NextAuth (use `openssl rand -base64 32`) |
| NEXTAUTH_URL | Base URL of the application                             |


### Folder Structure (Key Files)

app/           # Pages and API routes
components/    # Reusable UI components
lib/           # Utility functions (Prisma client)
prisma/        # Database schema and migrations
public/        # Static assets

### License

This project is for academic purposes (thesis submission).

### Acknowledgments

Unsplash for background images
Icons from Lucide React
Fonts from Google Fonts (Inter, Playfair Display)