# Devo Tracker

Track your daily devotions, build spiritual habits, and grow closer to your faith.

## Features

- **Devotion journaling** – Rich markdown editor with Bible tab, prayer requests, and resources
- **Streak tracking** – Track consistency with grace periods
- **Prayer requests** – Store and organize prayer requests by category
- **Smart reminders** – In-app notifications and optional email reminders
- **Weekly digest** – Email summary of your week
- **Verse of the day** – Daily Bible verse on the dashboard
- **Export** – Download devotions as PDF, Markdown, Word, or plain text
- **Accountability partners** – Share devotion status (streak, completed today) via link
- **PWA** – Install as an app; offline draft support

## Setup

### Prerequisites

- Node.js 18+
- MongoDB
- SMTP2GO account (for emails)
- ESV API key (optional; for Bible content)
- Google and/or Discord OAuth apps (optional; for social login)

### 1. Clone and install

```bash
git clone <repo-url>
cd devo-tracker
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required:

- `BETTER_AUTH_SECRET` – `openssl rand -base64 32`
- `BETTER_AUTH_URL` – `http://localhost:3000` (dev) or your production URL
- `MONGO_URI` – MongoDB connection string

Optional (for full functionality):

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – Google OAuth
- `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` – Discord OAuth
- `ESV_API_KEY` – Bible passages and verse of the day
- `SMTP2GO_API_KEY` / `SMTP2GO_FROM_EMAIL` – Emails (OTP, reminders, digests, etc.)
- `CRON_SECRET` – `openssl rand -base64 32` for cron endpoints

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production deployment

### Environment variables

For production, set:

- `BETTER_AUTH_URL` – Your production URL (e.g. `https://your-domain.com`)
- `BETTER_AUTH_SECRET` – Strong random secret
- `MONGO_URI` – Production MongoDB URI
- `CRON_SECRET` – For scheduled jobs
- OAuth redirect URIs in Google/Discord dashboards:
  - `https://your-domain.com/api/auth/callback/google`
  - `https://your-domain.com/api/auth/callback/discord`

### Cron jobs

Schedule these endpoints (e.g. [cron-job.org](https://cron-job.org)) with:

- **Header:** `Authorization: Bearer <CRON_SECRET>`

| Endpoint | Method | Frequency |
|----------|--------|-----------|
| `/api/cron/send-reminder-emails` | POST | Every 15–30 min |
| `/api/cron/send-weekly-digest` | POST | Once per week (e.g. Sunday 20:00 UTC) |
| `/api/cron/send-grace-period-emails` | POST | Once per day (e.g. 09:00 UTC) |

### Health check

`GET /api/health` – Returns MongoDB status. Use for load balancers or uptime monitoring.

### Build

```bash
npm run build
npm start
```

## Tech stack

- Next.js 16, React 19
- MongoDB (via Better Auth MongoDB adapter)
- Better Auth (email OTP, Google, Discord)
- Tailwind CSS
- MDX Editor, react-markdown
