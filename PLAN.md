# Campaign Manager — Improvement Implementation Plan

## Overview
Address all identified product engineering gaps across security, missing features, UX, accessibility, and infrastructure. Organized into 14 batches by dependency order and priority.

---

## Batch 1: Backend Security — Campaign Ownership Authorization
**Why first**: Critical security gap. Any authenticated user can access/modify any other user's campaigns.

### Task 1.1: Add `userId` parameter to all campaign service functions
**File**: `packages/backend/src/services/campaign.service.ts`
- Add `userId: number` as a parameter to: `getCampaignById`, `updateCampaign`, `deleteCampaign`, `scheduleCampaign`
- After fetching the campaign with `findByPk`, add ownership check:
```typescript
if (campaign.createdBy !== userId) {
  throw new NotFoundError('Campaign not found');
}
```
- Return 404 (not 403) to avoid leaking the existence of other users' campaigns

### Task 1.2: Add `userId` parameter to `sendCampaign`
**File**: `packages/backend/src/services/sending.service.ts`
- Add `userId: number` as second parameter to `sendCampaign(campaignId, userId)`
- Add same ownership check after `findByPk`

### Task 1.3: Pass `req.user!.id` from controllers to services
**File**: `packages/backend/src/controllers/campaign.controller.ts`
- `getCampaign`: pass `req.user!.id` as second arg to `getCampaignById(id, req.user!.id)`
- `updateCampaign`: pass `req.user!.id` as third arg to `updateCampaign(id, req.body, req.user!.id)`
- `deleteCampaign`: pass `req.user!.id` as second arg to `deleteCampaign(id, req.user!.id)`
- `scheduleCampaign`: pass `req.user!.id` as third arg to `scheduleCampaign(id, scheduledAt, req.user!.id)`
- `sendCampaign`: pass `req.user!.id` as second arg to `sendingService.sendCampaign(id, req.user!.id)`

### Task 1.4: Add ownership authorization tests
**File**: `packages/backend/tests/campaign.service.test.ts`
- Add new describe block `'Campaign Service - Ownership Authorization'`
- Test: user A cannot get user B's campaign (throws NotFoundError)
- Test: user A cannot update user B's campaign
- Test: user A cannot delete user B's campaign
- Test: user A cannot schedule user B's campaign
- Create a second test user in `beforeEach` for cross-user tests

**File**: `packages/backend/tests/sending.service.test.ts`
- Test: user A cannot send user B's campaign

**Verification**: `yarn test` — all existing + new tests pass

---

## Batch 2: Backend Security — Input Validation & Rate Limiting

### Task 2.1: Add rate limiting to auth endpoints
**File**: `packages/backend/package.json` — add `express-rate-limit` dependency
**File**: `packages/backend/src/routes/auth.routes.ts`
```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
```

### Task 2.2: Add request body size limit
**File**: `packages/backend/src/app.ts`
- Change `app.use(express.json())` to `app.use(express.json({ limit: '1mb' }))`

### Task 2.3: Validate path param `:id` is a valid integer
**File**: `packages/backend/src/validators/campaign.schema.ts`
- Add: `export const idParamSchema = z.object({ id: z.string().regex(/^\d+$/, 'Invalid ID') });`

**File**: `packages/backend/src/routes/campaign.routes.ts`
- Import `idParamSchema`
- Add `validate(idParamSchema, 'params')` middleware to all `/:id` routes:
```typescript
router.get('/:id', validate(idParamSchema, 'params'), campaignController.getCampaign);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateCampaignSchema), campaignController.updateCampaign);
router.delete('/:id', validate(idParamSchema, 'params'), campaignController.deleteCampaign);
router.post('/:id/schedule', validate(idParamSchema, 'params'), validate(scheduleCampaignSchema), campaignController.scheduleCampaign);
router.post('/:id/send', validate(idParamSchema, 'params'), campaignController.sendCampaign);
```

### Task 2.4: Validate recipientIds exist before creating campaign
**File**: `packages/backend/src/services/campaign.service.ts`
- In `createCampaign` and `updateCampaign`, before `bulkCreate`:
```typescript
if (recipientIds && recipientIds.length > 0) {
  const existingRecipients = await Recipient.findAll({
    where: { id: recipientIds },
    attributes: ['id'],
  });
  const existingIds = existingRecipients.map((r) => r.id);
  const missingIds = recipientIds.filter((id) => !existingIds.includes(id));
  if (missingIds.length > 0) {
    throw new BusinessRuleError(`Recipients not found: ${missingIds.join(', ')}`);
  }
}
```

### Task 2.5: Cap pagination limit
**File**: `packages/backend/src/controllers/campaign.controller.ts`
- In `listCampaigns`: `const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);`

### Task 2.6: Add max length to campaign body
**File**: `packages/backend/src/validators/campaign.schema.ts`
- Change `body: z.string().min(1, 'Body is required')` to `body: z.string().min(1, 'Body is required').max(50000, 'Body is too long')`
- Same for `updateCampaignSchema`

**Verification**: `yarn test` — all tests pass

---

## Batch 3: Backend — Recipient Ownership (per-user recipients)

### Task 3.1: Create migration to add `created_by` column to recipients
**File**: `packages/backend/src/migrations/005-add-recipient-created-by.js`
```javascript
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('recipients', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: true, // nullable for existing rows
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addIndex('recipients', ['created_by'], {
      name: 'recipients_created_by_idx',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('recipients', 'created_by');
  },
};
```

### Task 3.2: Update Recipient model
**File**: `packages/backend/src/models/Recipient.ts`
- Add `declare createdBy: number | null;` field declaration
- Add to `Recipient.init` columns:
```typescript
createdBy: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: { model: 'users', key: 'id' },
},
```

### Task 3.3: Update associations
**File**: `packages/backend/src/models/index.ts`
- Add: `User.hasMany(Recipient, { foreignKey: 'created_by', as: 'recipients' });`
- Add: `Recipient.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });`

### Task 3.4: Update recipient service to be per-user
**File**: `packages/backend/src/services/recipient.service.ts`
```typescript
export async function listRecipients(userId: number) {
  return Recipient.findAll({
    where: { createdBy: userId },
    order: [['createdAt', 'DESC']],
  });
}

export async function createRecipient(email: string, name: string, userId: number) {
  const existing = await Recipient.findOne({ where: { email, createdBy: userId } });
  if (existing) {
    const error = new Error('Recipient with this email already exists');
    error.name = 'ConflictError';
    throw error;
  }
  return Recipient.create({ email, name, createdBy: userId });
}
```

### Task 3.5: Update recipient controller to pass userId
**File**: `packages/backend/src/controllers/recipient.controller.ts`
```typescript
export async function listRecipients(req: Request, res: Response, next: NextFunction) {
  try {
    const recipients = await recipientService.listRecipients(req.user!.id);
    return res.json({ recipients });
  } catch (err) {
    next(err);
  }
}

export async function createRecipient(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, name } = req.body;
    const recipient = await recipientService.createRecipient(email, name, req.user!.id);
    return res.status(201).json({ recipient });
  } catch (err: any) {
    if (err.name === 'ConflictError') {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
}
```

### Task 3.6: Update seeder to assign recipients to users
**File**: `packages/backend/src/seeders/001-demo-data.js`
- Add `created_by: 1` to recipients 1-5, `created_by: 2` to recipients 6-10

### Task 3.7: Update init.sql for Docker
**File**: `scripts/db/init.sql`
- Add `created_by` column to recipients table CREATE statement
- Add `created_by` values to INSERT statements

**Verification**: `yarn db:reset && yarn test`

---

## Batch 4: Frontend — Recipient Management Page

### Task 4.1: Create RecipientListPage
**File**: `packages/frontend/src/pages/RecipientListPage.tsx`
- Full page with recipient list (table layout), create dialog, delete capability
- Use `useRecipients()` hook for listing
- Inline "Add Recipient" dialog with email + name fields
- Show recipient count, empty state with CTA
- Reuse existing `Button`, `Input`, `Label`, `Dialog` components

### Task 4.2: Add delete recipient API and hook
**File**: `packages/backend/src/services/recipient.service.ts`
- Add `deleteRecipient(id: number, userId: number)` — verify ownership, check if recipient is attached to any non-draft campaign before allowing delete

**File**: `packages/backend/src/controllers/recipient.controller.ts`
- Add `deleteRecipient` handler

**File**: `packages/backend/src/routes/recipient.routes.ts`
- Add `router.delete('/:id', recipientController.deleteRecipient);`

**File**: `packages/frontend/src/api/recipients.ts`
- Add `deleteRecipient(id: number)`

**File**: `packages/frontend/src/hooks/useRecipients.ts`
- Add `useDeleteRecipient()` mutation

### Task 4.3: Add pagination to recipients API
**File**: `packages/backend/src/services/recipient.service.ts`
- Change `listRecipients(userId)` to `listRecipients(userId, page, limit)` with `findAndCountAll`

**File**: `packages/backend/src/controllers/recipient.controller.ts`
- Parse `page` and `limit` from query params (same pattern as campaign controller)

**File**: `packages/frontend/src/api/recipients.ts`
- Update `getRecipients` to accept `page` param

**File**: `packages/frontend/src/hooks/useRecipients.ts`
- Update `useRecipients(page)` to include page in queryKey

### Task 4.4: Add route to App.tsx
**File**: `packages/frontend/src/App.tsx`
- Import `RecipientListPage`
- Add route: `{ path: '/recipients', element: <RecipientListPage /> }`

### Task 4.5: Add Recipients link to AppLayout navigation
**File**: `packages/frontend/src/components/layout/AppLayout.tsx`
- Add "Recipients" nav link next to existing campaign links

**Verification**: Manual — navigate to `/recipients`, create a recipient, verify it appears in campaign form

---

## Batch 5: Frontend — Edit Campaign Page

### Task 5.1: Create CampaignEditPage
**File**: `packages/frontend/src/pages/CampaignEditPage.tsx`
- Fetch campaign with `useCampaign(id)`
- If campaign status !== 'draft', show read-only view with message "Only draft campaigns can be edited"
- Reuse `CampaignForm` component but with `initialData` prop for pre-filling
- On submit, call `useUpdateCampaign()` mutation
- On success, navigate to campaign detail page with toast

### Task 5.2: Make CampaignForm accept initial data
**File**: `packages/frontend/src/components/campaigns/CampaignForm.tsx`
- Add optional props: `initialData?: { name: string; subject: string; body: string; recipientIds: number[] }` and `submitLabel?: string`
- Initialize state from `initialData` when provided:
```typescript
const [name, setName] = useState(initialData?.name ?? '');
const [subject, setSubject] = useState(initialData?.subject ?? '');
const [body, setBody] = useState(initialData?.body ?? '');
const [selectedRecipients, setSelectedRecipients] = useState<number[]>(initialData?.recipientIds ?? []);
```
- Change submit button text to use `submitLabel` prop (default: 'Create Campaign')

### Task 5.3: Add route and navigation
**File**: `packages/frontend/src/App.tsx`
- Add route: `{ path: '/campaigns/:id/edit', element: <CampaignEditPage /> }`

**File**: `packages/frontend/src/pages/CampaignDetailPage.tsx`
- Add "Edit" button next to other action buttons when `campaign.status === 'draft'`:
```tsx
<Link to={`/campaigns/${campaign.id}/edit`}>
  <Button variant="outline" size="sm">
    <Pencil className="mr-1.5 h-3.5 w-3.5" />
    Edit
  </Button>
</Link>
```

**Verification**: Manual — create draft campaign, click edit, modify name, save, verify changes persist

---

## Batch 6: Frontend — Campaign List Filtering & Search

### Task 6.1: Add status filter to backend campaigns list
**File**: `packages/backend/src/services/campaign.service.ts`
- Add `status?: string` parameter to `listCampaigns`:
```typescript
export async function listCampaigns(userId: number, page = 1, limit = 10, status?: string) {
  const where: any = { createdBy: userId };
  if (status) where.status = status;
  // ... rest unchanged
}
```

**File**: `packages/backend/src/controllers/campaign.controller.ts`
- Parse `status` from query: `const status = req.query.status as string | undefined;`
- Pass to service: `campaignService.listCampaigns(req.user!.id, page, limit, status)`

### Task 6.2: Add search parameter to backend
**File**: `packages/backend/src/services/campaign.service.ts`
- Add `search?: string` parameter to `listCampaigns`
- When provided, add to where clause using Sequelize `Op.iLike`:
```typescript
import { Op } from 'sequelize';
if (search) {
  where[Op.or] = [
    { name: { [Op.iLike]: `%${search}%` } },
    { subject: { [Op.iLike]: `%${search}%` } },
  ];
}
```

**File**: `packages/backend/src/controllers/campaign.controller.ts`
- Parse `search` from query: `const search = req.query.search as string | undefined;`

### Task 6.3: Update frontend API and hooks
**File**: `packages/frontend/src/api/campaigns.ts`
- Update `getCampaigns` signature: `getCampaigns(page, limit, status?, search?)`
- Pass as query params

**File**: `packages/frontend/src/hooks/useCampaigns.ts`
- Update `useCampaigns(page, status?, search?)` — include all in queryKey

### Task 6.4: Add filter/search UI to CampaignListPage
**File**: `packages/frontend/src/pages/CampaignListPage.tsx`
- Add filter bar above the campaign grid:
  - Status filter buttons: All | Draft | Scheduled | Sent (use Badge-style toggles)
  - Search input with debounce (300ms)
- Wire `status` and `search` state to `useCampaigns(page, status, search)`
- Reset page to 1 when filter changes

**Verification**: Manual — filter by draft, search by name, verify results update

---

## Batch 7: Frontend — Error Handling Improvements

### Task 7.1: Surface field-level validation errors
**File**: `packages/frontend/src/lib/utils.ts`
- Add error extraction utility:
```typescript
export function extractApiError(err: any): string {
  const data = err?.response?.data;
  if (data?.details && Array.isArray(data.details)) {
    return data.details.map((d: { field: string; message: string }) => d.message).join('. ');
  }
  return data?.error || err?.message || 'An unexpected error occurred';
}
```

### Task 7.2: Replace generic error messages across all pages
**Files**: `CampaignListPage.tsx`, `CampaignDetailPage.tsx`, `CampaignNewPage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`
- Replace all `err?.response?.data?.error || 'Failed to ...'` with `extractApiError(err)`

### Task 7.3: Add React error boundary
**File**: `packages/frontend/src/components/layout/ErrorBoundary.tsx`
- Create class component error boundary with friendly fallback UI:
  - "Something went wrong" message
  - "Go back to campaigns" button
  - "Try again" button that calls `this.setState({ hasError: false })`

**File**: `packages/frontend/src/App.tsx`
- Wrap the router in ErrorBoundary, or add `errorElement` to router config:
```typescript
{
  element: <ProtectedRoute />,
  errorElement: <ErrorFallback />,
  children: [...]
}
```

### Task 7.4: Fix delete button not disabled during mutation on CampaignDetailPage
**File**: `packages/frontend/src/pages/CampaignDetailPage.tsx`
- Line 208: Change `<Button variant="destructive" onClick={handleDelete}>` to:
```tsx
<Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
</Button>
```
- Also fix: `handleDelete` currently calls `setShowDeleteDialog(false)` before the mutation completes (line 75). Move it into `onSuccess`/`onError` callbacks instead.

### Task 7.5: Show recipient count in send confirmation dialog
**File**: `packages/frontend/src/pages/CampaignDetailPage.tsx`
- Change line 249 from:
  `This will send the campaign to all recipients. This action cannot be undone.`
- To:
  `This will send the campaign to {campaign.recipients?.length || 0} recipient(s). This action cannot be undone.`

**Verification**: Manual — submit empty form, verify field errors shown. Trigger a JS error, verify error boundary catches it.

---

## Batch 8: Frontend — Accessibility Improvements

### Task 8.1: Add `aria-labelledby` to Dialog
**File**: `packages/frontend/src/components/ui/dialog.tsx`
- Generate a unique ID in DialogContent using `React.useId()`
- Pass it down via context so DialogTitle can set `id={titleId}`
- Add `aria-labelledby={titleId}` to the dialog `div[role="dialog"]`

### Task 8.2: Add focus trap to Dialog
**File**: `packages/frontend/src/components/ui/dialog.tsx`
- In `DialogContent`, after mount, query all focusable elements inside the dialog
- On Tab keydown, cycle focus within the dialog (wrap from last to first focusable)
- On open, focus the first focusable element (or the close button)
- On close, restore focus to the previously focused element

### Task 8.3: Change Badge from `<div>` to `<span>`
**File**: `packages/frontend/src/components/ui/badge.tsx`
- Change `BadgeProps` to extend `React.HTMLAttributes<HTMLSpanElement>`
- Change the return from `<div>` to `<span>`

### Task 8.4: Add `aria-label` to icon-only buttons
**File**: `packages/frontend/src/components/campaigns/CampaignCard.tsx`
- Find the delete button (icon-only `<button>` with `<Trash2>` icon)
- Add `aria-label="Delete campaign"`

**File**: `packages/frontend/src/components/layout/AppLayout.tsx`
- Find the theme toggle button
- Add `aria-label="Toggle theme"` (or dynamic label based on current theme)

**Verification**: Manual — open dialog, verify Tab cycles within it. Run accessibility audit in browser DevTools.

---

## Batch 9: Frontend — Schedule Timezone Fix & Unsaved Changes Warning

### Task 9.1: Fix timezone bug in schedule dialog
**File**: `packages/frontend/src/pages/CampaignDetailPage.tsx`
- The `min` attribute uses UTC time but `datetime-local` works in local time
- Fix the `min` calculation:
```typescript
// Convert to local datetime string for datetime-local input
const now = new Date();
const localMin = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 16);
```
- Use `localMin` as the `min` attribute value
- The `handleSchedule` conversion `new Date(scheduledAt).toISOString()` is correct (browser interprets datetime-local as local time)

### Task 9.2: Add unsaved changes warning to campaign form
**File**: `packages/frontend/src/components/campaigns/CampaignForm.tsx`
- Track whether form is dirty (any field changed from initial):
```typescript
const isDirty = name !== (initialData?.name ?? '') ||
  subject !== (initialData?.subject ?? '') ||
  body !== (initialData?.body ?? '') ||
  JSON.stringify(selectedRecipients.sort()) !== JSON.stringify((initialData?.recipientIds ?? []).sort());
```
- Use `useEffect` with `beforeunload` event:
```typescript
useEffect(() => {
  if (!isDirty) return;
  const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [isDirty]);
```
- Use react-router's `useBlocker` for in-app navigation warnings:
```typescript
import { useBlocker } from 'react-router-dom';
const blocker = useBlocker(isDirty);
// Render a confirmation dialog when blocker.state === 'blocked'
```

**Verification**: Manual — fill form partially, try navigating away, verify browser warning appears

---

## Batch 10: Frontend — SPA Navigation Fix for 401

### Task 10.1: Replace `window.location.href` with React Router navigation
**File**: `packages/frontend/src/api/client.ts`
- Remove `window.location.href = '/login';`
- Instead, create a navigation callback approach:

**File**: `packages/frontend/src/lib/navigation.ts` (new)
```typescript
let navigateFn: ((path: string) => void) | null = null;

export function setNavigate(fn: (path: string) => void) {
  navigateFn = fn;
}

export function navigateTo(path: string) {
  if (navigateFn) {
    navigateFn(path);
  } else {
    window.location.href = path; // fallback
  }
}
```

**File**: `packages/frontend/src/api/client.ts`
- Import `navigateTo` and use it in the 401 interceptor

**File**: `packages/frontend/src/App.tsx` or `AppLayout.tsx`
- In a component inside the RouterProvider tree, call `setNavigate(useNavigate())` on mount

**Verification**: Manual — let JWT expire, make a request, verify SPA-style redirect to /login without full page reload

---

## Batch 11: Frontend — ProtectedRoute Token Expiry Check

### Task 11.1: Check token expiry locally before rendering
**File**: `packages/frontend/src/components/layout/ProtectedRoute.tsx`
```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  if (!token || isTokenExpired(token)) {
    if (token) logout(); // clear expired token
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

**Verification**: Manual — set a very short JWT_EXPIRES_IN (e.g., 10s), login, wait, navigate, verify redirect without flicker

---

## Batch 12: Backend — Duplicate Campaign Feature

### Task 12.1: Add duplicate campaign service function
**File**: `packages/backend/src/services/campaign.service.ts`
```typescript
export async function duplicateCampaign(id: number, userId: number) {
  const original = await Campaign.findByPk(id);
  if (!original) throw new NotFoundError('Campaign not found');
  if (original.createdBy !== userId) throw new NotFoundError('Campaign not found');

  const copy = await Campaign.create({
    name: `${original.name} (Copy)`,
    subject: original.subject,
    body: original.body,
    createdBy: userId,
  });

  // Copy recipients
  const originalRecipients = await CampaignRecipient.findAll({
    where: { campaignId: id },
    attributes: ['recipientId'],
  });
  if (originalRecipients.length > 0) {
    await CampaignRecipient.bulkCreate(
      originalRecipients.map((cr) => ({
        campaignId: copy.id,
        recipientId: cr.recipientId,
        status: 'pending' as const,
      }))
    );
  }

  return copy;
}
```

### Task 12.2: Add controller, route
**File**: `packages/backend/src/controllers/campaign.controller.ts`
- Add `duplicateCampaign` handler calling `campaignService.duplicateCampaign(id, req.user!.id)`

**File**: `packages/backend/src/routes/campaign.routes.ts`
- Add: `router.post('/:id/duplicate', validate(idParamSchema, 'params'), campaignController.duplicateCampaign);`

### Task 12.3: Add frontend API, hook, and UI button
**File**: `packages/frontend/src/api/campaigns.ts`
- Add `duplicateCampaign(id: number)`

**File**: `packages/frontend/src/hooks/useCampaigns.ts`
- Add `useDuplicateCampaign()` mutation that invalidates `['campaigns']`

**File**: `packages/frontend/src/pages/CampaignDetailPage.tsx`
- Add "Duplicate" button in the action buttons area (visible for all statuses):
```tsx
<Button variant="outline" size="sm" onClick={handleDuplicate}>
  <Copy className="mr-1.5 h-3.5 w-3.5" />
  Duplicate
</Button>
```

**Verification**: `yarn test` + Manual — duplicate a sent campaign, verify new draft created with same content

---

## Batch 13: Backend — Health Check Endpoint

### Task 13.1: Add health check route
**File**: `packages/backend/src/app.ts`
- Add before the main routes:
```typescript
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Task 13.2: Add healthcheck to docker-compose
**File**: `docker-compose.yml`
- Add to `backend` service:
```yaml
healthcheck:
  test: ['CMD', 'wget', '-q', '--spider', 'http://localhost:3001/health']
  interval: 10s
  timeout: 5s
  retries: 3
```
- Change `frontend` depends_on to:
```yaml
depends_on:
  backend:
    condition: service_healthy
```

**Verification**: `curl http://localhost:3001/health` returns `{"status":"ok"}`

---

## Batch 14: Infrastructure — Docker Fixes

### Task 14.1: Fix VITE_API_URL in docker-compose
**File**: `docker-compose.yml`
- Change `VITE_API_URL: http://localhost:3001` to use the Vite proxy instead
- Since the frontend is served via Vite dev server, it runs in the browser which connects to `localhost:3001` (mapped port) — so `VITE_API_URL` should actually stay as `http://localhost:3001` for dev. But for the frontend container, the Vite proxy at `/api` is the better approach.
- Actually: the Axios `baseURL` is set from `VITE_API_URL`. In Docker, the browser still accesses `localhost:3001` which is port-mapped. So this is correct for dev Docker usage. No change needed.
- Instead, add a `.dockerignore` file.

### Task 14.2: Create .dockerignore files
**File**: `.dockerignore` (root)
```
node_modules
.git
*.log
.env
coverage
dist
build
.DS_Store
pgdata
.husky
```

### Task 14.3: Add production-ready notes to Dockerfiles
This is informational — the current Dockerfiles are fine for development. Production optimization (multi-stage builds, nginx for frontend, compiled backend) is out of scope for this plan but noted for future work.

**Verification**: `docker compose build` completes successfully with smaller context

---

## Summary of All Changes by File

### New Files
- `packages/backend/src/migrations/005-add-recipient-created-by.js`
- `packages/frontend/src/pages/RecipientListPage.tsx`
- `packages/frontend/src/pages/CampaignEditPage.tsx`
- `packages/frontend/src/components/layout/ErrorBoundary.tsx`
- `packages/frontend/src/lib/navigation.ts`
- `.dockerignore`

### Modified Backend Files
- `packages/backend/package.json` (add express-rate-limit)
- `packages/backend/src/app.ts` (body size limit, health endpoint)
- `packages/backend/src/services/campaign.service.ts` (ownership, validation, search/filter, duplicate)
- `packages/backend/src/services/sending.service.ts` (ownership)
- `packages/backend/src/services/recipient.service.ts` (per-user, pagination, delete)
- `packages/backend/src/controllers/campaign.controller.ts` (pass userId, pagination cap, search/filter, duplicate)
- `packages/backend/src/controllers/recipient.controller.ts` (pass userId, delete handler)
- `packages/backend/src/routes/campaign.routes.ts` (id validation, duplicate route)
- `packages/backend/src/routes/auth.routes.ts` (rate limiting)
- `packages/backend/src/routes/recipient.routes.ts` (delete route)
- `packages/backend/src/validators/campaign.schema.ts` (id param schema, body max length)
- `packages/backend/src/models/Recipient.ts` (createdBy field)
- `packages/backend/src/models/index.ts` (User-Recipient association)
- `packages/backend/src/seeders/001-demo-data.js` (recipient created_by)
- `packages/backend/tests/campaign.service.test.ts` (ownership tests)
- `packages/backend/tests/sending.service.test.ts` (ownership test)
- `scripts/db/init.sql` (recipient created_by column)

### Modified Frontend Files
- `packages/frontend/src/App.tsx` (routes, error boundary, navigation setup)
- `packages/frontend/src/api/campaigns.ts` (search/filter params, duplicate)
- `packages/frontend/src/api/recipients.ts` (pagination, delete)
- `packages/frontend/src/hooks/useCampaigns.ts` (search/filter, duplicate)
- `packages/frontend/src/hooks/useRecipients.ts` (pagination, delete)
- `packages/frontend/src/api/client.ts` (SPA navigation for 401)
- `packages/frontend/src/pages/CampaignListPage.tsx` (filter/search UI, error messages)
- `packages/frontend/src/pages/CampaignDetailPage.tsx` (edit button, duplicate button, delete fix, recipient count in send dialog, timezone fix, error messages)
- `packages/frontend/src/pages/CampaignNewPage.tsx` (error messages)
- `packages/frontend/src/pages/LoginPage.tsx` (error messages)
- `packages/frontend/src/pages/RegisterPage.tsx` (error messages)
- `packages/frontend/src/components/campaigns/CampaignForm.tsx` (initialData prop, unsaved warning)
- `packages/frontend/src/components/campaigns/CampaignCard.tsx` (aria-label)
- `packages/frontend/src/components/layout/AppLayout.tsx` (recipients nav link, aria-label, navigation setup)
- `packages/frontend/src/components/layout/ProtectedRoute.tsx` (token expiry check)
- `packages/frontend/src/components/ui/dialog.tsx` (aria-labelledby, focus trap)
- `packages/frontend/src/components/ui/badge.tsx` (span instead of div)
- `packages/frontend/src/lib/utils.ts` (extractApiError utility)
- `docker-compose.yml` (backend healthcheck, frontend depends_on)
