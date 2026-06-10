import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/session';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !verifySessionToken(token)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    let bettingQuery = `
      SELECT b.id, b.sso_login_id, b.game_id, b.betting, b.create_by,
             g.cont AS game_cont
      FROM tb_betting b
      JOIN tb_game g ON b.game_id = g.game_id
    `;
    const bettingParams: unknown[] = [];

    if (gameId) {
      bettingQuery += ' WHERE b.game_id = $1';
      bettingParams.push(parseInt(gameId));
    }

    bettingQuery += ' ORDER BY b.game_id, b.create_by DESC';

    const statsQuery = `
      SELECT g.game_id, g.cont, g.home, g.away, g.open_yn, g.start_dt,
             COALESCE(COUNT(b.id), 0)::int AS total,
             COALESCE(COUNT(b.id) FILTER (WHERE b.betting = 'W'), 0)::int AS win_count,
             COALESCE(COUNT(b.id) FILTER (WHERE b.betting = 'D'), 0)::int AS draw_count,
             COALESCE(COUNT(b.id) FILTER (WHERE b.betting = 'L'), 0)::int AS loss_count
      FROM tb_game g
      LEFT JOIN tb_betting b ON g.game_id = b.game_id
      GROUP BY g.game_id, g.cont, g.home, g.away, g.open_yn, g.start_dt
      ORDER BY g.game_id
    `;

    const [bettingResult, statsResult] = await Promise.all([
      pool.query(bettingQuery, bettingParams),
      pool.query(statsQuery),
    ]);

    return NextResponse.json({
      bettings: bettingResult.rows,
      stats: statsResult.rows,
    });
  } catch (err) {
    console.error('GET /api/admin/bettings error:', err);
    return NextResponse.json({ error: '데이터 조회 실패' }, { status: 500 });
  }
}
