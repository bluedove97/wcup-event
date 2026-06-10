export interface Game {
  game_id: number;
  cont: string;
  create_by: Date | null;
  home: string | null;
  away: string | null;
  home_score: string | null;
  away_score: string | null;
  home_img: string | null;
  away_img: string | null;
  start_dt: string | null;
  open_yn: string | null;
  betting_count?: number;
}

export interface Betting {
  id: number;
  sso_login_id: string;
  game_id: number;
  betting: 'W' | 'D' | 'L';
  create_by: Date | null;
  game_cont?: string;
}

export type BettingChoice = 'W' | 'D' | 'L';
