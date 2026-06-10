import { createHmac } from 'crypto';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
export const USER_SESSION_COOKIE = 'user_session';

export function createUserSessionToken(userName: string): string {
  const secret = process.env.USER_SESSION_SECRET!;
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = JSON.stringify({ userName, expiresAt });
  const hmac = createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}.${hmac}`).toString('base64url');
}

export function verifyUserSessionToken(token: string): { userName: string } | null {
  try {
    const secret = process.env.USER_SESSION_SECRET!;
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const lastDot = decoded.lastIndexOf('.');
    if (lastDot === -1) return null;
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    if (sig !== expected) return null;
    const { userName, expiresAt } = JSON.parse(payload);
    if (Date.now() > expiresAt) return null;
    return { userName };
  } catch {
    return null;
  }
}
