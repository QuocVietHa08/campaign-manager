# Campaign Manager — Claude Code Instructions

## Project Overview

Full-stack Mini Campaign Manager — a MarTech tool for creating, managing, and tracking email campaigns. Yarn workspaces monorepo with backend and frontend packages.

## Architecture

```
Request → Routes → Zod Validation → Controller → Service → Sequelize Model → PostgreSQL
```

- **Routes**: HTTP method + path, attach middleware, delegate to controller
- **Controllers**: Parse request, call service, format HTTP response
- **Services**: Pure business logic, no req/res access, independently testable
- **Models**: Sequelize class-based definitions with associations in `models/index.ts`

## Key Directories

```
packages/backend/src/
├── config/         # database.ts, env.ts, jwt.ts (+ database.js for sequelize-cli)
├── middleware/     # auth.ts (JWT), validate.ts (Zod), errorHandler.ts
├── models/        # User, Campaign, Recipient, CampaignRecipient + index.ts (associations)
├── migrations/    # Plain JS files (sequelize-cli requirement)
├── seeders/       # Demo data (2 users, 10 recipients, 4 campaigns)
├── routes/        # Express routers
├── controllers/   # HTTP handlers
├── services/      # Business logic (campaign.service, sending.service, auth.service)
├── validators/    # Zod schemas
├── types/         # Express augmentation, custom error classes
└── utils/         # stats.ts (computeStats helper)

packages/frontend/src/
├── api/           # Axios client with JWT interceptor + endpoint functions
├── hooks/         # React Query hooks (useCampaigns, useAuth, useRecipients)
├── store/         # Zustand auth store with localStorage persist
├── pages/         # LoginPage, RegisterPage, CampaignListPage, CampaignNewPage, CampaignDetailPage
├── components/
│   ├── layout/    # AppLayout, ProtectedRoute
│   ├── campaigns/ # StatusBadge, StatsDisplay, RecipientTable, CampaignCard, CampaignForm
│   └── ui/        # shadcn/ui-style components (no Radix dependency)
├── lib/           # cn() utility
└── types/         # Shared TypeScript interfaces
```

## Tech Stack

| Backend | Frontend | DevOps |
|---------|----------|--------|
| Express + TypeScript | React 19 + Vite | Docker Compose |
| Sequelize v6 + PostgreSQL 16 | Tailwind CSS v3 + shadcn/ui | Husky + lint-staged |
| JWT (jsonwebtoken) + bcryptjs | Zustand + TanStack React Query | Prettier + ESLint |
| Zod validation | Axios | Jest + supertest |

## Commands

```bash
# Development
yarn dev                    # Start both backend + frontend
yarn dev:backend            # Backend only (port 3001)
yarn dev:frontend           # Frontend only (port 5173)

# Database
yarn db:migrate             # Run migrations
yarn db:seed                # Seed demo data
yarn db:migrate:undo        # Undo all migrations
yarn db:reset               # Full reset: undo → migrate → seed

# Testing
yarn test                   # Run all backend tests
yarn test:watch             # Run tests in watch mode

# Code Quality
yarn lint                   # ESLint fix
yarn format                 # Prettier write
yarn format:check           # Prettier check (CI)
yarn typecheck              # TypeScript check both packages

# Docker
yarn docker:start           # docker compose up
yarn docker:build           # docker compose up --build
yarn docker:stop            # docker compose down

# First-time setup
yarn setup                  # Full local setup script
```

## Business Rules (enforce server-side)

1. **Draft-only editing**: Campaigns can only be updated/deleted when `status === 'draft'`
2. **Future scheduling**: `scheduledAt` must be a future timestamp
3. **Irreversible sending**: `POST /campaigns/:id/send` transitions status to `sent`, cannot be undone
4. **Sending simulation**: 85% success rate, random delays 100-500ms, 40% opened chance

## Database Conventions

- All tables use `underscored: true` (snake_case in DB, camelCase in JS)
- Migrations are plain `.js` files (sequelize-cli requirement)
- Models are TypeScript with `Model.init()` pattern
- `campaign_recipients` uses composite PK `(campaign_id, recipient_id)` — no surrogate id
- `ON DELETE CASCADE` for campaign_recipients, `ON DELETE RESTRICT` for campaigns.created_by

## Error Handling

Custom error classes in `packages/backend/src/types/index.ts`:
- `BusinessRuleError` → 409 Conflict
- `NotFoundError` → 404
- `ZodError` → 400 with structured field errors
- `UnauthorizedError` → 401

API error shape: `{ error: "message", details?: [...] }`

## Frontend Patterns

- **Auth**: Zustand store with `persist` middleware (localStorage). Token attached via Axios request interceptor. 401 response → auto-logout.
- **Data fetching**: TanStack React Query. Mutations invalidate relevant query keys on success.
- **Routing**: react-router-dom v7 with `ProtectedRoute` wrapper that redirects to `/login`.
- **UI components**: Custom shadcn/ui-style components in `components/ui/` — no @radix-ui dependency. Dialog uses React portal with controlled `open`/`onOpenChange` props.
- **Status badges**: draft=grey(secondary), scheduled=blue(default), sending=animated(outline), sent=green(success)

## Testing

Tests live in `packages/backend/tests/`. Using Jest + ts-jest + supertest.

- `campaign.service.test.ts` — Draft-only editing/deletion, schedule validation
- `sending.service.test.ts` — Status transitions, recipient status updates
- `campaign.routes.test.ts` — Integration tests via HTTP (auth, CRUD, schedule)

Each test file manages its own `sequelize.sync({ force: true })` and cleanup.
Test DB: `campaign_manager_test` (auto-derived from DATABASE_URL).

## Environment Variables

Defined in `.env` (root level, git-ignored). See `.env.example`:

```
DATABASE_URL=postgres://campaign_user:campaign_pass@localhost:5432/campaign_manager
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=24h
PORT=3001
VITE_API_URL=http://localhost:3001
```

## When Adding New Features

1. **New API endpoint**: Create validator schema → service method → controller handler → route → test
2. **New model**: Create migration (JS) → model (TS) → add associations in `models/index.ts` → update seed
3. **New page**: Create API function → React Query hook → page component → add route in `App.tsx`
4. **New UI component**: Add to `components/ui/` following existing forwardRef + cn() pattern

## Coding Style

- Use `console.log` for debugging flow (per user preference)
- Backend: CommonJS module (`"module": "commonjs"` in tsconfig)
- Frontend: ESM (`"type": "module"` in package.json)
- Prettier: single quotes, trailing commas, 100 char width, 2-space indent
- Import paths: `@/` alias mapped to `./src/` in both packages
