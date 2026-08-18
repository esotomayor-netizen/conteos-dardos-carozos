import { createHash, timingSafeEqual } from "node:crypto";

export const COOKIE_NAME = "crm_session";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function buildToken(password: string): string {
  return createHash("sha256").update(`crm-access:${password}`).digest("hex");
}

export function checkPassword(input: string): boolean {
  const expected = process.env.CRM_ACCESS_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

export function sessionTokenFor(password: string): string {
  return buildToken(password);
}

export function isValidSessionToken(token: string | undefined): boolean {
  const expected = process.env.CRM_ACCESS_PASSWORD;
  if (!expected || !token) return false;
  return safeEqual(token, buildToken(expected));
}
