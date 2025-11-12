import crypto from "crypto";
import { getAdminUsers, hasAdminUsers as hasAdmins, SESSION_SECRET } from "./admin-config";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function validateAdminCredentials(email: string, password: string) {
  return getAdminUsers().some(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );
}

export function hasAdminUsers() {
  return hasAdmins();
}

export function createSessionToken(email: string) {
  if (!SESSION_SECRET) {
    throw new Error("ADMIN_SESSION_SECRET is not defined");
  }
  const payload = `${email}:${Date.now()}`;
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token || !SESSION_SECRET) return null;
  const parsed = parseToken(token);
  if (!parsed) return null;
  const { email, timestamp, signature } = parsed;

  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${email}:${timestamp}`)
    .digest("hex");

  if (expectedSignature !== signature) return null;

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
