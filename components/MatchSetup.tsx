'use client';

import { useState } from 'react';
import { supabase, Player } from '@/lib/supabase';

interface MatchSetupProps {
  onStartMatch: (selectedPlayerIds: number[]) => void;
  allPlayers: Player[];
  onPlayersChange: () => void;
}

export default function MatchSetup({ onStartMatch, allPlayers, onPlayersChange }: MatchSetupProps) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreatePlayer = async () => {
    if (!newPlayerName.trim()) return;

    const { error } = await supabase
      .from('players')
      .insert({ name: newPlayerName.trim() });

    if (error) {
      console.error('Error creating player:', error);
      return;
    }

    setNewPlayerName('');
    onPlayersChange();
  };

  const handleEditPlayer = async (playerId: number) => {
    if (!editingName.trim()) return;

    const { error } = await supabase
      .from('players')
      .update({ name: editingName.trim(), updated_at: new Date().toISOString() })
      .eq('id', playerId);

    if (error) {
      console.error('Error updating player:', error);
      return;
    }

    setEditingPlayerId(null);
    setEditingName('');
    onPlayersChange();
  };

  const handleDeletePlayer = async (playerId: number) => {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (error) {
      console.error('Error deleting player:', error);
      return;
    }

    setSelectedPlayerIds(prev => prev.filter(id => id !== playerId));
    onPlayersChange();
  };

  const togglePlayerSelection = (playerId: number) => {
    setSelectedPlayerIds(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        if (prev.length >= 4) {
          return prev;
        }
        return [...prev, playerId];
      }
    });
  };

  const handleStartMatch = () => {
    if (selectedPlayerIds.length !== 4) {
      return;
    }
    onStartMatch(selectedPlayerIds);
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
          <i className="ri-settings-3-line text-white text-xl"></i>
        </div>
        Match Setup
      </h2>

      <div className="space-y-6">
        <div className="bg-gray-700/50 rounded-2xl p-6 border border-gray-600">
          <h3 className="text-lg font-semibold mb-4 text-white">Create New Player</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Enter player name"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400 text-sm"
            />
            <button
              onClick={handleCreatePlayer}
              disabled={!newPlayerName.trim()}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              <i className="ri-add-line text-xl"></i>
              Create
            </button>
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-2xl p-6 border border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Select Players for Match</h3>
            <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500 rounded-lg">
              <span className="text-emerald-300 font-semibold">{selectedPlayerIds.length} / 4 Players</span>
            </div>
          </div>
          
          {allPlayers.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No players yet. Create your first player above!</p>
          ) : (
            <div className="space-y-3">
              {allPlayers.map((player) => (
                <div
                  key={player.id}
                  className="bg-gray-800 rounded-xl p-4 border border-gray-600 hover:border-emerald-500 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedPlayerIds.includes(player.id)}
                      onChange={() => togglePlayerSelection(player.id)}
                      disabled={!selectedPlayerIds.includes(player.id) && selectedPlayerIds.length >= 4}
                      className="w-5 h-5 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    
                    {editingPlayerId === player.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleEditPlayer(player.id)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
                      />
                    ) : (
                      <div className="flex-1">
                        <span className="font-semibold text-white">{player.name}</span>
                        <div className="text-xs text-gray-400 mt-1">
                          Total: {player.total_wins} TTD / {player.total_losses} RT
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {editingPlayerId === player.id ? (
                        <>
                          <button
                            onClick={() => handleEditPlayer(player.id)}
                            className="w-9 h-9 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all"
                          >
                            <i className="ri-check-line text-lg"></i>
                          </button>
                          <button
                            onClick={() => {
                              setEditingPlayerId(null);
                              setEditingName('');
                            }}
                            className="w-9 h-9 flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-all"
                          >
                            <i className="ri-close-line text-lg"></i>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingPlayerId(player.id);
                              setEditingName(player.name);
                            }}
                            className="w-9 h-9 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                          >
                            <i className="ri-edit-line text-lg"></i>
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player.id)}
                            className="w-9 h-9 flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-all"
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleStartMatch}
          disabled={selectedPlayerIds.length !== 4}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 whitespace-nowrap"
        >
          <i className="ri-play-circle-line text-2xl"></i>
          {selectedPlayerIds.length === 4 ? 'Start Match' : `Select ${4 - selectedPlayerIds.length} more player${4 - selectedPlayerIds.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}
