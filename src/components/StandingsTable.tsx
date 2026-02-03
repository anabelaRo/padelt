// src/components/StandingsTable.tsx
import React from 'react';
import { TeamStats } from '../logic/tournamentLogic';

interface Props {
  stats: TeamStats[];
}

export default function StandingsTable({ stats }: Props) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm mt-2">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest">
          <tr>
            <th className="px-4 py-3">Pareja</th>
            <th className="px-2 py-3 text-center">PG</th>
            <th className="px-2 py-3 text-center">GF</th>
            <th className="px-2 py-3 text-center">Dif</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {stats.map((team, index) => (
            <tr key={team.teamId} className={index < 2 ? "bg-emerald-50/30" : ""}>
              <td className="px-4 py-3 font-bold text-slate-700">
                <span className="text-slate-300 mr-2">{index + 1}</span>
                {team.teamId}
              </td>
              <td className="px-2 py-3 text-center font-black text-slate-900">{team.matchesWon}</td>
              <td className="px-2 py-3 text-center text-slate-500">{team.gamesWon}</td>
              <td className={`px-2 py-3 text-center font-bold ${team.gamesWon - team.gamesLost >= 0 ? 'text-emerald-600' : 'text-red-400'}`}>
                {team.gamesWon - team.gamesLost > 0 ? '+' : ''}{team.gamesWon - team.gamesLost}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[9px] text-slate-400 italic px-2">
          PG: Partidos Ganados | GF: Games a Favor | Dif: Diferencia neta
        </p>
      </div>
    </div>
  );
}
