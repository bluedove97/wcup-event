import { NextRequest, NextResponse } from 'next/server';
import { createUserSessionToken, USER_SESSION_COOKIE } from '@/lib/userSession';

export async function POST(request: NextRequest) {
  const { name } = await request.json();

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 });
  }

  const allowedUsers = (process.env.ALLOWED_USERS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!allowedUsers.includes(name.trim())) {
    return NextResponse.json({ error: '등록된 참여자가 아닙니다.' }, { status: 401 });
  }

  const token = createUserSessionToken(name.trim());
  const response = NextResponse.json({ success: true, userName: name.trim() });
  response.cookies.set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60,
    path: '/',
  });

  return response;
}
