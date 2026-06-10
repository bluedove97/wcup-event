import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { USER_SESSION_COOKIE, verifyUserSessionToken } from '@/lib/userSession';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ userName: null }, { status: 401 });
  }

  const session = verifyUserSessionToken(token);
  if (!session) {
    return NextResponse.json({ userName: null }, { status: 401 });
  }

  return NextResponse.json({ userName: session.userName });
}
