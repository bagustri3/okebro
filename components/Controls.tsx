'use client';

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
}

interface Player {
  id: number;
  name: string;
  total_wins: number;
  total_losses: number;
}

interface ControlsProps {
  player: MatchPlayer & { player: Player };
  onUpdatePlayer: (playerId: number, updates: Partial<MatchPlayer>) => void;
  onAddHistory: (playerName: string, action: string, previousCount?: string, newCount?: string) => void;
  onResetAllPlayers: () => void;
  onUndo: (playerId: number) => void;
}

const countSequence = ['', 'l', 'r', 'F', 'P', 'R', 'RI', 'RT'];

export default function Controls({ player, onUpdatePlayer, onAddHistory, onResetAllPlayers, onUndo }: ControlsProps) {
  const handleIncrement = (steps: number) => {
    const currentIndex = countSequence.indexOf(player.current_count);
    let newIndex = currentIndex + steps;

    let newRtStreak = player.rt_streak;
    let newStatus = player.status;
    let newMatchWins = player.match_wins;
    let newMatchLosses = player.match_losses;

    if (currentIndex === 6 && steps >= 2) {
      const rtPlus = steps - 1;
      const newCount = `RT+${rtPlus}`;
      
      newMatchLosses += 1;
      newRtStreak += 1;

      if (newRtStreak >= 3) {
        newStatus = 'RW';
      }

      if (player.status === 'RW') {
        newStatus = 'KADES';
        onAddHistory(player.player_name, 'Lost with RW status - KADES penalty applied');
      }

      onAddHistory(
        player.player_name,
        `Reached ${newCount} (RT) - New Round Started`,
        player.current_count || 'Oke Bro',
        newCount
      );

      onUpdatePlayer(player.player_id, {
        current_count: '',
        rt_streak: newRtStreak,
        status: newStatus,
        match_wins: newMatchWins,
        match_losses: newMatchLosses
      });

      onResetAllPlayers();
      return;
    }

    if (newIndex >= countSequence.length) {
      newMatchLosses += 1;
      newRtStreak += 1;

      if (newRtStreak >= 3) {
        newStatus = 'RW';
      }

      if (player.status === 'RW') {
        newStatus = 'KADES';
        onAddHistory(player.player_name, 'Lost with RW status - KADES penalty applied');
      }

      onAddHistory(
        player.player_name,
        `Reached RT - New Round Started`,
        player.current_count || 'Oke Bro',
        'RT'
      );

      onUpdatePlayer(player.player_id, {
        current_count: '',
        rt_streak: newRtStreak,
        status: newStatus,
        match_wins: newMatchWins,
        match_losses: newMatchLosses
      });

      onResetAllPlayers();
      return;
    }

    const newCount = countSequence[newIndex];

    if (newCount === 'RT') {
      newMatchLosses += 1;
      newRtStreak += 1;

      if (newRtStreak >= 3) {
        newStatus = 'RW';
      }

      if (player.status === 'RW') {
        newStatus = 'KADES';
        onAddHistory(player.player_name, 'Lost with RW status - KADES penalty applied');
      }

      onAddHistory(
        player.player_name,
        `Reached RT - New Round Started`,
        player.current_count || 'Oke Bro',
        'RT'
      );

      onUpdatePlayer(player.player_id, {
        current_count: '',
        rt_streak: newRtStreak,
        status: newStatus,
        match_wins: newMatchWins,
        match_losses: newMatchLosses
      });

      onResetAllPlayers();
      return;
    } else if (newCount === '' && player.current_count !== '') {
      newMatchWins += 1;
      onAddHistory(
        player.player_name,
        'Completed cycle (TTD)',
        player.current_count,
        'Oke Bro'
      );
    } else {
      onAddHistory(
        player.player_name,
        `Advanced +${steps}`,
        player.current_count || 'Oke Bro',
        newCount || 'Oke Bro'
      );
    }

    onUpdatePlayer(player.player_id, {
      current_count: newCount,
      rt_streak: newRtStreak,
      status: newStatus,
      match_wins: newMatchWins,
      match_losses: newMatchLosses
    });
  };

  const handleUndo = () => {
    onUndo(player.player_id);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleIncrement(1)}
          className="py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <i className="ri-add-line text-xl"></i>
          1
        </button>
        <button
          onClick={() => handleIncrement(2)}
          className="py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <i className="ri-add-line text-xl"></i>
          2
        </button>
      </div>

      <button
        onClick={handleUndo}
        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
      >
        <i className="ri-arrow-go-back-line text-xl"></i>
        Undo
      </button>
    </div>
  );
}
