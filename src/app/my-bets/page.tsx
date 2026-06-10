'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Betting } from '@/types';

const BETTING_LABEL: Record<string, { label: string; color: string }> = {
  W: { label: '승', color: '#00C896' },
  D: { label: '무', color: '#C9A84C' },
  L: { label: '패', color: '#FF6B6B' },
};

export default function MyBetsPage() {
  const [userName, setUserName] = useState('');
  const [bettings, setBettings] = useState<Betting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.userName) return;
        setUserName(data.userName);
        return fetch(`/api/betting?sso_login_id=${encodeURIComponent(data.userName)}`);
      })
      .then((r) => (r ? r.json() : null))
      .then((data) => {
        if (data?.bettings) setBettings(data.bettings);
        else if (data?.error) setError(data.error);
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
        내 베팅 조회
      </h1>
      <p className="mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
        {userName ? (
          <>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{userName}</span>님의 베팅 내역입니다.
          </>
        ) : (
          '베팅 내역을 불러오는 중입니다.'
        )}
      </p>

      {loading && (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          조회 중...
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg text-sm mb-4" style={{ backgroundColor: 'rgba(255,80,80,0.1)', color: '#ff8080' }}>
          {error}
        </div>
      )}

      {!loading && !error && bettings.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">📋</div>
          <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {userName}
          </div>
          <div className="text-sm">아직 베팅한 경기가 없습니다.</div>
          <Link
            href="/betting"
            className="inline-block mt-4 px-6 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'var(--gold)', color: 'var(--navy-dark)' }}
          >
            베팅하러 가기
          </Link>
        </div>
      )}

      {bettings.length > 0 && (
        <div>
          <div className="text-sm mb-3 font-semibold" style={{ color: 'var(--text-muted)' }}>
            총{' '}
            <span style={{ color: 'var(--emerald)' }}>{bettings.length}경기</span> 베팅 완료
          </div>
          <div className="grid gap-3">
            {bettings.map((b) => {
              const opt = BETTING_LABEL[b.betting] || { label: b.betting, color: '#888' };
              return (
                <div
                  key={b.id}
                  className="p-4 rounded-xl flex items-center justify-between"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {b.game_cont}
                    </div>
                  </div>
                  <div
                    className="px-4 py-2 rounded-lg font-black text-lg"
                    style={{
                      backgroundColor: `${opt.color}20`,
                      color: opt.color,
                      border: `1px solid ${opt.color}50`,
                    }}
                  >
                    {opt.label}
                  </div>
                </div>
              );
            })}
          </div>

          {bettings.length < 3 && (
            <div className="mt-6 text-center">
              <Link
                href="/betting"
                className="inline-block px-6 py-2 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: 'var(--navy-light)', color: 'var(--text-primary)' }}
              >
                나머지 경기 베팅하기 →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
