'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MatchSetup from '@/components/MatchSetup';
import GameBoard from '@/components/GameBoard';
import PlayerStats from '@/components/PlayerStats';
import HistoryLog from '@/components/HistoryLog';
import Link from 'next/link';

interface Player {
  id: number;
  name: string;
  total_wins: number;
  total_losses: number;
  created_at: string;
  updated_at: string;
}

interface Match {
  id: number;
  status: string;
  created_at: string;
  ended_at?: string;
}

interface MatchPlayer {
  id: number;
  match_id: number;
  player_id: number;
  player_name: string;
  current_count: string;
  status: string;
  rt_streak: number;
  match_wins: number;
  match_losses: number;
  created_at: string;
  updated_at: string;
}

interface History {
  id: number;
  match_id: number;
  player_name: string;
  action: string;
  previous_count: string | null;
  new_count: string | null;
  created_at: string;
}

interface MatchHistoryItem {
  id: number;
  status: string;
  created_at: string;
  ended_at?: string;
  players: string[];
  winner?: string;
}

export default function Home() {
  const [matchStarted, setMatchStarted] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [matchPlayers, setMatchPlayers] = useState<(MatchPlayer & { player: Player })[]>([]);
  const [history, setHistory] = useState<History[]>([]);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading players:', error);
      return;
    }
    
    setAllPlayers(data || []);
  };

  const handleStartMatch = async (selectedPlayerIds: number[]) => {
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .insert({ status: 'active' })
      .select()
      .single();

    if (matchError || !matchData) {
      console.error('Error creating match:', matchError);
      return;
    }

    const matchPlayersData = selectedPlayerIds.map(playerId => ({
      match_id: matchData.id,
      player_id: playerId,
      current_count: '',
      status: 'normal',
      rt_streak: 0,
      match_wins: 0,
      match_losses: 0
    }));

    const { data: insertedMatchPlayers, error: mpError } = await supabase
      .from('match_players')
      .insert(matchPlayersData)
      .select();

    if (mpError) {
      console.error('Error creating match players:', mpError);
      return;
    }

    if (!insertedMatchPlayers) {
      console.error('No match players data returned');
      return;
    }

    const playersWithDetails = await Promise.all(
      insertedMatchPlayers.map(async (mp) => {
        const { data: playerData } = await supabase
          .from('players')
          .select('*')
          .eq('id', mp.player_id)
          .single();
        return { ...mp, player: playerData!, player_name: playerData?.name || '' };
      })
    );

    setCurrentMatch(matchData);
    setMatchPlayers(playersWithDetails);
    setHistory([]);
    setMatchStarted(true);
  };

  const handleEndMatch = async () => {
    if (!currentMatch) return;

    const { error } = await supabase
      .from('matches')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', currentMatch.id);

    if (error) {
      console.error('Error ending match:', error);
      return;
    }

    for (const mp of matchPlayers) {
      await supabase
        .from('players')
        .update({
          total_wins: mp.player.total_wins + mp.match_wins,
          total_losses: mp.player.total_losses + mp.match_losses,
          updated_at: new Date().toISOString()
        })
        .eq('id', mp.player_id);
    }

    setMatchStarted(false);
    setCurrentMatch(null);
    setMatchPlayers([]);
    setHistory([]);
    loadPlayers();
  };

  const updateMatchPlayer = async (playerId: number, updates: Partial<MatchPlayer>) => {
    if (!currentMatch) return;

    const matchPlayer = matchPlayers.find(mp => mp.player_id === playerId);
    if (!matchPlayer) return;

    const { error } = await supabase
      .from('match_players')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', matchPlayer.id);

    if (error) {
      console.error('Error updating match player:', error);
      return;
    }

    setMatchPlayers(prev =>
      prev.map(mp =>
        mp.player_id === playerId ? { ...mp, ...updates } : mp
      )
    );
  };

  const addHistory = async (playerName: string, action: string, previousCount?: string, newCount?: string) => {
    if (!currentMatch) return;

    const { data, error } = await supabase
      .from('history')
      .insert({
        match_id: currentMatch.id,
        player_name: playerName,
        action,
        previous_count: previousCount || null,
        new_count: newCount || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding history:', error);
      return;
    }

    setHistory(prev => [...prev, data]);
  };

  const handleUndo = async (playerId: number) => {
    if (!currentMatch) return;

    const playerHistory = history.filter(h => h.player_name === matchPlayers.find(mp => mp.player_id === playerId)?.player_name);
    
    if (playerHistory.length === 0) return;

    const lastEntry = playerHistory[playerHistory.length - 1];
    
    const player = matchPlayers.find(mp => mp.player_id === playerId);
    if (!player) return;

    const previousCount = lastEntry.previous_count === 'Oke Bro' ? '' : lastEntry.previous_count;

    await supabase
      .from('match_players')
      .update({ current_count: previousCount })
      .eq('player_id', playerId)
      .eq('match_id', currentMatch.id);

    await supabase
      .from('history')
      .delete()
      .eq('id', lastEntry.id);

    setMatchPlayers(prev =>
      prev.map(mp =>
        mp.player_id === playerId ? { ...mp, current_count: previousCount || '' } : mp
      )
    );

    setHistory(prev => prev.filter(h => h.id !== lastEntry.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="bg-gray-800/90 backdrop-blur-sm shadow-2xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  GAPLE OKE BRO
                </h1>
                <p className="text-sm text-gray-400">Professional Match Tracker</p>
                <p className="text-lg text-white">Powered By SI-TECHNO</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!currentMatch && (
                <Link
                  href="/match-history"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                >
                  <i className="ri-history-line text-xl"></i>
                  Match History
                </Link>
              )}
              {currentMatch && (
                <button
                  onClick={handleEndMatch}
                  className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                >
                  <i className="ri-stop-circle-line text-xl"></i>
                  End Match
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentMatch ? (
          <MatchSetup 
            allPlayers={allPlayers}
            onStartMatch={handleStartMatch}
            onPlayersChange={loadPlayers}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <GameBoard
                  matchPlayers={matchPlayers}
                  onUpdatePlayer={updateMatchPlayer}
                  onAddHistory={addHistory}
                  onUndo={handleUndo}
                />
                <HistoryLog history={history} playerNames={matchPlayers.map(mp => mp.player_name)} />
              </div>
              <div>
                <PlayerStats matchPlayers={matchPlayers} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
