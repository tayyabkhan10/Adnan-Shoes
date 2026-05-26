# Adnan Shoes — Standalone npm Project

Full-stack e-commerce store for premium Pakistani footwear.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your Clerk keys, database URL, and email config

# 3. Push database schema
npm run db:push

# 4. Start development server
npm run dev
```

Open http://localhost:3000 — the frontend runs here.
The API server runs on http://localhost:3001.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Clerk secret key (from dashboard.clerk.com) |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `VITE_CLERK_PUBLISHABLE_KEY` | Same as above (needed by Vite frontend) |
| `SMTP_USER` | Gmail address for order confirmation emails |
| `SMTP_PASS` | Gmail App Password (not your regular password) |
| `ADMIN_EMAIL` | The email address that gets admin panel access |

## Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, shadcn/ui, TanStack Query, Wouter, Clerk
- **Backend:** Express 5, Drizzle ORM, PostgreSQL
- **Auth:** Clerk
- **Email:** Nodemailer (Gmail SMTP)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start frontend + backend together |
| `npm run dev:client` | Start Vite frontend only |
| `npm run dev:server` | Start Express backend only |
| `npm run build` | Build frontend for production |
| `npm run db:push` | Push schema changes to database |
| `npm run db:generate` | Generate migration files |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |

## Project Structure

```
adnan-shoes/
├── src/                    # React frontend
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Navbar, Footer, Layout
│   │   ├── admin/          # AdminLayout
│   │   └── shared/         # ProductCard, AdminGuard
│   ├── pages/
│   │   ├── admin/          # Admin panel pages
│   │   └── *.tsx           # Customer pages
│   ├── hooks/
│   │   └── api.ts          # All API hooks (TanStack Query)
│   ├── lib/
│   │   └── pkr.ts          # PKR formatting utils
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server/                 # Express backend
│   ├── db/
│   │   ├── schema.ts       # Drizzle ORM schema
│   │   └── index.ts        # DB connection
│   ├── routes/             # API route handlers
│   ├── lib/
│   │   └── mailer.ts       # Email service
│   └── index.ts            # Server entry point
├── public/
│   └── images/             # Product images
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.server.json
├── drizzle.config.ts
└── .env.example
```

## Admin Panel

Set `ADMIN_EMAIL` in your `.env` to the Clerk account email that should have admin access.
Access admin panel at: http://localhost:3000/admin

## Notes

- Images go in `public/images/` — the seed data uses `boots.png`, `sneakers.png`, `loafers.png`
- The API server must be running for the frontend to work
- `npm run dev` starts both simultaneously using `concurrently`
