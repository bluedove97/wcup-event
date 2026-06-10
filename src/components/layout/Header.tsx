'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setUserName(data?.userName ?? null); })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUserName(null);
    router.push('/login');
  };

  return (
    <header style={{ backgroundColor: 'var(--navy-dark)', borderBottom: '1px solid var(--navy-light)' }}>
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">⚽</span>
          <div>
            <div style={{ color: 'var(--gold)', fontSize: '0.7rem', letterSpacing: '0.15em', fontWeight: 700 }}>
              2026 FIFA WORLD CUP
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>
              월드컵 기념 만원빵 이벤트
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {userName ? (
            <>
              <nav className="flex gap-2">
                <Link
                  href="/betting"
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{
                    backgroundColor: pathname === '/betting' ? 'var(--gold)' : 'var(--navy-light)',
                    color: pathname === '/betting' ? 'var(--navy-dark)' : 'var(--text-primary)',
                  }}
                >
                  베팅하기
                </Link>
                <Link
                  href="/my-bets"
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{
                    backgroundColor: pathname === '/my-bets' ? 'var(--emerald)' : 'var(--navy-light)',
                    color: pathname === '/my-bets' ? 'var(--navy-dark)' : 'var(--text-primary)',
                  }}
                >
                  내 베팅 조회
                </Link>
              </nav>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{userName}님</span>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '0.4rem',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-muted)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,80,80,0.15)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#ff8080';
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                  }}
                >
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                backgroundColor: 'var(--gold)',
                color: 'var(--navy-dark)',
              }}
            >
              참여하기
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
