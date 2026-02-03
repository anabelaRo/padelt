import React from 'react';

interface StandingsTableProps {
  stats: any[];
}

export default function StandingsTable({ stats }: StandingsTableProps) {
  // Si no hay estadísticas, mostramos un estado de carga o vacío
  if (!stats || stats.length === 0) {
    return (
      <div className="p-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Esperando resultados...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <th className="px-4 py-4">Pareja</th>
            <th className="px-2 py-4 text-center">PJ</th>
            <th className="px-2 py-4 text-center text-emerald-600">PG</th>
            <th className="px-2 py-4 text-center text-blue-600">GG</th>
            <th className="px-4 py-4 text-center">Dif</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {stats.map((s, idx) => {
            // Aseguramos que los valores sean números para evitar espacios en blanco
            const played = s.played || 0;
            const won = s.won || 0;
            const gamesWon = s.gamesWon || 0;
            const diff = s.diff || 0;
            const teamName = s.team || "Equipo Desconocido";

            return (
              <tr key={teamName} className={`${idx < 2 ? 'bg-emerald-50/30' : ''} transition-colors`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${idx < 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                      {teamName}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-3 text-center text-xs font-medium text-slate-400">
                  {played}
                </td>
                <td className="px-2 py-3 text-center text-xs font-black text-emerald-600">
                  {won}
                </td>
                <td className="px-2 py-3 text-center text-xs font-bold text-blue-600">
                  {gamesWon}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-black px-2 py-1 rounded-lg ${diff >= 0 ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-500'}`}>
                    {diff > 0 ? `+${diff}` : diff}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div className="bg-slate-50/50 px-4 py-2 border-t border-slate-100 flex justify-between items-center text-[8px] text-slate-400 font-bold uppercase tracking-tighter italic">
        <span>PJ: JUGADOS | PG: GANADOS | GG: GAMES FAVOR | DIF: +/-</span>
      </div>
    </div>
  );
}
