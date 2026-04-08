# Phase 1 - Foundation Setup

Status: IN PROGRESS

## Goal

Prepare environment, infrastructure decisions, and base configuration so Phase 2 can start without blockers.

## Environment topology (locked)

- Strategy: **Staging + Production**
- Compute: **EC2**
- Database: **RDS PostgreSQL**
- Topology: **Option 1 (Recommended)**
  - **2 EC2** instances (staging + prod)
  - **2 RDS** instances (staging + prod)
  - **2 Elastic IPs**

## What I already prepared

- Backend + frontend monorepo scaffold
- PostgreSQL + Redis local docker setup
- Backend env template (`backend/.env.example`)
- AWS architecture draft (`infra/aws-architecture.md`)
- CI workflow baseline (`.github/workflows/ci.yml`)

## What you need to provide now (mandatory)

1. AWS region: **`ap-south-1` (Mumbai)**
2. Backend compute choice: **EC2**
3. Environment strategy: **Staging + Production**
4. Super admin initial account (provided earlier):
   - name: **Pawan sir**
   - contact: **9891081354**
   - email: **surajnarayangupta2004@gmail.com**
5. Default geofence radius: **100 meters**
6. Late attendance threshold: **10 minutes**
7. Notification mode: **App only (for now)**

## Optional now (can be given in later phases)

- Domain name
- S3 bucket final name
- Google Maps API key
- Rekognition IAM strategy (role/key)

## EC2 Option B Guide

- Step-by-step guide saved at: `docs/phases/ec2-option-b-step-by-step.md`

## Phase 1 completion checklist

- [ ] Environment decisions frozen
- [ ] Base `.env` values confirmed
- [ ] Initial super admin seed values confirmed
- [ ] Local setup run and verified
- [ ] Phase 2 kickoff approved

## How you should send data

Reply in this exact format:

```text
AWS region:
Backend compute:
Environment strategy:
Super admin name:
Super admin contact:
Default geofence radius:
Late threshold:
Notification mode:
```
