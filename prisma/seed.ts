// Seeds the single admin account used for credential-based login.
//
// Usage: npm run seed
// Reads ADMIN_EMAIL / ADMIN_PASSWORD from the environment. If either is
// unset, falls back to admin@example.com / changeme123 and prints a warning
// so the operator knows to set them (especially before any real deployment).

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = "changeme123";

async function main() {
  const usingDefaultEmail = !process.env.ADMIN_EMAIL;
  const usingDefaultPassword = !process.env.ADMIN_PASSWORD;

  const email = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  if (usingDefaultEmail || usingDefaultPassword) {
    console.warn(
      "[seed] ADMIN_EMAIL and/or ADMIN_PASSWORD are not set — falling back to " +
        `default admin credentials (${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}). ` +
        "Set both environment variables before deploying anywhere real."
    );
  }

  const existing = await prisma.user.findFirst();
  if (existing) {
    console.log(`[seed] A User already exists (${existing.email}) — skipping admin creation.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  console.log(`[seed] Created admin User ${user.email} (id: ${user.id}).`);
}

main()
  .catch((err) => {
    console.error("[seed] Failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
