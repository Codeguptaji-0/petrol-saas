# EC2 Setup (Option B) – Step-by-Step (Mumbai `ap-south-1`)

Goal: Run **NestJS API + Socket + Worker + Redis** on EC2 and use **RDS PostgreSQL** for database.

## A) Create Security Groups (Important)

### 1) Security Group: `pp-saas-app-sg` (for EC2)
- **Inbound**
  - SSH: TCP 22 from **your IP only** (recommended)
  - HTTP: TCP 80 from `0.0.0.0/0`
  - HTTPS: TCP 443 from `0.0.0.0/0`
  - (Optional for testing) App port 3000 from your IP only (don’t open publicly in production)
- **Outbound**
  - Allow all outbound

### 2) Security Group: `pp-saas-db-sg` (for RDS)
- **Inbound**
  - PostgreSQL: TCP 5432 **ONLY from** `pp-saas-app-sg`
- **Outbound**
  - Allow all outbound

This keeps DB private and accessible only by your app server.

---

## B) Create RDS PostgreSQL (Database)

1. AWS Console → **RDS** → Create database
2. Engine: **PostgreSQL**
3. Template:
   - Staging: Dev/Test
   - Production: Production (Multi-AZ recommended)
4. DB instance identifier:
   - `pp-saas-staging-db` and `pp-saas-prod-db`
5. Username/password: set strong values (save safely)
6. Network:
   - VPC default (ok for start) or your custom VPC
   - Public access: **No** (recommended)
   - Security group: select `pp-saas-db-sg`
7. Create DB

After creation, copy:
- RDS endpoint host
- DB name
- username/password

---

## C) Create EC2 Instance (App Server)

1. AWS Console → **EC2** → Launch instance
2. Name:
   - Staging: `pp-saas-staging-app`
   - Production: `pp-saas-prod-app`
3. AMI: **Ubuntu 22.04 LTS**
4. Instance type:
   - Cheapest start: `t3.micro` (or free-tier eligible where possible)
   - If traffic grows: `t3.small` or higher
5. Key pair: create/download `.pem` (keep safe)
6. Network settings:
   - Attach `pp-saas-app-sg`
7. Storage: 20–30 GB gp3 is enough for start
8. Launch instance

---

## D) Attach a Static IP (Elastic IP)

1. EC2 → Elastic IPs → Allocate Elastic IP
2. Associate it to your EC2 instance

This avoids IP changing when instance restarts.

---

## E) Login to EC2 (SSH)

On your PC (PowerShell example):

```bash
ssh -i path/to/key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

## F) Install Docker + Docker Compose

Run these on EC2 (Ubuntu):

```bash
sudo apt update -y
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update -y
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu
newgrp docker
docker --version
docker compose version
```

---

## G) Deploy Backend on EC2 (Recommended Approach)

### Option 1 (Simplest): copy repo and run Docker build
1. Install git:
```bash
sudo apt install -y git
```
2. Clone repo:
```bash
git clone <your-repo-url>
cd "fuel managemt system curce"/backend
```
3. Create `.env` with RDS connection:
```text
DATABASE_URL=postgresql://<user>:<pass>@<rds-endpoint>:5432/<db>?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=<strong>
AWS_REGION=ap-south-1
AWS_S3_BUCKET=<bucket>
```
4. Start Redis locally (docker):
```bash
docker run -d --name redis -p 6379:6379 redis:7
```
5. Install and run:
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
NODE_ENV=production npm run start
```

### Option 2 (Best): Dockerize backend + use Nginx reverse proxy
(Recommended for production; we can implement this in Phase 2/3.)

---

## H) HTTPS (Domain + SSL)

If you have a domain:
1. Point domain A record to Elastic IP
2. Install Nginx + certbot:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```
3. Configure Nginx reverse proxy to your Node port (e.g. 3000)
4. Run:
```bash
sudo certbot --nginx
```

---

## I) Staging + Production Strategy (simple)

Recommended:
- **Two EC2 instances**: one staging, one production
- **Two RDS databases**: one staging, one production
- Two subdomains:
  - `staging-api.yourdomain.com`
  - `api.yourdomain.com`

---

## If you want, I can do it with you “click-by-click”

Tell me:
- Do you have a domain already?
- Do you want 1 EC2 (staging+prod together) or 2 EC2 (recommended)?
