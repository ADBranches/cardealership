const developmentOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'];

export function resolveRuntimeSecurity(environment = process.env) {
  const production = environment.NODE_ENV === 'production';
  const secret = environment.JWT_SECRET;
  if (production && (typeof secret !== 'string' || Buffer.byteLength(secret, 'utf8') < 32 || !secret.trim() || /^(.)\1+$/s.test(secret) || /^(replace|change|example|your[_-])/i.test(secret))) {
    throw new Error('Production requires a securely generated JWT_SECRET of at least 32 bytes.');
  }
  const configuredOrigins = (environment.CORS_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
  if (production && configuredOrigins.length === 0) throw new Error('Production requires CORS_ALLOWED_ORIGINS.');
  const origins = configuredOrigins.length ? configuredOrigins : developmentOrigins;
  for (const origin of origins) {
    let url;
    try { url = new URL(origin); } catch { throw new Error('CORS_ALLOWED_ORIGINS must contain valid origins.'); }
    if (!['http:', 'https:'].includes(url.protocol) || (production && url.protocol !== 'https:') || url.origin !== origin || url.username || url.password) {
      throw new Error('CORS_ALLOWED_ORIGINS must contain exact HTTP(S) origins; production requires HTTPS.');
    }
  }
  return Object.freeze({ origins: Object.freeze([...new Set(origins)]) });
}

export function resolveAdministratorReset(environment = process.env) {
  const email = (environment.ADMIN_RESET_EMAIL || '').trim().toLowerCase();
  const password = environment.ADMIN_RESET_PASSWORD;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('ADMIN_RESET_EMAIL is required and must be a valid email.');
  if (typeof password !== 'string' || password.length < 14 || Buffer.byteLength(password, 'utf8') > 72 || !password.trim()) {
    throw new Error('ADMIN_RESET_PASSWORD must be at least 14 characters and no more than 72 UTF-8 bytes.');
  }
  return { email, password };
}
