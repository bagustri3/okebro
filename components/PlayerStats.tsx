'use client';

import { MatchPlayer, Player } from '@/lib/supabase';

interface PlayerStatsProps {
  matchPlayers: (MatchPlayer & { player: Player })[];
}

export default function PlayerStats({ matchPlayers }: PlayerStatsProps) {
  const sortedPlayers = [...matchPlayers].sort((a, b) => b.match_wins - a.match_wins);

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-700 sticky top-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
          <i className="ri-trophy-line text-white text-xl"></i>
        </div>
        Player Stats
      </h2>

      <div className="space-y-3">
        {sortedPlayers.map((mp, index) => (
          <div
            key={mp.id}
            className="bg-gray-700/50 rounded-2xl p-5 border-2 border-gray-600 hover:shadow-lg transition-all hover:border-blue-500"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl font-bold text-white shadow-md">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">{mp.player_name}</h3>
                <div className="text-sm text-gray-400">
                  Current: <span className="font-semibold text-blue-400">{mp.current_count || 'Oke Bro'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-xl p-3 border border-emerald-500/30">
                <div className="text-xs text-gray-400 mb-1">TTD</div>
                <div className="text-2xl font-bold text-emerald-400">{mp.match_wins}</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-3 border border-rose-500/30">
                <div className="text-xs text-gray-400 mb-1">RT</div>
                <div className="text-2xl font-bold text-rose-400">{mp.match_losses}</div>
              </div>
            </div>

            {mp.status === 'RW' && (
              <div className="mt-3 px-3 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500 rounded-xl flex items-center justify-center gap-2">
                <i className="ri-alert-line text-amber-400"></i>
                <span className="text-xs font-bold text-amber-300">RW STATUS</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
