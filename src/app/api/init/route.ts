import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS tb_game (
        game_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        cont VARCHAR(200) NOT NULL,
        create_by TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tb_betting (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        sso_login_id VARCHAR(100) NOT NULL,
        game_id BIGINT NOT NULL REFERENCES tb_game(game_id),
        betting VARCHAR(1) NOT NULL CHECK (betting IN ('W', 'D', 'L')),
        create_by TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        UNIQUE(sso_login_id, game_id)
      )
    `);

    const existing = await client.query('SELECT COUNT(*) FROM tb_game');
    if (parseInt(existing.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO tb_game (cont) VALUES
          ('제1경기 2026-06-12(금) 대한민국 VS 체코'),
          ('제2경기 2026-06-19(금) 대한민국 VS 멕시코'),
          ('제3경기 2026-06-25(목) 대한민국 VS 남아공')
      `);
    }

    await client.query('COMMIT');
    return NextResponse.json({ message: 'DB 초기화 완료' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DB init error:', err);
    return NextResponse.json({ error: 'DB 초기화 실패', detail: String(err) }, { status: 500 });
  } finally {
    client.release();
  }
}
