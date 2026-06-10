import { NextResponse } from 'next/server';

export async function GET() {
  const users = (process.env.ALLOWED_USERS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return NextResponse.json({ users });
}
