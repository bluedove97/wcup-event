'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Game, BettingChoice } from '@/types';

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

const BETTING_OPTIONS: { value: BettingChoice; label: string; desc: string; color: string }[] = [
  { value: 'W', label: '승', desc: '대한민국 승리', color: '#00C896' },
  { value: 'D', label: '무', desc: '무승부', color: '#C9A84C' },
  { value: 'L', label: '패', desc: '대한민국 패배', color: '#FF6B6B' },
];

function BettingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultGameId = searchParams.get('game');

  const [games, setGames] = useState<Game[]>([]);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [selectedBetting, setSelectedBetting] = useState<BettingChoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.userName) setLoggedInUser(data.userName); })
      .catch(() => {});

    fetch('/api/games')
      .then((r) => r.json())
      .then((data) => {
        if (data.games) {
          setGames(data.games);
          // URL param으로 온 game_id가 오픈된 경기일 때만 자동 선택
          if (defaultGameId) {
            const target = data.games.find((g: Game) => g.game_id === Number(defaultGameId));
            if (target?.open_yn === 'Y') setSelectedGame(Number(defaultGameId));
          }
        }
      })
      .catch(() => setFetchError('게임 목록을 불러오지 못했습니다.'));
  }, [defaultGameId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMsg('');
    setSubmitError('');

    if (!loggedInUser) { setSubmitError('로그인 정보를 확인할 수 없습니다.'); return; }
    if (!selectedGame) { setSubmitError('경기를 선택해주세요.'); return; }
    if (!selectedBetting) { setSubmitError('승/무/패를 선택해주세요.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/betting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sso_login_id: loggedInUser, game_id: selectedGame, betting: selectedBetting }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMsg('베팅이 성공적으로 등록되었습니다!');
        setSelectedBetting(null);
        setTimeout(() => router.push('/my-bets'), 1500);
      } else {
        setSubmitError(data.error || '베팅 등록에 실패했습니다.');
      }
    } catch {
      setSubmitError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>베팅하기</h1>
      <p className="mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
        경기당 1회만 베팅 가능합니다. 베팅 오픈된 경기만 참여할 수 있습니다.
      </p>

      {fetchError && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(255,80,80,0.1)', color: '#ff8080' }}>
          {fetchError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* 참여자 표시 */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
            참여자
          </label>
          <div
            className="w-full px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--emerald)',
                flexShrink: 0,
              }}
            />
            {loggedInUser || '로딩 중...'}
          </div>
        </div>

        {/* 경기 선택 */}
        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
            경기 선택
          </label>
          <div className="grid gap-3">
            {games.map((game, idx) => {
              const isOpen = game.open_yn === 'Y';
              const isSelected = selectedGame === game.game_id;
              const homeImg = game.home_img ? resolveImg(game.home_img) : null;
              const awayImg = game.away_img ? resolveImg(game.away_img) : null;
              const homeName = game.home ?? '홈팀';
              const awayName = game.away ?? '어웨이팀';
              return (
                <button
                  key={game.game_id}
                  type="button"
                  onClick={() => { if (isOpen) setSelectedGame(game.game_id); }}
                  disabled={!isOpen}
                  className="w-full text-left p-4 rounded-xl"
                  style={{
                    backgroundColor: isSelected
                      ? 'rgba(201,168,76,0.1)'
                      : isOpen
                      ? 'var(--bg-card)'
                      : 'rgba(255,255,255,0.02)',
                    border: isSelected
                      ? '2px solid var(--gold)'
                      : isOpen
                      ? '1px solid rgba(255,255,255,0.06)'
                      : '1px solid rgba(255,255,255,0.04)',
                    cursor: isOpen ? 'pointer' : 'not-allowed',
                    opacity: isOpen ? 1 : 0.5,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--navy)', color: 'var(--gold)' }}>
                        제{idx + 1}경기
                      </span>
                      {isOpen ? (
                        <span className="text-xs font-bold" style={{ color: 'var(--emerald)' }}>● 오픈</span>
                      ) : (
                        <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>마감</span>
                      )}
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDate(game.start_dt)}</span>
                    </div>
                    {isSelected && <span style={{ color: 'var(--gold)' }}>✓</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {homeImg != null && (
                      <Image src={homeImg} alt={homeName} width={26} height={17}
                        style={{ borderRadius: '2px', objectFit: 'cover' }} />
                    )}
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{homeName}</span>
                    <span style={{ color: 'var(--text-muted)' }}>vs</span>
                    {awayImg != null && (
                      <Image src={awayImg} alt={awayName} width={26} height={17}
                        style={{ borderRadius: '2px', objectFit: 'cover' }} />
                    )}
                    <span style={{ color: 'var(--text-muted)' }}>{awayName}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 승/무/패 선택 */}
        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
            결과 예측
          </label>
          <div className="grid grid-cols-3 gap-3">
            {BETTING_OPTIONS.map((opt) => {
              const isSelected = selectedBetting === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedBetting(opt.value)}
                  className="py-4 rounded-xl font-bold text-center"
                  style={{
                    backgroundColor: isSelected ? opt.color : 'var(--bg-card)',
                    color: isSelected ? 'var(--navy-dark)' : opt.color,
                    border: `2px solid ${isSelected ? opt.color : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer',
                    boxShadow: isSelected ? `0 4px 16px ${opt.color}40` : 'none',
                  }}
                >
                  <div className="text-2xl font-black">{opt.label}</div>
                  <div className="text-xs mt-1 opacity-80">{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 에러 / 성공 메시지 */}
        {submitError && (
          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(255,80,80,0.1)', color: '#ff8080' }}>
            {submitError}
          </div>
        )}
        {submitMsg && (
          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(0,200,150,0.1)', color: 'var(--emerald)' }}>
            {submitMsg}
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-base"
          style={{
            backgroundColor: loading ? 'rgba(201,168,76,0.4)' : 'var(--gold)',
            color: 'var(--navy-dark)',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(201,168,76,0.4)',
          }}
          onMouseOver={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--gold-light)'; }}
          onMouseOut={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--gold)'; }}
          onMouseDown={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        >
          {loading ? '등록 중...' : '베팅 등록하기'}
        </button>
      </form>
    </div>
  );
}

export default function BettingPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-muted)' }}>로딩 중...</div>}>
      <BettingForm />
    </Suspense>
  );
}
