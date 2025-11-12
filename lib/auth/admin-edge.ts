import { getAdminUsers, SESSION_SECRET } from "./admin-config";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const encoder = new TextEncoder();

async function computeSignature(payload: string) {
  if (!SESSION_SECRET) return null;
  const keyData = encoder.encode(SESSION_SECRET);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const bytes = Array.from(new Uint8Array(signatureBuffer));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifySessionTokenEdge(token: string | undefined) {
  if (!token || !SESSION_SECRET) return null;
  const parsed = parseToken(token);
  if (!parsed) return null;
  const { email, timestamp, signature } = parsed;

  const expectedSignature = await computeSignature(`${email}:${timestamp}`);
  if (!expectedSignature || expectedSignature !== signature) return null;

  const issuedAt = Number(timestamp);
  if (Number.isNaN(issuedAt) || Date.now() - issuedAt > SESSION_DURATION_MS) {
    return null;
  }

  const isKnownAdmin = getAdminUsers().some(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );
  return isKnownAdmin ? email : null;
}

function parseToken(token: string) {
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;
  const payload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const colonIndex = payload.lastIndexOf(":");
  if (colonIndex === -1) return null;
  const email = payload.slice(0, colonIndex);
  const timestamp = payload.slice(colonIndex + 1);
  if (!email || !timestamp || !signature) return null;
  return { email, timestamp, signature };
}
