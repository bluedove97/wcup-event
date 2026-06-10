import { createHmac } from 'crypto';

const SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours
export const SESSION_COOKIE = 'admin_session';

export function createSessionToken(userId: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET!;
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = JSON.stringify({ userId, expiresAt });
  const hmac = createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}.${hmac}`).toString('base64url');
}

export function verifySessionToken(token: string): { userId: string } | null {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET!;
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const lastDot = decoded.lastIndexOf('.');
    if (lastDot === -1) return null;
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    if (sig !== expected) return null;
    const { userId, expiresAt } = JSON.parse(payload);
    if (Date.now() > expiresAt) return null;
    return { userId };
  } catch {
    return null;
  }
}
