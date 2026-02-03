import React from 'react';
import { Trophy } from 'lucide-react';

interface BracketProps {
  matches: any[];
  onScoreUpdate: (match: any, newScore: string) => void;
}

export default function Bracket({ matches, onScoreUpdate }: BracketProps) {
  // Definimos las etapas en orden para renderizar las columnas
  const stages = ['round_of_16', 'quarter', 'semi', 'final'];
  const stageLabels: Record<string, string> = {
    'round_of_16': 'Octavos',
    'quarter': 'Cuartos',
    'semi': 'Semis',
    'final': 'Final'
  };

  // Agrupamos los partidos por etapa
  const matchesByStage = stages.reduce((acc, stage) => {
    const stageMatches = matches.filter(m => m.stage === stage);
    if (stageMatches.length > 0) acc[stage] = stageMatches;
    return acc;
  }, {} as Record<string, any[]>);

  if (Object.keys(matchesByStage).length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Esperando resultados de zonas...</p>
      </div>
    );
  }

  return (
    <div className="flex gap-8 pb-8 overflow-x-auto snap-x">
      {stages.map((stage) => {
        const stageMatches = matchesByStage[stage];
        if (!stageMatches) return null;

        return (
          <div key={stage} className="flex-shrink-0 w-64 snap-center">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 pl-2">
              {stageLabels[stage]}
            </h4>
            
            <div className="flex flex-col justify-around h-full space-y-8">
              {stageMatches.map((m, idx) => (
                <div key={m.id || idx} className="relative">
                  {/* Conector visual entre llaves (solo si no es la final) */}
                  {stage !== 'final' && (
                    <div className="absolute -right-4 top-1/2 w-4 h-px bg-slate-200" />
                  )}

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Equipo 1 */}
                    <div className="p-3 border-b border-slate-50 flex justify-between items-center">
                      <span className={`text-xs font-bold truncate pr-2 ${m.team1Id === 'A confirmar' ? 'text-slate-300 italic' : 'text-slate-700'}`}>
                        {m.team1Id}
                      </span>
                    </div>

                    {/* Input de Score Centralizado */}
                    <div className="bg-slate-50 px-3 py-2 flex justify-center">
                      <input
                        type="text"
                        placeholder="0-0"
                        defaultValue={m.score}
                        onBlur={(e) => onScoreUpdate(m, e.target.value)}
                        className="w-16 bg-white border border-slate-200 rounded-lg text-center font-mono font-black text-emerald-600 text-sm py-1 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Equipo 2 */}
                    <div className="p-3 flex justify-between items-center">
                      <span className={`text-xs font-bold truncate pr-2 ${m.team2Id === 'A confirmar' ? 'text-slate-300 italic' : 'text-slate-700'}`}>
                        {m.team2Id}
                      </span>
                    </div>
                  </div>

                  {/* Icono de corona si es la final y tiene resultado */}
                  {stage === 'final' && m.score && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 animate-bounce">
                      <Trophy size={20} fill="currentColor" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}