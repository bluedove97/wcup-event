import { NextResponse } from 'next/server';
import { USER_SESSION_COOKIE } from '@/lib/userSession';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(USER_SESSION_COOKIE, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
