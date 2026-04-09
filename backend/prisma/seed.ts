import { PrismaClient, RoleCode } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const token = process.env.BOOTSTRAP_TOKEN;
  const tenantName = process.env.SEED_TENANT_NAME;
  const adminFullName = process.env.SEED_ADMIN_FULL_NAME;
  const adminPhone = process.env.SEED_ADMIN_PHONE;
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!token || !tenantName || !adminFullName || !adminPhone || !adminPassword) {
    console.log(
      "Seed skipped. Provide BOOTSTRAP_TOKEN, SEED_TENANT_NAME, SEED_ADMIN_FULL_NAME, SEED_ADMIN_PHONE, SEED_ADMIN_PASSWORD (and optional SEED_ADMIN_EMAIL)."
    );
    return;
  }

  const already = await prisma.user.findFirst({ where: { role: RoleCode.ADMIN } });
  if (already) {
    console.log("Seed skipped (admin user already exists).");
    return;
  }

  const tenant = await prisma.tenant.create({ data: { name: tenantName } });
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      fullName: adminFullName,
      phone: adminPhone,
      email: adminEmail ?? null,
      passwordHash,
      role: RoleCode.ADMIN,
      isActive: true
    }
  });

  console.log(`Seeded tenant=${tenant.id} admin=${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

