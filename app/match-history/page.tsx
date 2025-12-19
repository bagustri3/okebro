'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Match {
  id: number;
  status: string;
  created_at: string;
  ended_at?: string;
}

interface MatchPlayer {
  player_id: number;
  player_name: string;
  match_wins: number;
  match_losses: number;
}

interface HistoryEntry {
  player_name: string;
  action: string;
  previous_count?: string;
  new_count?: string;
  created_at: string;
}

interface RoundData {
  [playerName: string]: string;
}

export default function MatchHistoryPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matchPlayers, setMatchPlayers] = useState<MatchPlayer[]>([]);
  const [roundHistory, setRoundHistory] = useState<RoundData[]>([]);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'ended')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading matches:', error);
      return;
    }

    setMatches(data || []);
  };

  const loadMatchDetails = async (matchId: number) => {
    const { data: matchPlayersData, error: mpError } = await supabase
      .from('match_players')
      .select('player_id, match_wins, match_losses')
      .eq('match_id', matchId);

    if (mpError) {
      console.error('Error loading match players:', mpError);
      return;
    }

    const playersWithNames = await Promise.all(
      (matchPlayersData || []).map(async (mp) => {
        const { data: playerData } = await supabase
          .from('players')
          .select('name')
          .eq('id', mp.player_id)
          .single();

        return {
          player_id: mp.player_id,
          player_name: playerData?.name || 'Unknown',
          match_wins: mp.match_wins,
          match_losses: mp.match_losses
        };
      })
    );

    setMatchPlayers(playersWithNames);

    const maxWins = Math.max(...playersWithNames.map(p => p.match_wins));
    const winners = playersWithNames.filter(p => p.match_wins === maxWins);
    setWinner(winners.length === 1 ? winners[0].player_name : null);

    const { data: historyData, error: historyError } = await supabase
      .from('history')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (historyError) {
      console.error('Error loading history:', historyError);
      return;
    }

    const rounds: RoundData[] = [];
    let currentRound: { [key: string]: string } = {};

    playersWithNames.forEach(p => {
      currentRound[p.player_name] = '';
    });

    (historyData || []).forEach((entry: HistoryEntry) => {
      const newCount = entry.new_count || '';
      currentRound[entry.player_name] = newCount;

      if (newCount === 'RT' || newCount.startsWith('RT+')) {
        rounds.push({ ...currentRound });
        playersWithNames.forEach(p => {
          currentRound[p.player_name] = '';
        });
      }
    });

    const hasIncompleteRound = Object.values(currentRound).some(count => count !== '');
    if (hasIncompleteRound) {
      rounds.push({ ...currentRound });
    }

    setRoundHistory(rounds);
  };

  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    loadMatchDetails(match.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="bg-gray-800/90 backdrop-blur-sm shadow-2xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  History GAPLE
                </h1>
                <p className="text-md text-gray-400">OKE BRO</p>
                <p className="text-lg text-white">Powered By SI-TECHNO</p>
              </div>
            </div>
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 whitespace-nowrap"
            >
              <i className="ri-arrow-left-line text-xl"></i>
              Back to Game
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-white">
                <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                  <i className="ri-list-check text-white text-lg"></i>
                </div>
                All Matches
              </h2>
              <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                {matches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => handleMatchSelect(match)}
                    className={`w-full text-left p-4 rounded-xl transition-all hover:scale-105 border-2 ${
                      selectedMatch?.id === match.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400 shadow-lg'
                        : 'bg-gray-700/50 border-gray-600 hover:border-emerald-500'
                    }`}
                  >
                    <div className="font-semibold text-white">Match #{match.id}</div>
                    <div className="text-xs text-gray-300 mt-1">
                      {new Date(match.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {selectedMatch ? (
              <>
                {winner && (
                  <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-700">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500 rounded-2xl">
                        <i className="ri-trophy-line text-4xl text-amber-400"></i>
                        <div>
                          <div className="text-sm text-amber-300 font-semibold">Match Winner</div>
                          <div className="text-2xl font-bold text-white">{winner}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                      <i className="ri-user-line text-white text-xl"></i>
                    </div>
                    Players
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {matchPlayers.map((player) => (
                      <div
                        key={player.player_id}
                        className="bg-gray-700/50 rounded-2xl p-6 border-2 border-gray-600 hover:shadow-lg transition-all hover:border-emerald-500"
                      >
                        <h3 className="text-lg font-bold text-center mb-4 text-white">
                          {player.player_name}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center px-3 py-2 bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-400">Wins</span>
                            <span className="font-bold text-emerald-400">{player.match_wins}</span>
                          </div>
                          <div className="flex justify-between items-center px-3 py-2 bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-400">Losses</span>
                            <span className="font-bold text-rose-400">{player.match_losses}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {roundHistory.length > 0 && (
                  <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-700">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                      <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                        <i className="ri-history-line text-white text-xl"></i>
                      </div>
                      Round History
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-700/50">
                            <th className="px-4 py-3 text-left font-semibold text-white border border-gray-600">
                              Round
                            </th>
                            {matchPlayers.map((player) => (
                              <th
                                key={player.player_id}
                                className="px-4 py-3 text-center font-semibold text-white border border-gray-600"
                              >
                                {player.player_name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {roundHistory.map((round, index) => (
                            <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                              <td className="px-4 py-3 font-semibold text-gray-300 border border-gray-600">
                                Round {index + 1}
                              </td>
                              {matchPlayers.map((player) => {
                                const count = round[player.player_name] || 'OKE BRO';
                                const isRT = count === 'RT' || count.startsWith('RT+');
                                return (
                                  <td
                                    key={player.player_id}
                                    className={`px-4 py-3 text-center font-semibold border border-gray-600 ${
                                      isRT
                                        ? 'bg-rose-500/30 text-rose-400'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    {count}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-16 border border-gray-700 text-center">
                <i className="ri-file-list-line text-6xl text-gray-600 mb-4"></i>
                <p className="text-xl text-gray-400">Select a match to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
