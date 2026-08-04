// Pure, runtime-agnostic session token helpers built on the Web Crypto API
// (available in both the Node.js and Edge runtimes) so this module is safe
// to import from middleware.ts no matter which runtime it ends up running
// under. On purpose, this file avoids:
//   - Node-only APIs (Buffer, node:crypto)
//   - Next.js request-scoped APIs (next/headers)
//   - Anything that needs a database connection (@prisma/client)
// Cookie-reading/writing lives in auth/cookies.ts; credential checks live in
// auth/credentials.ts.

export const SESSION_COOKIE_NAME = "session";
// Non-httpOnly companion cookie that mirrors the signed-in user's email so
// the (client-side) nav bar can display it without a server round trip.
// It carries no authentication weight — the httpOnly `session` cookie above
// is the only thing middleware actually verifies.
export const DISPLAY_COOKIE_NAME = "session_user";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  uid: string;
  email: string;
  exp: number; // unix seconds
}

// Fallback so the app keeps working fully offline with zero setup, mirroring
// prisma/seed.ts's ADMIN_EMAIL/ADMIN_PASSWORD fallback pattern. Set
// SESSION_SECRET in the environment before deploying anywhere real.
const DEV_FALLBACK_SECRET = "dev-only-insecure-session-secret-change-me";

function getSecret(): string {
  return process.env.SESSION_SECRET || DEV_FALLBACK_SECRET;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

let cachedKeyPromise: Promise<CryptoKey> | null = null;

function getKey(): Promise<CryptoKey> {
  if (!cachedKeyPromise) {
    cachedKeyPromise = crypto.subtle.importKey(
      "raw",
      textEncoder.encode(getSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
  }
  return cachedKeyPromise;
}

/** Creates a signed, self-contained session token: `<payload>.<signature>`. */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const key = await getKey();
  const payloadB64 = toBase64Url(textEncoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payloadB64));
  const signatureB64 = toBase64Url(new Uint8Array(signature));
  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verifies a session token's HMAC signature and expiry.
 * Returns the decoded payload on success, or null if missing/invalid/expired.
 */
export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;

  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex === -1) return null;

  const payloadB64 = token.slice(0, separatorIndex);
  const signatureB64 = token.slice(separatorIndex + 1);

  try {
    const key = await getKey();
    const signatureBytes = fromBase64Url(signatureB64);
    // crypto.subtle.verify performs the signature comparison internally
    // (constant-time), so we never need to compare raw bytes ourselves.
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      textEncoder.encode(payloadB64),
    );
    if (!valid) return null;

    const payload = JSON.parse(textDecoder.decode(fromBase64Url(payloadB64))) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
