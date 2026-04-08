# Petrol Pump Staff Management SaaS – Solution Blueprint (Step-by-Step)

## 1) SaaS Tenancy Model

Use a **shared database, shared app, tenant-isolated rows** model.

- `tenant_id` on all business tables  
- Every JWT includes `tenant_id`, `pump_id` (if scoped), `role`  
- Backend enforces tenant scoping in a global interceptor/guard  
- PostgreSQL **Row Level Security (RLS)** adds a second protection layer  

This gives strong isolation with lower cost than database-per-tenant.

## 2) High-Level Architecture

- HTTPS REST
- Socket.io WSS
- Flutter Web/Mobile
- API Gateway/ALB
- NestJS Realtime Gateway
- NestJS App ECS Fargate
- PostgreSQL RDS
- Redis ElastiCache
- S3 - images
- AWS Rekognition
- Google Maps Geofence Validation
- SNS/SES Push & Email
- CloudWatch/X-Ray

## 3) Low-Level Service Modules (NestJS)

- `auth`: login, refresh, JWT issue/revoke  
- `users`: staff lifecycle, role assignment  
- `tenants`: super-admin manages organizations/pumps  
- `attendance`: geo+face check-in/out  
- `tasks`: templates, assignments, completion, verification  
- `roster`: next-day shift allocations, swap requests  
- `cash`: DSM report + accountant validation + admin finalization  
- `inventory`: fuel density/stock entries  
- `notifications`: socket + push/email  
- `audit`: immutable activity logs  
- `reports`: dashboard analytics  

## 4) PostgreSQL Schema (Core Tables)

### Identity & Tenancy

- `tenants(id, name, status, plan, created_at)`  
- `pumps(id, tenant_id, name, code, lat, lng, geofence_radius_m, address, timezone)`  
- `roles(id, code) -> ADMIN, MANAGER, ACCOUNTANT, DSM, CLEANING`  
- `users(id, tenant_id, pump_id, role_id, full_name, phone, email, password_hash, status, face_profile_image_key, last_login_at, created_at)`  
- `user_sessions(id, user_id, refresh_token_hash, device_id, ip, expires_at, revoked_at)`  

### Attendance

- `attendance(id, tenant_id, pump_id, user_id, date, check_in_at, check_out_at, in_lat, in_lng, in_distance_m, out_lat, out_lng, out_distance_m, status, face_match_score, face_check_status, geo_check_status, source_device_id)`  
- `attendance_events(id, attendance_id, event_type, ts, metadata_json)`  

### Tasks

- `task_templates(id, tenant_id, name, description, role_target, requires_photo, sla_minutes, checklist_json, active)`  
- `task_schedules(id, tenant_id, pump_id, template_id, schedule_type, cron_expr, days_of_week, start_time, end_time, custom_rule_json, active)`  
- `tasks(id, tenant_id, pump_id, template_id, assigned_to_user_id, assigned_by_user_id, due_at, status, started_at, completed_at, auto_flagged, verification_status, verified_by_user_id, verified_at, remarks)`  
- `task_evidence(id, task_id, s3_key, captured_at, lat, lng, device_id, metadata_json)`  

### Rosters / Swaps

- `rosters(id, tenant_id, pump_id, date, shift_code, fuel_point, assigned_user_id, assigned_by_user_id, status)`  
- `swap_requests(id, tenant_id, pump_id, requester_user_id, target_user_id, roster_id, reason, status, approved_by, approved_at, rejected_reason)`  

### Cash & Accounting

- `cash_reports(id, tenant_id, pump_id, dsm_user_id, business_date, online_amount, offline_amount, total_amount, denomination_json, status, submitted_at, accountant_id, accountant_verified_at, admin_id, admin_approved_at, remarks)`  
- `cash_report_events(id, cash_report_id, event, actor_user_id, ts, metadata_json)`  

### Inventory

- `fuel_density_logs(id, tenant_id, pump_id, manager_user_id, fuel_type, density_value, measured_at)`  
- `fuel_stock_entries(id, tenant_id, pump_id, manager_user_id, fuel_type, opening_stock, received_stock, sold_stock, closing_stock, entry_date)`  

### Realtime / Notifications / Audit

- `notifications(id, tenant_id, user_id, type, title, body, read_at, created_at)`  
- `audit_logs(id, tenant_id, actor_user_id, action, entity, entity_id, before_json, after_json, ip, user_agent, created_at)`  

### Key Constraints

- Unique: `(tenant_id, phone)` and `(tenant_id, email)`  
- Unique attendance per day/user: `(tenant_id, user_id, date)`  
- All transactional tables include `tenant_id` + indexed `pump_id`, `user_id`, `date`  

## 5) API Design (REST)

Base: `/api/v1`

### Auth

- `POST /auth/login`  
- `POST /auth/refresh`  
- `POST /auth/logout`  

```json
// login request
{ "username": "manager01", "password": "******", "deviceId": "abc-123" }

// login response
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "user": { "id": "...", "role": "MANAGER", "tenantId": "...", "pumpId": "..." }
}
```

### Attendance

- `POST /attendance/check-in` (geo+face required)  
- `POST /attendance/check-out`  
- `GET /attendance/me/today`  
- `GET /attendance/pump/:pumpId?date=YYYY-MM-DD` (manager/admin)  

### Tasks

- `POST /task-templates` (admin)  
- `POST /task-schedules` (admin/manager scoped)  
- `GET /tasks/my?status=pending`  
- `POST /tasks/:id/start`  
- `POST /tasks/:id/complete` (with evidence)  
- `POST /tasks/:id/verify` (admin/manager)  

### Roster & Swaps

- `POST /rosters/next-day`  
- `GET /rosters/my?date=`  
- `POST /swaps/request`  
- `POST /swaps/:id/approve`  
- `POST /swaps/:id/reject`  

### Cash

- `POST /cash-reports` (DSM submit)  
- `POST /cash-reports/:id/accountant-verify`  
- `POST /cash-reports/:id/admin-approve`  
- `GET /cash-reports?businessDate=`  

### Dashboard

- `GET /dashboard/admin?from=&to=&pumpId=`  
- `GET /dashboard/manager?date=`  

## 6) Backend Folder Structure (NestJS)

```text
src/
  main.ts
  app.module.ts
  common/
    guards/ (jwt-auth.guard.ts, roles.guard.ts, attendance.guard.ts, tenant.guard.ts)
    decorators/ (roles.decorator.ts, current-user.decorator.ts, tenant.decorator.ts)
    interceptors/ (tenant-scope.interceptor.ts, audit.interceptor.ts)
    filters/ (http-exception.filter.ts)
    utils/
  config/
    env.validation.ts
    jwt.config.ts
    aws.config.ts
  modules/
    auth/
    users/
    tenants/
    pumps/
    attendance/
    tasks/
      templates/
      schedules/
      execution/
    roster/
    swaps/
    cash/
    inventory/
    notifications/
    dashboard/
    audit/
    realtime/ (socket gateway)
  infra/
    db/ (typeorm/prisma config, migrations)
    queue/ (bullmq)
    storage/ (s3.service.ts)
    face/ (rekognition.service.ts)
    maps/ (geofence.service.ts)
```

## 7) Flutter App Structure (Web + Mobile)

Use **Riverpod + GoRouter + Dio + Socket.io client**.

```text
lib/
  main.dart
  core/
    router/
    theme/
    network/ (dio_client.dart, interceptors)
    auth/ (token_store.dart)
    realtime/ (socket_service.dart)
    permissions/
  features/
    auth/
    attendance/
    dashboard/
    tasks/
    roster/
    swaps/
    cash/
    inventory/
    notifications/
    profile/
  shared/
    widgets/
    models/
    utils/
```

Navigation:

- Public: `Login`  
- Protected (attendance-gated): role-based shell routes  

Route guard checks:

1. Authenticated?  
2. Attendance done today?  
3. Role allowed?  

## 8) RBAC Implementation Logic

JWT claims:

- `sub`, `tenant_id`, `pump_id`, `role`, `permissions_version`

- `JwtAuthGuard` validates token/session state.  
- `RolesGuard` checks endpoint role metadata.  
- `TenantGuard` forces query/body/path tenant scope.  
- Optional ABAC checks for ownership (`task.assigned_to == user.id`).  

Example:

```ts
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, AttendanceGuard)
@Roles('MANAGER', 'ADMIN')
@Post(':id/verify')
verifyTask(...) {}
```

## 9) Geo-fencing + Face Recognition Workflow

High-level flow:

1. Capture live selfie + GPS  
2. Upload selfie (pre-signed URL)  
3. Call `check-in(lat,lng,imageKey,deviceId)`  
4. Validate distance from pump geofence  
5. Compare face with enrolled profile  
6. Get similarity score  
7. Determine inside/outside + distance  
8. Store attendance with scores/status  
9. Return success/failure + reason  

Best practices:

- Liveness mitigation: burst capture + timestamp/device checks (or Rekognition Face Liveness if enabled)  
- Deny gallery uploads: camera-only plugin, EXIF/runtime checks  
- Configurable thresholds: e.g., face similarity `>= 90`, geofence `<= radius_m`  

## 10) Task Scheduling Logic

Use **BullMQ + Redis + scheduler worker**.

- `task_schedules` define recurrence  
- Nightly job expands schedules into concrete `tasks` for next day  
- SLA timer job flags overdue tasks  
- Auto-escalation notifications to manager/admin  
- Custom rules (`TTS`, `MWS`) represented as `custom_rule_json` and translated to cron/logic handlers  

Pseudo flow:

1. Fetch active schedules per tenant/pump  
2. Compute occurrences by timezone  
3. Insert tasks with `due_at`, assignee/role target  
4. Emit socket notification  
5. Monitor completion; if overdue -> `auto_flagged = true`  

## 11) Real-Time (Socket.io) Architecture

- Namespace: `/realtime`  

Rooms:

- `tenant:{tenantId}`  
- `pump:{pumpId}`  
- `user:{userId}`  

Events:

- `attendance.updated`  
- `task.assigned`, `task.updated`, `task.flagged`  
- `swap.requested`, `swap.decision`  
- `cash.submitted`, `cash.verified`  
- `notification.new`  

Scale:

- Socket adapter with Redis pub/sub for multi-instance ECS tasks  
- JWT auth during socket handshake  
- Emit minimal payload; clients fetch details via REST if needed  

## 12) AWS Deployment Architecture (Production)

High-level components:

- Flutter Web on CloudFront/S3  
- ALB  
- Flutter Mobile App  
- ECS Fargate - NestJS API  
- ECS Fargate - Socket Gateway  
- RDS PostgreSQL Multi-AZ  
- ElastiCache Redis  
- S3 private bucket  
- AWS Rekognition  
- Secrets Manager  
- CloudWatch Logs/Metrics  

Recommended AWS services:

- Compute: ECS Fargate (API + worker + socket)  
- DB: RDS PostgreSQL (Multi-AZ, automated backups)  
- Cache/queue: ElastiCache Redis + BullMQ  
- Object storage: S3 private bucket + pre-signed upload URLs  
- Web hosting: CloudFront + S3 static for Flutter web  
- Security: WAF + Shield, KMS encryption, Secrets Manager  
- CI/CD: CodePipeline/GitHub Actions -> ECR -> ECS deploy  
- Observability: CloudWatch dashboards, alarms, X-Ray tracing  

## 13) Security & Compliance Essentials

- Password hashing: Argon2/bcrypt with strong policy  
- Short-lived access token + rotating refresh token  
- Full audit trail for sensitive actions  
- TLS everywhere; encryption at rest (RDS/S3/KMS)  
- Least-privilege IAM per service  
- Rate limiting + brute-force protection for login  
- PII minimization and retention policy for face images  

## 14) Rollout Plan

- **Phase 1 (MVP)**: Auth, attendance, tasks, basic dashboard  
- **Phase 2**: Roster swap, cash/accountant workflow, realtime  
- **Phase 3**: Advanced analytics, SLA automation, alerts/escalations  
- **Phase 4**: Multi-tenant billing, plan limits, white-labeling  

