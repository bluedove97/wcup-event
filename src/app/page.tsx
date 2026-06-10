'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Game, Betting, BettingChoice } from '@/types';

function resolveImg(img: string): string {
  if (img.startsWith('/') || img.startsWith('http')) return img;
  return `/images/${img}`;
}

function formatDate(dt: string | null): string {
  if (!dt) return '';
  const d = new Date(dt);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]}) ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [rulesOpen, setRulesOpen] = useState(false);
  const [modalGameId, setModalGameId] = useState<number | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalBettings, setModalBettings] = useState<Betting[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalActualResult, setModalActualResult] = useState<BettingChoice | null>(null);

  function getActualResult(game: Game): BettingChoice | null {
    const hs = game.home_score;
    const as_ = game.away_score;
    if (!hs || !as_) return null;
    const h = parseInt(hs), a = parseInt(as_);
    if (isNaN(h) || isNaN(a)) return null;
    if (h > a) return 'W';
    if (h === a) return 'D';
    return 'L';
  }

  async function openModal(game: Game, idx: number) {
    setModalGameId(game.game_id);
    setModalTitle(`제${idx + 1}경기 — ${game.home ?? '홈팀'} vs ${game.away ?? '어웨이팀'}`);
    setModalActualResult(getActualResult(game));
    setModalBettings([]);
    setModalLoading(true);
    try {
      const res = await fetch(`/api/betting?game_id=${game.game_id}`);
      const data = await res.json();
      setModalBettings(data.bettings ?? []);
    } catch {
      // ignore
    } finally {
      setModalLoading(false);
    }
  }

  function closeModal() {
    setModalGameId(null);
  }

  useEffect(() => {
    fetch('/api/games')
      .then((r) => r.json())
      .then((data) => {
        if (data.games) setGames(data.games);
        else setError('게임 목록을 불러오지 못했습니다.');
      })
      .catch(() => setError('서버 연결에 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* 히어로 섹션 */}
      <section className="text-center mb-12">
        <div
          className="inline-block px-4 py-1 rounded-full text-xs font-bold mb-4 tracking-widest"
          style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)' }}
        >
          2026 FIFA WORLD CUP · GROUP A
        </div>
        <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          대한민국 경기 결과 예측
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="text-base mb-8">
          A조 예선 3경기의 승 / 무 / 패를 예측하고 이벤트에 참여하세요
        </p>
        <Link
          href="/betting"
          className="inline-block px-8 py-3 rounded-xl font-bold text-base"
          style={{
            backgroundColor: 'var(--gold)',
            color: 'var(--navy-dark)',
            boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--gold-light)';
            (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.02)';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--gold)';
            (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
          }}
        >
          지금 베팅하기 →
        </Link>
      </section>

      {/* 경기 카드 목록 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-muted)' }}>
            경기 일정
          </h2>
          <button
            onClick={() => setRulesOpen(true)}
            style={{
              padding: '0.35rem 0.9rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.3)',
              color: 'var(--gold)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(201,168,76,0.2)'; }}
            onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(201,168,76,0.1)'; }}
          >
            게임방법
          </button>
        </div>

        {loading && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            불러오는 중...
          </div>
        )}

        {error && (
          <div className="text-center py-8 rounded-xl" style={{ backgroundColor: 'rgba(255,80,80,0.1)', color: '#ff8080' }}>
            {error}
          </div>
        )}

        <div className="grid gap-4">
          {games.map((game, idx) => {
            const isOpen = game.open_yn === 'Y';
            const homeImg = game.home_img ? resolveImg(game.home_img) : null;
            const awayImg = game.away_img ? resolveImg(game.away_img) : null;
            const homeName = game.home ?? '홈팀';
            const awayName = game.away ?? '어웨이팀';
            const hasScore = game.home_score != null && game.home_score !== '' &&
                             game.away_score != null && game.away_score !== '';

            return (
              <div
                key={game.game_id}
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  opacity: isOpen ? 1 : 0.75,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(26,39,68,0.8)', color: 'var(--gold)' }}
                    >
                      제{idx + 1}경기
                    </span>
                    {isOpen ? (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(0,200,150,0.15)', color: 'var(--emerald)', border: '1px solid rgba(0,200,150,0.3)' }}
                      >
                        베팅 오픈
                      </span>
                    ) : (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        베팅 마감
                      </span>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(game.start_dt)}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-6 mb-4">
                  {/* 홈팀 */}
                  <div className="text-center">
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'center' }}>
                      {homeImg != null ? (
                        <Image
                          src={homeImg}
                          alt={homeName}
                          width={80}
                          height={53}
                          style={{ borderRadius: '4px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                        />
                      ) : (
                        <div style={{ width: 80, height: 53, backgroundColor: 'var(--navy)', borderRadius: 4 }} />
                      )}
                    </div>
                    <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{homeName}</div>
                  </div>

                  {/* 스코어 or VS */}
                  <div
                    className="px-4 py-2 rounded-xl font-black text-lg"
                    style={{ backgroundColor: 'var(--navy)', color: hasScore ? 'var(--text-primary)' : 'var(--gold)', minWidth: '70px', textAlign: 'center' }}
                  >
                    {hasScore ? `${game.home_score} : ${game.away_score}` : 'VS'}
                  </div>

                  {/* 어웨이팀 */}
                  <div className="text-center">
                    <div className="mb-2" style={{ display: 'flex', justifyContent: 'center' }}>
                      {awayImg != null ? (
                        <Image
                          src={awayImg}
                          alt={awayName}
                          width={80}
                          height={53}
                          style={{ borderRadius: '4px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                        />
                      ) : (
                        <div style={{ width: 80, height: 53, backgroundColor: 'var(--navy)', borderRadius: 4 }} />
                      )}
                    </div>
                    <div className="font-bold" style={{ color: 'var(--text-muted)' }}>{awayName}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    참여자 수:{' '}
                    {!isOpen && (game.betting_count ?? 0) > 0 ? (
                      <button
                        onClick={() => openModal(game, idx)}
                        style={{
                          color: 'var(--emerald)',
                          fontWeight: 700,
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: 'inherit',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          textUnderlineOffset: '2px',
                        }}
                      >
                        {game.betting_count}명
                      </button>
                    ) : (
                      <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>{game.betting_count ?? 0}명</span>
                    )}
                  </span>
                  {isOpen ? (
                    <Link
                      href={`/betting?game=${game.game_id}`}
                      className="px-4 py-2 rounded-lg text-sm font-semibold"
                      style={{ backgroundColor: 'var(--navy-light)', color: 'var(--text-primary)' }}
                      onMouseOver={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--emerald)';
                        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--navy-dark)';
                      }}
                      onMouseOut={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--navy-light)';
                        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)';
                      }}
                    >
                      이 경기 베팅하기
                    </Link>
                  ) : (
                    <span
                      className="px-4 py-2 rounded-lg text-sm font-semibold"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                    >
                      베팅 마감
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 게임방법 팝업 */}
      {rulesOpen && (
        <div
          onClick={() => setRulesOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1rem',
              width: '100%', maxWidth: '520px',
              maxHeight: '85vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            {/* 헤더 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}>
              <div>
                <div style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                  HOW TO PLAY
                </div>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>
                  게임 방법
                </h3>
              </div>
              <button
                onClick={() => setRulesOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: 'none',
                  color: 'var(--text-muted)', borderRadius: '0.5rem',
                  width: '2rem', height: '2rem', cursor: 'pointer',
                  fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* 본문 */}
            <div style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                {
                  num: 1,
                  text: '모든 참여자는 본인이 원하는 경우에만 이벤트에 참여합니다.',
                  sub: '본인 이름으로 로그인 하시면 됩니다.',
                },
                {
                  num: 2,
                  text: '예선 1경기마다 만원(+α)의 참가비가 발생합니다.',
                  sub: '김보람 프로에게 선납 해주세요',
                },
                {
                  num: 3,
                  text: '게임 방법은 승 / 무 / 패를 맞추는 방식입니다.',
                  sub: '낙장불입. 신중하게 고르세요.',
                },
                {
                  num: 4,
                  text: '경기가 끝나고 나면 수동으로 정산을 해줄 예정입니다.',
                  example: true,
                },
                {
                  num: 5,
                  text: '도박 아닙니다. 유희입니다.',
                },
              ].map((item) => (
                <div key={item.num} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                  <span style={{
                    flexShrink: 0,
                    width: '1.6rem', height: '1.6rem',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(201,168,76,0.15)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    color: 'var(--gold)',
                    fontWeight: 800, fontSize: '0.75rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.num}
                  </span>
                  <div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                      {item.text}
                    </p>
                    {item.sub && (
                      <p style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600, margin: '0.2rem 0 0' }}>
                        {item.sub}
                      </p>
                    )}
                    {item.example && (
                      <div style={{
                        marginTop: '0.6rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.7, margin: 0 }}>
                          예시) 1경기 베팅이 승 3, 무 2, 패 3 이라고 할 때<br />
                          판돈은 <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>8만원</span><br />
                          경기 결과를 맞추는 팀이 8만원을 <span style={{ color: 'var(--gold)', fontWeight: 700 }}>N빵</span>하는 구조입니다.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 베팅 현황 팝업 */}
      <style>{`
        @keyframes crownSparkle {
          0%   { transform: scale(1) rotate(-8deg);  filter: drop-shadow(0 0 2px rgba(255,215,0,0.5)); }
          20%  { transform: scale(1.35) rotate(6deg);  filter: drop-shadow(0 0 10px rgba(255,215,0,1)) drop-shadow(0 0 20px rgba(255,165,0,0.9)); }
          40%  { transform: scale(1.1) rotate(-4deg); filter: drop-shadow(0 0 5px rgba(255,215,0,0.7)); }
          60%  { transform: scale(1.3) rotate(8deg);  filter: drop-shadow(0 0 12px rgba(255,215,0,1)) drop-shadow(0 0 24px rgba(255,200,0,0.8)); }
          80%  { transform: scale(1.05) rotate(-2deg); filter: drop-shadow(0 0 4px rgba(255,215,0,0.6)); }
          100% { transform: scale(1) rotate(-8deg);  filter: drop-shadow(0 0 2px rgba(255,215,0,0.5)); }
        }
        .crown-sparkle {
          animation: crownSparkle 1.8s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>
      {modalGameId !== null && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            {/* 모달 헤더 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  베팅 현황
                </div>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1rem', margin: 0 }}>
                  {modalTitle}
                </h3>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  color: 'var(--text-muted)',
                  borderRadius: '0.5rem',
                  width: '2rem',
                  height: '2rem',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* 집계 요약 */}
            {!modalLoading && modalBettings.length > 0 && (() => {
              const wCount = modalBettings.filter(b => b.betting === 'W').length;
              const dCount = modalBettings.filter(b => b.betting === 'D').length;
              const lCount = modalBettings.filter(b => b.betting === 'L').length;
              return (
                <div
                  style={{
                    display: 'flex',
                    gap: '0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    flexShrink: 0,
                  }}
                >
                  {[
                    { label: '승', count: wCount, color: '#00C896', bg: 'rgba(0,200,150,0.08)' },
                    { label: '무', count: dCount, color: '#C9A84C', bg: 'rgba(201,168,76,0.08)' },
                    { label: '패', count: lCount, color: '#ff6b6b', bg: 'rgba(255,107,107,0.08)' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: '0.875rem',
                        backgroundColor: item.bg,
                      }}
                    >
                      <div style={{ color: item.color, fontWeight: 800, fontSize: '1.25rem' }}>{item.count}</div>
                      <div style={{ color: item.color, fontSize: '0.75rem', fontWeight: 600, opacity: 0.8 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* 참여자 목록 */}
            <div style={{ overflowY: 'auto', flexGrow: 1 }}>
              {modalLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  불러오는 중...
                </div>
              ) : modalBettings.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  베팅 내역이 없습니다.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      {['참여자', '예측'].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '0.6rem 1.25rem',
                            textAlign: 'left',
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modalBettings.map((row, i) => {
                      const styleMap: Record<string, { label: string; color: string; bg: string }> = {
                        W: { label: '승', color: '#00C896', bg: 'rgba(0,200,150,0.15)' },
                        D: { label: '무', color: '#C9A84C', bg: 'rgba(201,168,76,0.15)' },
                        L: { label: '패', color: '#ff6b6b', bg: 'rgba(255,107,107,0.15)' },
                      };
                      const bet = styleMap[row.betting] ?? { label: row.betting, color: '#fff', bg: 'rgba(255,255,255,0.1)' };
                      return (
                        <tr
                          key={row.id}
                          style={{
                            borderBottom: i < modalBettings.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                            backgroundColor: i % 2 === 1 ? 'rgba(255,255,255,0.012)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                {row.sso_login_id}
                              </span>
                              {modalActualResult !== null && row.betting === modalActualResult && (
                                <span className="crown-sparkle" style={{ fontSize: '1.1rem', lineHeight: 1, display: 'inline-block' }}>👑</span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 1.25rem' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.75rem',
                                borderRadius: '9999px',
                                backgroundColor: bet.bg,
                                color: bet.color,
                                fontWeight: 700,
                                fontSize: '0.85rem',
                              }}
                            >
                              {bet.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
