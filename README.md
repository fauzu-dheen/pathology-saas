# Pathology SaaS

Multi-tenant pathology SaaS for managing organization users, reports, SVS whole slide image uploads, browser-based slide viewing, and RBAC-controlled sharing.

## Local Setup

### Backend

```bash
cd backend
uv sync
cp .env.example .env
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

Backend runs at:

```txt
http://localhost:8000
```

### Frontend

```bash
cd client
pnpm install
cp .env.example .env
pnpm dev
```

Frontend runs at:

```txt
http://localhost:5173
```

## Useful Commands

Backend formatting:

```bash
cd backend
uv run ruff check . --fix
uv run ruff format .
```

Frontend formatting/build:

```bash
cd client
pnpm format
pnpm build
```

## Tech Stack

- Backend: Python, FastAPI, SQLAlchemy, Alembic
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Database: PostgreSQL via Supabase
- Storage: Supabase Storage
- Auth: Google Sign-In with backend-verified Google ID tokens
- Slide viewing: OpenSlide + OpenSeadragon tile streaming

## Features

- Google-only authentication
- First-login organization onboarding
- Multi-tenant organization isolation
- User management
- Per-user RBAC permissions
- Report CRUD
- SVS upload with progress
- Whole slide viewer with pan/zoom
- Public share links for slides
- Backend-enforced authorization for protected APIs

## Environment Variables

### Backend

```bash
DATABASE_URL=
GOOGLE_CLIENT_ID=
JWT_SECRET=
JWT_EXPIRES_MINUTES=10080
PENDING_TOKEN_EXPIRES_MINUTES=15
FRONTEND_ORIGIN=http://localhost:5173
SUPABASE_URL=
SUPABASE_SECRET_KEY=
SUPABASE_SLIDES_BUCKET=slides
```

Notes:

- `DATABASE_URL` should point to the Supabase Postgres connection string.
- `SUPABASE_SECRET_KEY` should be the service role key because uploads and private file access are handled server-side.
- `FRONTEND_ORIGIN` must match the frontend URL for CORS.

### Frontend

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=
```

## Database and Migrations

Alembic migrations are stored in:

```txt
backend/alembic/versions
```

Run migrations:

```bash
cd backend
uv run alembic upgrade head
```

Current schema includes:

- organizations
- users
- user_permissions
- reports
- slides
- slide_shares
- Supabase Storage bucket setup for `slides`

## Authentication Flow

1. User signs in with Google.
2. Backend verifies the Google ID token.
3. If the user is new, backend returns a pending onboarding token.
4. Frontend asks for organization name and slug.
5. Backend creates the organization and first admin user.
6. Backend issues an app JWT.
7. Subsequent logins go directly to the dashboard.

Pre-created users can be invited by email. When they authenticate with Google using the same email, their Google identity is linked to the existing organization user row.

## RBAC

Admins can manage users and permissions. Backend permission checks are enforced on protected endpoints; frontend permission checks are only used to hide unavailable actions.

Implemented permissions:

- `reports:create`
- `reports:view`
- `reports:edit`
- `reports:delete`
- `slides:upload`
- `slides:view`
- `slides:update`
- `slides:delete`
- `slides:share`

## SVS Upload and Viewing

SVS files are uploaded through the authenticated API, stored in a private Supabase Storage bucket, and associated with a report.

Storage path format:

```txt
{organization_id}/{report_id}/{slide_id}.svs
```

Slides are viewed through tile endpoints instead of exposing the original file to the browser:

```txt
GET /reports/{report_id}/slides/{slide_id}/dzi.xml
GET /reports/{report_id}/slides/{slide_id}/tiles/{level}/{col}_{row}.jpeg
```

The frontend uses OpenSeadragon to request only the visible tiles needed for pan and zoom.

## Deployment

Backend is deployed on Render as a Python web service.

Render settings:

```bash
Root Directory: backend
Build Command: pip install uv && uv sync --frozen --no-dev
Start Command: uv run --no-sync uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Frontend is deployed on Vercel.

Vercel settings:

```bash
Root Directory: client
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm build
Output Directory: dist
```

After deploying:

- Add the Vercel URL to Google OAuth authorized JavaScript origins.
- Set Render `FRONTEND_ORIGIN` to the final Vercel URL.
- Run Alembic migrations against the production Supabase database.

## Assumptions and Tradeoffs

- Users are modeled as belonging to one organization for this assignment. A production version could support the same Google account joining multiple organizations through a membership table.
- Tenant isolation is enforced by scoping organization-owned records with `organization_id`.
- Storage uses one private Supabase bucket with path-based tenant scoping instead of per-organization buckets. Backend authorization controls access.
- The Supabase account used for this assignment is on the free tier, which limits uploads to 50 MB. The UI and backend enforce a 50 MB limit for this deployment. For production-scale SVS files, S3 or GCS with multipart upload would be a better fit.
- Uploads currently go through the authenticated FastAPI backend so tenant/RBAC checks, storage paths, and slide records stay centralized. For production-scale SVS uploads, a better approach would be backend-issued signed direct uploads to S3/GCS with multipart upload support, followed by backend confirmation and metadata extraction.
- OpenSlide requires local file access, so the backend caches downloaded slide files in `/tmp`. This is acceptable for a single-instance assignment deployment, but the cache is not shared across multiple backend instances.
- Tile generation is done on demand. Redis, generated tile caching, or CDN-backed tile storage could improve performance at scale.
- This project is currently deployed on Render's free tier, so the backend can cold start and has limited CPU/memory. This is acceptable for the assignment deployment but not ideal for production pathology workloads.
- Public share links are token-based. Optional expiration exists in the backend model/API, but the current UI creates non-expiring links for simplicity.

## Sample SVS Files

OpenSlide sample files are available here:

```txt
https://openslide.cs.cmu.edu/download/openslide-testdata/Aperio/
```

For this deployment, use `CMU-1-Small-Region.svs` because it is below the 50 MB upload limit.
