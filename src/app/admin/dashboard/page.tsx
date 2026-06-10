'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LogoutButton from './LogoutButton';

interface BettingRow {
  id: number;
  sso_login_id: string;
  game_id: number;
  betting: 'W' | 'D' | 'L';
  create_by: string;
  game_cont: string;
}

interface GameStat {
  game_id: number;
  cont: string;
  home: string | null;
  away: string | null;
  open_yn: string | null;
  start_dt: string | null;
  total: number;
  win_count: number;
  draw_count: number;
  loss_count: number;
}

const BETTING_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  W: { label: '승', color: '#00C896', bg: 'rgba(0,200,150,0.15)' },
  D: { label: '무', color: '#C9A84C', bg: 'rgba(201,168,76,0.15)' },
  L: { label: '패', color: '#ff6b6b', bg: 'rgba(255,107,107,0.15)' },
};

function formatDate(dt: string | null): string {
  if (!dt) return '';
  const d = new Date(dt);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]}) ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [bettings, setBettings] = useState<BettingRow[]>([]);
  const [stats, setStats] = useState<GameStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGame, setSelectedGame] = useState<number | null>(null);

  const fetchData = useCallback(async (gameId?: number) => {
    setLoading(true);
    setError('');
    try {
      const url = gameId ? `/api/admin/bettings?game_id=${gameId}` : '/api/admin/bettings';
      const res = await fetch(url);
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      setBettings(data.bettings ?? []);
      setStats(data.stats ?? []);
    } catch {
      setError('데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleGameFilter(gameId: number | null) {
    setSelectedGame(gameId);
    fetchData(gameId ?? undefined);
  }

  // game_id → 순서 번호 매핑
  const gameIndexMap = Object.fromEntries(stats.map((s, i) => [s.game_id, i + 1]));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <div
              style={{
                display: 'inline-block',
                padding: '0.2rem 0.75rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.25)',
                color: 'var(--gold)',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
              }}
            >
              ADMIN
            </div>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 800 }}>
              베팅 관리 대시보드
            </h1>
          </div>
          <LogoutButton />
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(stats.length, 1)}, 1fr)`, gap: '1rem', marginBottom: '1.5rem' }}>
          {loading && stats.length === 0
            ? [1, 2, 3].map((n) => (
                <div
                  key={n}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.4rem' }}>로딩 중...</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.125rem' }}>-</div>
                </div>
              ))
            : stats.map((stat, idx) => {
                const isOpen = stat.open_yn === 'Y';
                return (
                  <div
                    key={stat.game_id}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: selectedGame === stat.game_id
                        ? '1px solid var(--gold)'
                        : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '0.75rem',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onClick={() => handleGameFilter(selectedGame === stat.game_id ? null : stat.game_id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>제{idx + 1}경기</span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '9999px',
                          backgroundColor: isOpen ? 'rgba(0,200,150,0.15)' : 'rgba(255,255,255,0.06)',
                          color: isOpen ? 'var(--emerald)' : 'var(--text-muted)',
                        }}
                      >
                        {isOpen ? '오픈' : '마감'}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                      {stat.home ?? '홈팀'} vs {stat.away ?? '어웨이팀'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.6rem' }}>
                      {formatDate(stat.start_dt)}
                    </div>
                    <div style={{ color: 'var(--emerald)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                      {stat.total}명 참여
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <span style={{ color: '#00C896' }}>승 {stat.win_count}</span>
                      <span style={{ color: 'var(--gold)' }}>무 {stat.draw_count}</span>
                      <span style={{ color: '#ff6b6b' }}>패 {stat.loss_count}</span>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Table card */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>
                베팅 목록
              </h2>
              <span
                style={{
                  padding: '0.15rem 0.6rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(0,200,150,0.15)',
                  color: 'var(--emerald)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {bettings.length}건
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* 전체 버튼 */}
              <button
                onClick={() => handleGameFilter(null)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.4rem',
                  backgroundColor: selectedGame === null ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                  color: selectedGame === null ? 'var(--navy-dark)' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                전체
              </button>
              {/* DB에서 가져온 게임별 필터 버튼 */}
              {stats.map((stat, idx) => (
                <button
                  key={stat.game_id}
                  onClick={() => handleGameFilter(stat.game_id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '0.4rem',
                    backgroundColor: selectedGame === stat.game_id ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                    color: selectedGame === stat.game_id ? 'var(--navy-dark)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  제{idx + 1}경기
                </button>
              ))}
              <button
                onClick={() => fetchData(selectedGame ?? undefined)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.4rem',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                }}
              >
                새로고침
              </button>
            </div>
          </div>

          {/* Table body */}
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              불러오는 중...
            </div>
          ) : error ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#ff8080' }}>{error}</div>
          ) : bettings.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              베팅 내역이 없습니다.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(255,255,255,0.025)' }}>
                    {['경기', '사번 / ID', '베팅 결과', '접수 일시'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '0.75rem 1.25rem',
                          textAlign: 'left',
                          color: 'var(--text-muted)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bettings.map((row, idx) => {
                    const bet = BETTING_STYLE[row.betting] ?? { label: row.betting, color: '#fff', bg: 'rgba(255,255,255,0.1)' };
                    const date = row.create_by
                      ? new Date(row.create_by).toLocaleString('ko-KR', {
                          year: 'numeric', month: '2-digit', day: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : '-';
                    const gameIdx = gameIndexMap[row.game_id] ?? row.game_id;
                    return (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom: idx < bettings.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                          backgroundColor: idx % 2 === 1 ? 'rgba(255,255,255,0.012)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '0.3rem',
                                backgroundColor: 'rgba(26,39,68,0.8)',
                                color: 'var(--gold)',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                width: 'fit-content',
                              }}
                            >
                              제{gameIdx}경기
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {row.game_cont}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>
                          {row.sso_login_id}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.75rem',
                              borderRadius: '9999px',
                              backgroundColor: bet.bg,
                              color: bet.color,
                              fontWeight: 700,
                              fontSize: '0.875rem',
                            }}
                          >
                            {bet.label} ({row.betting})
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
