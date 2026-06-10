import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({ message: '로그아웃 완료' });
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
