# Mini Campaign Manager

A full-stack MarTech tool that lets marketers create, manage, and track email campaigns.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Yarn Workspaces |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 16 + Sequelize v6 |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v3 + shadcn/ui |
| State | Zustand (auth) + TanStack React Query (server state) |
| Testing | Jest + supertest |
| DX | Prettier + ESLint + Husky + lint-staged |

## Quick Start (Docker)

```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker compose up

# The app will be available at:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3001
```

## Manual Setup

### Prerequisites
- Node.js 22+
- Yarn 1.x
- PostgreSQL 16+

### Steps

```bash
# 1. Install dependencies
yarn install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# 3. Create the database
createdb campaign_manager

# 4. Run migrations
yarn db:migrate

# 5. Seed demo data
yarn db:seed

# 6. Start development servers
yarn dev
# This starts both backend (port 3001) and frontend (port 5173)
```

### Run Tests

```bash
# Create test database first
createdb campaign_manager_test

# Run tests
yarn test
```

## Demo Credentials

After seeding, you can log in with:

| Email | Password |
|-------|----------|
| admin@example.com | password123 |
| marketer@example.com | password123 |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Register a new user |
| POST | /auth/login | No | Login, returns JWT |
| GET | /campaigns | Yes | List campaigns (paginated) |
| POST | /campaigns | Yes | Create campaign |
| GET | /campaigns/:id | Yes | Campaign details + stats |
| PATCH | /campaigns/:id | Yes | Update draft campaign |
| DELETE | /campaigns/:id | Yes | Delete draft campaign |
| POST | /campaigns/:id/schedule | Yes | Schedule a campaign |
| POST | /campaigns/:id/send | Yes | Send a campaign |
| GET | /recipients | Yes | List all recipients |
| POST | /recipient | Yes | Create a recipient |

## Project Structure

```
campaign-manager/
├── packages/
│   ├── backend/          # Express API + Sequelize
│   │   ├── src/
│   │   │   ├── config/      # DB, JWT, env config
│   │   │   ├── controllers/ # HTTP request handlers
│   │   │   ├── middleware/   # Auth, validation, errors
│   │   │   ├── migrations/  # Database migrations
│   │   │   ├── models/      # Sequelize models
│   │   │   ├── routes/      # Express routes
│   │   │   ├── seeders/     # Demo data
│   │   │   ├── services/    # Business logic
│   │   │   ├── validators/  # Zod schemas
│   │   │   └── utils/       # Helpers (stats)
│   │   └── tests/           # Jest tests
│   └── frontend/         # React + Vite
│       └── src/
│           ├── api/          # Axios API client
│           ├── components/   # UI components
│           ├── hooks/        # React Query hooks
│           ├── pages/        # Route pages
│           ├── store/        # Zustand auth store
│           └── types/        # TypeScript types
├── docker-compose.yml
└── package.json          # Yarn workspace root
```

## Database Schema

- **users** — id, email (unique), name, password, created_at
- **campaigns** — id, name, subject, body, status (draft|sending|scheduled|sent), scheduled_at, created_by → users, created_at, updated_at
- **recipients** — id, email (unique), name, created_at
- **campaign_recipients** — campaign_id, recipient_id, sent_at, opened_at, status (pending|sent|failed)

## Business Rules

1. A campaign can only be edited or deleted when status is `draft`
2. `scheduled_at` must be a future timestamp
3. Sending transitions status to `sent` and cannot be undone
4. Sending simulates async delivery: 85% success rate with random delays

---

## How I Used Claude Code

### Tasks Delegated to Claude Code

1. **Project scaffolding** — Generated the entire monorepo structure, package.json configs, Docker setup, Prettier/ESLint/Husky configuration, and the layered backend architecture (routes → controllers → services → models)
2. **Backend implementation** — Generated all Sequelize models, migrations, API routes, controllers, services, middleware, Zod validators, and test suites
3. **Frontend components** — Generated shadcn/ui-compatible UI components (button, card, badge, input, dialog, etc.) without @radix-ui dependencies, React Query hooks, Zustand stores, and all page components
4. **Complete UI redesign** — Delegated a full visual overhaul: dark/light mode with CSS custom properties, Inter font, new color palette, responsive mobile layouts, entrance animations, and polished component styles to match modern YC-company aesthetics
5. **Debugging infrastructure issues** — Used Claude Code to diagnose and fix Docker port conflicts, Sequelize initialization errors, and stale React Query cache across user sessions

### Real Prompts Used

1. *"now i need something to improve the ui complete the ui have to clean and smooth like all the fund yc company. please check it carefully and fix the ui for me. so if user access the system then it should be amazing"* — This kicked off a comprehensive UI redesign: new color system with light/dark CSS variables, Inter font, theme toggle (light/dark/system), redesigned all pages and components with animations, responsive mobile layouts, and polished card/badge/button styles
2. *"when i login with different account the list doesn't change right away. it still keep the old value"* — Claude Code identified the root cause (React Query cache not clearing between user sessions) and added `queryClient.clear()` on login, register, and logout
3. *"i still get this error"* (No Sequelize instance passed) — Claude Code traced the import chain and discovered that `database.js` (sequelize-cli config) and `database.ts` (Sequelize instance) in the same directory caused a CommonJS resolution conflict where Node picked `.js` over `.ts`. Fixed by renaming to `database.config.js`

### Where Claude Code Was Wrong or Needed Correction

1. **Sequelize file naming conflict** — Claude Code initially placed `database.js` (sequelize-cli config) alongside `database.ts` (Sequelize instance) in the same directory. Node's CommonJS resolver picked the `.js` file over `.ts`, causing a "No Sequelize instance passed" error at runtime. It took multiple debugging rounds with `console.log` statements before Claude Code identified the root cause and renamed the file to `database.config.js`
2. **Delete button hidden behind status check** — The delete button was only visible for `draft` campaigns, making it invisible for sent/scheduled campaigns. I had to point out that I couldn't see the delete button before Claude Code moved it outside the draft-only conditional block and also removed the backend draft-only restriction on deletion
3. **Stale cache across user sessions** — The React Query cache persisted between different user logins, showing the previous user's campaign data. Claude Code didn't anticipate this multi-user scenario during initial implementation — I had to report the bug before it was fixed

### What I Would Not Let Claude Code Do

1. **Architecture decisions** — I reviewed and approved the layered architecture (routes → controllers → services → models) and the database schema design (indexes, foreign keys, cascade rules) before letting Claude Code implement them
2. **Security-sensitive code** — Manually verified JWT secret handling, password hashing with bcryptjs, auth middleware token validation, and the Axios 401 interceptor auto-logout logic
3. **Business rule changes** — When Claude Code suggested removing the draft-only delete restriction, I made sure to understand the implications before approving the backend change. Business rules around state machines (draft → scheduled → sending → sent) need human judgment
4. **Docker and environment configuration** — Reviewed port mappings, environment variable structure, and database connection strings rather than blindly accepting generated configs, which proved important when the port 5432 conflict required changing to 5433
