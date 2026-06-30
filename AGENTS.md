# Pathology SaaS Build Tracker

This file tracks implementation decisions, progress, assumptions, and handoff notes for agents working on this repository. Keep the public README simple; use this file as the working ledger.

## Assignment Objective

Build a production-quality multi-tenant pathology SaaS application that allows organizations to securely manage users, upload Whole Slide Images (`.svs` files), view slides in the browser, and control access through RBAC.

## Required Stack

- Backend: Python, FastAPI
- Frontend: React, TypeScript

## Working Technical Decisions

- Backend framework: FastAPI
- Frontend framework: React + TypeScript
- Database: PostgreSQL preferred for relational tenancy and RBAC
- ORM/migrations: SQLAlchemy + Alembic
- Auth: Google Sign-In with backend token verification
- App session: signed JWT after Google identity verification
- File storage: Supabase Storage for assignment scope (S3-compatible, private buckets,
  signed URLs), interface abstracted for future direct S3/GCS if needed
- Slide viewing: OpenSlide-backed tile/metadata API with OpenSeadragon in the frontend
- Tenant isolation: every tenant-owned resource scoped by `organization_id`

## Core Domain Model

- `organizations`
  - `id`
  - `name`
  - `slug`
  - timestamps
- `users`
  - `id`
  - `organization_id`
  - `email`
  - `name`
  - `google_sub`
  - `is_admin`
  - timestamps
- `user_permissions`
  - `user_id`
  - report permissions
  - slide permissions
- `reports`
  - `id`
  - `organization_id`
  - `created_by_user_id`
  - `title`
  - `description`
  - timestamps
- `slides`
  - `id`
  - `organization_id`
  - `report_id`
  - `uploaded_by_user_id`
  - `filename`
  - `storage_path`
  - `status`
  - slide metadata
  - timestamps
- `slide_shares`
  - `id`
  - `organization_id`
  - `slide_id`
  - `created_by_user_id`
  - `token`
  - `expires_at`
  - timestamps

## RBAC Permissions

Reports:

- `reports:create`
- `reports:view`
- `reports:edit`
- `reports:delete`

Whole Slide Images:

- `slides:upload`
- `slides:view`
- `slides:update`
- `slides:delete`
- `slides:share`

Admins receive all permissions by default and can modify permissions for users in their organization.

## Authentication Flow

Google Sign-In uses Google Identity Services (frontend) + ID token verification (backend).
We exchange Google's ID token once for our own app-issued session JWT — Google's token is
never used as an ongoing session.

### Identity resolution logic (on every Google sign-in)

Backend receives Google ID token, verifies it server-side (signature, audience, expiry),
then branches on three cases:

1. **Existing `google_sub` match** → user found, organization known → issue app JWT → dashboard.
2. **Pre-created user match** (email exists in `users` table with `google_sub IS NULL`,
   created by an org admin ahead of time) → link `google_sub` to that user record on this
   first login → issue app JWT → dashboard. No onboarding step.
3. **No match at all** (brand-new identity) → needs onboarding → backend issues a short-lived
   signed "pending token" containing the verified Google claims (sub, email, name) →
   frontend prompts for org name + slug → frontend calls `/auth/onboard` with org details +
   pending token → backend re-verifies pending token (does NOT trust client-sent email/sub)
   → creates organization → creates user as admin → grants all permissions → issues app JWT
   → dashboard.

### Why a pending token, not the raw Google ID token, for onboarding

Prevents the client from tampering with email/sub between initial auth and org creation.
The pending token is server-signed and short-lived, scoped only to completing onboarding.

### Session model

- App JWT contains `user_id` and `org_id`, signed with `JWT_SECRET`, expires per
  `JWT_EXPIRES_MINUTES`.
- All authenticated API routes resolve `org_id` from the verified app JWT — never from
  request body/query params. This is the tenant isolation boundary.
- Open question (not yet decided): JWT storage on frontend — httpOnly cookie (more secure,
  needs CSRF handling) vs. Bearer token in memory/localStorage (simpler, XSS-exposed).
  Decide and document in Assumptions before backend auth router is finalized.

### Backend endpoints needed

- `POST /auth/google` — verify Google ID token, run identity resolution logic above
- `POST /auth/onboard` — verify pending token, create org + admin user, grant all permissions
- `GET /auth/me` — return current user/org from app JWT (for frontend session bootstrap)

### Libraries

- Backend: `google-auth` (`google.oauth2.id_token.verify_oauth2_token`), `pyjwt` for app sessions
- Frontend: `@react-oauth/google` (Google Identity Services wrapper)

### Config requirement

`GOOGLE_CLIENT_ID` must be IDENTICAL in both frontend (`GoogleOAuthProvider`) and backend
(token audience check). Using two different OAuth client IDs is a common mistake — verify
this explicitly during setup.


## Implementation Tracker

### Project Setup

- [x] Create backend FastAPI app structure
- [x] Create frontend React + TypeScript app structure
- [x] Add Tailwind CSS to frontend
- [x] Add database configuration
- [x] Add migrations
- [ ] Add `.env.example`
- [ ] Add local development scripts

### Authentication

- [ ] Register OAuth client in Google Cloud Console, confirm single `GOOGLE_CLIENT_ID` used frontend + backend
- [x] Add Google Sign-In frontend flow (`@react-oauth/google`)
- [ ] Verify Google identity token in backend (`google-auth`)
- [ ] Implement identity resolution branching (existing user / pre-created user / new user)
- [ ] Implement pending-token issuance + re-verification for onboarding
- [x] Implement first-login organization onboarding frontend route
- [x] Implement subsequent-login dashboard redirect on frontend
- [ ] Implement first-login organization onboarding (`/auth/onboard`)
- [ ] Implement app session/JWT handling (`/auth/google` issuing app JWT)
- [ ] Implement `/auth/me` session bootstrap endpoint
- [ ] Decide + document JWT storage approach (cookie vs. Bearer) before shipping

### Multi-Tenancy

- [ ] Create organization model
- [ ] Scope users to organizations
- [ ] Scope reports to organizations
- [ ] Scope slides to organizations
- [ ] Enforce organization isolation in API queries

### User Management

- [x] List organization users
- [x] Create user by email
- [x] Edit user details
- [x] Delete or deactivate user
- [x] Associate pre-created user with Google account on first auth
- [x] Add frontend users feature folder with API/types/hooks/pages/components
- [x] Use TanStack Query for users list and mutation invalidation

### RBAC

- [ ] Create permission model
- [ ] Grant all permissions to organization admin
- [ ] Add backend permission checks
- [x] Add frontend permission-aware actions
- [x] Add admin UI for editing user permissions

### Reports

- [ ] Create report
- [ ] View report
- [ ] Edit report
- [ ] Delete report
- [ ] Attach slides to report

### SVS Uploads

- [ ] Upload one `.svs` file
- [ ] Upload multiple `.svs` files
- [ ] Show upload progress
- [ ] Persist uploaded files
- [ ] Store slide metadata
- [ ] Validate file type and ownership

### Whole Slide Image Viewer

- [ ] Add backend tile/metadata endpoints
- [ ] Integrate OpenSlide or compatible slide reader
- [ ] Add OpenSeadragon frontend viewer
- [ ] Support smooth zoom
- [ ] Support pan/navigation
- [ ] Prevent raw original file download for normal viewing

### Sharing

- [ ] Create share token
- [ ] Open shared slide route
- [ ] Render shared slide viewer
- [ ] Enforce share token validity
- [ ] Add optional expiration

### Documentation and Delivery

- [x] Create agent build tracker
- [ ] Create basic README
- [ ] Document setup instructions
- [ ] Document environment variables
- [ ] Document database migrations
- [ ] Document assumptions and trade-offs
- [ ] Add deployment instructions
- [ ] Deploy live version

## Expected Environment Variables

```bash
DATABASE_URL=
GOOGLE_CLIENT_ID=
JWT_SECRET=
JWT_EXPIRES_MINUTES=
UPLOAD_ROOT=
FRONTEND_ORIGIN=
```

## Security Notes

- Verify Google identity tokens server-side.
- Scope all tenant-owned resources by authenticated `organization_id`.
- Treat frontend permission checks as UX only; backend authorization is the source of truth.
- Generate uploaded file paths server-side.
- Do not expose original SVS files as public static assets.
- Use unguessable share tokens.

## Assumptions and Trade-Offs

- File storage: Supabase Storage (S3-compatible), private buckets, signed URLs for sharing.
- Per-user permissions directly satisfy the assignment and are simpler than role templates.
- Admins are users with `is_admin=true` plus all permissions.
- Slide viewing will use tile APIs so users can view without downloading original SVS files.
- Deployment target will be selected after the app structure is in place.
- New Google identities with no existing user record always trigger org-creation onboarding;
  we do not attempt domain-based auto-join to an existing org. Each org is independent and
  keyed by slug. (Open question: should same-domain emails be prevented from creating
  duplicate orgs? Not enforced in this implementation — documented as a known gap.)
- Pre-created users (added by an admin by email before they've ever logged in) are linked to
  their `google_sub` on first Google sign-in, not at creation time.

## Deliverables Checklist

- [ ] Source code repository
- [ ] README with setup instructions
- [ ] Database schema and migrations
- [ ] Environment variable documentation
- [ ] Deployed live version
- [ ] Assumptions and trade-offs
