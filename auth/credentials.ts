import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * Verifies an email/password pair against the seeded `User` table
 * (see prisma/schema.prisma + prisma/seed.ts). Returns the matching user on
 * success, or null on any failure (unknown email, wrong password, etc).
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<AuthenticatedUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return null;

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return null;

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return null;

  return { id: user.id, email: user.email };
}
