import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { id, password } = await request.json();

    const adminId = process.env.ADMIN_ID;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminId || !adminPassword) {
      return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 });
    }

    if (id !== adminId || password !== adminPassword) {
      return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    const token = createSessionToken(id);
    const response = NextResponse.json({ message: '로그인 성공' });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 4 * 60 * 60,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: '로그인 처리 중 오류 발생' }, { status: 500 });
  }
}
