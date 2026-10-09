import crypto from "node:crypto";

export function hashAuthToken(token) {
  return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}

export function createEmailVerificationToken(now = Date.now()) {
  const token = crypto.randomBytes(32).toString("base64url");
  const ttlMinutes = Number(process.env.AUTH_VERIFICATION_TOKEN_TTL_MINUTES || 30);
  return { token, tokenHash: hashAuthToken(token), expiresAt: new Date(now + ttlMinutes * 60_000) };
}

export function isVerificationTokenShapeValid(token) {
  return typeof token === "string" && /^[A-Za-z0-9_-]{40,100}$/.test(token);
}
