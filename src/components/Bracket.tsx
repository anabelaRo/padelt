import React from 'react';
import { Match, db } from '../db/db';

interface BracketProps {
  matches: Match[];
}

const STAGE_ORDER = ['round_of_32', 'round_of_16', 'quarter', 'semi', 'final'];

export default function Bracket({ matches }: BracketProps) {
  if (!matches || matches.length === 0) return <p className="text-center text-slate-400 mt-8">No hay partidos eliminatorios.</p>;

  const groupedMatches = STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = matches.filter(m => m.stage === stage);
    return acc;
  }, {} as Record<string, Match[]>);

  const renderMatch = (match: Match) => {
    // Determine winner for styling
    const [score1, score2] = match.score.split('-').map(Number);
    const team1Won = score1 > score2;
    const team2Won = score2 > score1;

    return (
      <div key={match.id} className="relative bg-white rounded-lg shadow-sm border border-slate-100 mb-2">
        {/* Líneas de conexión si lo tuviéramos en un SVG, aquí es más visual */}
        <div className="absolute top-1/2 -left-4 w-4 h-[1px] bg-slate-200"></div>
        <div className="absolute top-1/2 -right-4 w-4 h-[1px] bg-slate-200"></div>


        <div className="flex items-center text-sm font-medium p-2 border-b border-slate-50 last:border-b-0">
          <span className={`flex-1 ${team1Won ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
            {match.team1Id}
          </span>
          <input
            type="text"
            className="w-12 text-center font-mono font-bold bg-slate-100 rounded-md p-1 mx-1 text-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-300"
            placeholder="-"
            defaultValue={match.score}
            onBlur={async (e) => {
              if (match.id) {
                await db.matches.update(match.id, { score: e.target.value.trim() });
              }
            }}
          />
          <span className={`flex-1 text-right ${team2Won ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
            {match.team2Id}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-around gap-4 mt-8 overflow-x-auto p-2">
      {STAGE_ORDER.map(stage => {
        const stageMatches = groupedMatches[stage];
        if (!stageMatches || stageMatches.length === 0) return null;

        return (
          <div key={stage} className="flex-shrink-0 w-60">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest text-center mb-4">
              {STAGE_LABELS[stage]}
            </h3>
            <div className="space-y-4">
              {stageMatches.map(renderMatch)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper para los nombres de las etapas, replicado o importado desde TournamentDetail
const STAGE_LABELS: Record<string, string> = {
  group: 'Fase de Grupos',
  round_of_32: '16avos',
  round_of_16: '8vos',
  quarter: 'Cuartos',
  semi: 'Semis',
  final: 'Final'
};
