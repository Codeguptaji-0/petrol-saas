# AWS Deployment Reference

## Services

- Flutter web: S3 + CloudFront
- Backend API + Socket + worker: ECS Fargate (3 services)
- DB: RDS PostgreSQL (Multi-AZ in production)
- Cache/Queue: ElastiCache Redis
- Files: S3 (private) + pre-signed URLs
- Face recognition: AWS Rekognition
- Secrets: AWS Secrets Manager
- Monitoring: CloudWatch logs/alarms + AWS X-Ray

## Core Security Defaults

- Private subnets for ECS tasks and RDS
- Public ALB only
- WAF attached to ALB
- KMS encryption for RDS and S3
- Least privilege IAM roles for task execution

## Suggested CI/CD

- GitHub Actions -> build/test -> push Docker image to ECR
- Deploy ECS service with rolling updates
- Run Prisma migrations in release pipeline before API deploy
