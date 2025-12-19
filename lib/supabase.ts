import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Player {
  id: number;
  name: string;
  total_wins: number;
  total_losses: number;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: number;
  started_at: string;
  ended_at: string | null;
  status: string;
  created_at: string;
}

export interface MatchPlayer {
  id: number;
  match_id: number;
  player_id: number;
  current_count: string;
  status: string;
  rt_streak: number;
  match_wins: number;
  match_losses: number;
  created_at: string;
  updated_at: string;
}

export interface History {
  id: number;
  match_id: number;
  player_name: string;
  action: string;
  previous_count: string | null;
  new_count: string | null;
  created_at: string;
}
