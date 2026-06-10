import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { BettingChoice } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sso_login_id, game_id, betting } = body;

    if (!sso_login_id || !game_id || !betting) {
      return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
    }

    const validBetting: BettingChoice[] = ['W', 'D', 'L'];
    if (!validBetting.includes(betting)) {
      return NextResponse.json({ error: '베팅값은 W(승), D(무), L(패) 중 하나여야 합니다.' }, { status: 400 });
    }

    const gameCheck = await pool.query('SELECT game_id, open_yn FROM tb_game WHERE game_id = $1', [game_id]);
    if (gameCheck.rows.length === 0) {
      return NextResponse.json({ error: '존재하지 않는 경기입니다.' }, { status: 404 });
    }
    if (gameCheck.rows[0].open_yn !== 'Y') {
      return NextResponse.json({ error: '베팅이 마감된 경기입니다.' }, { status: 403 });
    }

    const result = await pool.query(
      `INSERT INTO tb_betting (sso_login_id, game_id, betting, create_by)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [sso_login_id.trim(), game_id, betting]
    );

    return NextResponse.json({ message: '베팅이 등록되었습니다.', betting: result.rows[0] }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
      return NextResponse.json({ error: '이미 해당 경기에 베팅하셨습니다.' }, { status: 409 });
    }
    console.error('POST /api/betting error:', err);
    return NextResponse.json({ error: '베팅 등록 실패' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sso_login_id = searchParams.get('sso_login_id');
    const game_id = searchParams.get('game_id');

    if (game_id) {
      const gameCheck = await pool.query('SELECT open_yn FROM tb_game WHERE game_id = $1', [parseInt(game_id)]);
      if (gameCheck.rows.length === 0) {
        return NextResponse.json({ error: '존재하지 않는 경기입니다.' }, { status: 404 });
      }
      if (gameCheck.rows[0].open_yn === 'Y') {
        return NextResponse.json({ error: '베팅 진행 중인 경기는 조회할 수 없습니다.' }, { status: 403 });
      }
      const result = await pool.query(
        `SELECT b.id, b.sso_login_id, b.game_id, b.betting, b.create_by, g.cont AS game_cont
         FROM tb_betting b
         JOIN tb_game g ON b.game_id = g.game_id
         WHERE b.game_id = $1
         ORDER BY b.create_by`,
        [parseInt(game_id)]
      );
      return NextResponse.json({ bettings: result.rows });
    }

    if (!sso_login_id) {
      return NextResponse.json({ error: 'sso_login_id가 필요합니다.' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT b.id, b.sso_login_id, b.game_id, b.betting, b.create_by, g.cont AS game_cont
       FROM tb_betting b
       JOIN tb_game g ON b.game_id = g.game_id
       WHERE b.sso_login_id = $1
       ORDER BY b.game_id`,
      [sso_login_id.trim()]
    );

    return NextResponse.json({ bettings: result.rows });
  } catch (err) {
    console.error('GET /api/betting error:', err);
    return NextResponse.json({ error: '베팅 조회 실패' }, { status: 500 });
  }
}
