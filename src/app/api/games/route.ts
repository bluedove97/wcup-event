import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        g.game_id,
        g.cont,
        g.create_by,
        g.home,
        g.away,
        g.home_score,
        g.away_score,
        g.home_img,
        g.away_img,
        g.start_dt,
        g.open_yn,
        COUNT(b.id)::int AS betting_count
      FROM tb_game g
      LEFT JOIN tb_betting b ON g.game_id = b.game_id
      GROUP BY g.game_id, g.cont, g.create_by, g.home, g.away,
               g.home_score, g.away_score, g.home_img, g.away_img,
               g.start_dt, g.open_yn
      ORDER BY g.game_id
    `);
    return NextResponse.json({ games: result.rows });
  } catch (err) {
    console.error('GET /api/games error:', err);
    return NextResponse.json({ error: '게임 목록 조회 실패' }, { status: 500 });
  }
}
