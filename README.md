# Petrol Pump Staff Management SaaS

Enterprise-ready multi-tenant SaaS starter for petrol pump operations.

## Stack

- Frontend: Flutter (Web + Mobile)
- Backend: NestJS (Node.js)
- Database: PostgreSQL
- Cache/Queue: Redis + BullMQ
- Auth: JWT + RBAC
- Realtime: Socket.io
- Cloud integrations: AWS S3 + Rekognition + Google Maps

## Monorepo Layout

- `backend/` NestJS API + Socket + scheduler workers
- `frontend/` Flutter app scaffold (web + mobile)
- `infra/` local Docker and AWS deployment templates

## Quick Start

### 1) Start local dependencies

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 2) Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run start:dev
```

### 3) Frontend

```bash
cd frontend
flutter pub get
flutter run -d chrome
```

## Core Capabilities Included

- Multi-tenant data model with `tenantId` isolation
- JWT authentication and role guards
- Attendance-gated access guard
- Task templates + schedules + task execution model
- Roster planning and swap request APIs
- Cash reporting and accountant/admin approval APIs
- Inventory density and stock entry APIs
- Notifications and dashboard aggregate APIs
- Socket.io gateway with tenant/pump/user rooms
- AWS S3/Rekognition service stubs
- Geofence verification service (Haversine)

## Architecture Blueprint

- Full enterprise solution blueprint is saved at `docs/solution-blueprint.md`
- Task and progress tracker is saved at `docs/task-progress-sheet.md`
- Export this markdown to PDF from editor/browser print dialog

## Next Build Steps

- Add persistent refresh token storage and revocation checks via `user_sessions`
- Add BullMQ Worker processor for `task-scheduler` queue
- Add OpenAPI docs and full integration/e2e tests
- Add camera-only capture + anti-spoof checks in Flutter app
- Add CI/CD and IaC provisioning automation
