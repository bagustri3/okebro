'use client';

import { History } from '@/lib/supabase';

interface HistoryLogProps {
  history: History[];
  playerNames: string[];
}

export default function HistoryLog({ history, playerNames }: HistoryLogProps) {
  const rounds: { [playerName: string]: string }[] = [];
  
  const currentRound: { [playerName: string]: string } = {};
  playerNames.forEach(name => {
    currentRound[name] = 'Oke Bro';
  });

  history.forEach((entry) => {
    if (entry.new_count) {
      currentRound[entry.player_name] = entry.new_count;
      
      if (entry.new_count === 'RT' || entry.new_count.startsWith('RT+')) {
        rounds.push({ ...currentRound });
        
        currentRound[entry.player_name] = 'Oke Bro';
      }
    }
  });

  const hasAnyData = rounds.length > 0 || !Object.values(currentRound).every(count => count === 'Oke Bro');

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
          <i className="ri-file-list-line text-white text-xl"></i>
        </div>
        Match History
      </h2>

      {!hasAnyData ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 flex items-center justify-center bg-gray-700/50 rounded-2xl mx-auto mb-4">
            <i className="ri-file-list-3-line text-3xl text-gray-500"></i>
          </div>
          <p className="text-gray-400 text-lg">No rounds played yet</p>
          <p className="text-gray-500 text-sm mt-2">Start playing to see the match history</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rounds.map((round, roundIndex) => (
            <div key={roundIndex} className="bg-gray-700/30 rounded-2xl p-6 border border-gray-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <span className="text-white font-bold text-sm">{roundIndex + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Round {roundIndex + 1}</h3>
                <span className="ml-auto px-3 py-1 bg-rose-500/20 border border-rose-500 text-rose-300 rounded-lg text-sm font-semibold">
                  Completed
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-2 border-gray-600">
                      {playerNames.map((name, index) => (
                        <th key={index} className="border-2 border-gray-600 py-3 px-4 text-white font-semibold bg-gray-700/50">
                          {name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-2 border-gray-600">
                      {playerNames.map((name, index) => {
                        const count = round[name];
                        const isRT = count === 'RT' || count.startsWith('RT+');
                        return (
                          <td 
                            key={index} 
                            className={`border-2 border-gray-600 py-4 px-4 text-center font-bold text-lg ${
                              isRT ? 'bg-rose-500/20 text-rose-300' : 'text-white'
                            }`}
                          >
                            {count}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="bg-emerald-500/10 rounded-2xl p-6 border-2 border-emerald-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <i className="ri-play-circle-line text-white text-lg"></i>
              </div>
              <h3 className="text-lg font-semibold text-white">Current Round</h3>
              <span className="ml-auto px-3 py-1 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded-lg text-sm font-semibold animate-pulse">
                In Progress
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-2 border-emerald-500/50">
                    {playerNames.map((name, index) => (
                      <th key={index} className="border-2 border-emerald-500/50 py-3 px-4 text-white font-semibold bg-emerald-500/10">
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-2 border-emerald-500/50">
                    {playerNames.map((name, index) => (
                      <td key={index} className="border-2 border-emerald-500/50 py-4 px-4 text-center text-white font-bold text-lg">
                        {currentRound[name]}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
