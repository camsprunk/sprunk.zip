# sprunk.zip

A personal space for saving links, notes, and references. Password-protected, mobile-friendly, and synced across devices.

Built for my own use — nothing fancy, just something that works the way I want it to.

**Live at [sprunk.zip](https://sprunk.zip)**

---

## Stack

- [Next.js 14](https://nextjs.org) (App Router)
- [Turso](https://turso.tech) — SQLite at the edge for persistence
- [Tailwind CSS](https://tailwindcss.com)
- [Motion](https://motion.dev) for animations
- [Vercel](https://vercel.com) for hosting

---

## Running locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `TURSO_DATABASE_URL` | Your Turso database URL |
| `TURSO_AUTH_TOKEN` | Your Turso auth token |
| `SPRUNK_USERNAME` | Basic auth username |
| `SPRUNK_PASSWORD` | Basic auth password |

Create a free Turso database at [turso.tech](https://turso.tech) — the app will initialize the schema on first run.

---

## Features

- Save links and notes as tiles
- Organize into folders
- Drag-and-drop URL import
- Synced to a database (works across devices)
- Password protected
- Mobile responsive
