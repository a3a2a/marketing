import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  DISPLAY_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/auth/session";
import type { AuthenticatedUser } from "@/auth/credentials";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Signs a session for `user` and sets it as an httpOnly cookie, plus a
 * plain-text companion cookie (email only) the nav bar can read client-side.
 * Call this from a Server Action after verifyCredentials() succeeds.
 */
export async function createSession(user: AuthenticatedUser): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const token = await createSessionToken({ uid: user.id, email: user.email, exp });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  cookieStore.set(DISPLAY_COOKIE_NAME, user.email, {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Clears both the session and display cookies. Call this on logout. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(DISPLAY_COOKIE_NAME);
}

/** Reads and verifies the current request's session, for use in Server Components/Actions. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
