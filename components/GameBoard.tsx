"use client";

import { MatchPlayer, Player } from "@/lib/supabase";
import Controls from "./Controls";

interface GameBoardProps {
  matchPlayers: (MatchPlayer & { player: Player })[];
  onUpdatePlayer: (playerId: number, updates: Partial<MatchPlayer>) => void;
  onAddHistory: (
    playerName: string,
    action: string,
    previousCount?: string,
    newCount?: string
  ) => void;
  onUndo: (playerId: number) => void;
}

export default function GameBoard({
  matchPlayers,
  onUpdatePlayer,
  onAddHistory,
  onUndo,
}: GameBoardProps) {
  const countSequence = ["", "l", "L", "F", "P", "R", "RI", "RT"];

  const handleResetAllPlayers = () => {
    matchPlayers.forEach((mp) => {
      onUpdatePlayer(mp.player_id, { current_count: "" });
    });
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
          <i className="ri-dashboard-line text-white text-xl"></i>
        </div>
        Game Board
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matchPlayers.map((mp) => (
          <div
            key={mp.id}
            className="bg-gray-700/50 rounded-2xl p-6 border-2 border-gray-600 hover:shadow-lg transition-all hover:border-emerald-500"
          >
            <div className="flex flex-col items-center gap-2 mb-4">
              <h3 className="text-4xl font-bold text-white">
                {mp.player_name}
              </h3>
              <div className="flex items-center justify-center px-4 py-12 w-full bg-white rounded-xl shadow-sm border border-gray-600">
                {(() => {
                  const index = countSequence.indexOf(mp.current_count ?? "");
                  const safeIndex = index === -1 ? 0 : index;

                  return (
                    <img
                      src={`/${safeIndex}.png`}
                      alt={mp.current_count ?? "0"}
                      className="h-36 w-auto object-contain"
                    />
                  );
                })()}
              </div>
            </div>

            <Controls
              player={mp}
              onUpdatePlayer={onUpdatePlayer}
              onAddHistory={onAddHistory}
              onResetAllPlayers={handleResetAllPlayers}
              onUndo={onUndo}
            />

            {mp.status === "RW" && (
              <div className="mt-4 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500 rounded-xl flex items-center gap-2">
                <i className="ri-alert-line text-amber-400"></i>
                <span className="text-sm font-semibold text-amber-300">
                  RW Status Active
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
