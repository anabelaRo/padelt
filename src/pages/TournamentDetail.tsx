import React from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { calculateStandings, generatePlayoffs } from '../logic/tournamentLogic';

const STAGE_LABELS: Record<string, string> = {
  group: 'Fase de Grupos',
  round_of_32: '16avos',
  round_of_16: '8vos de Final',
  quarter: 'Cuartos',
  semi: 'Semifinal',
  final: 'Final'
};

export default function TournamentDetail() {
  const { id } = useParams();
  const tId = Number(id);
  const tournament = useLiveQuery(() => db.tournaments.get(tId));
  const matches = useLiveQuery(() => db.matches.where('tournamentId').equals(tId).toArray());

  const handleCreatePlayoffs = async () => {
    if (!matches || !tournament) return;

    // 1. Calcular posiciones de grupos
    const groupNames = [...new Set(matches.filter(m => m.stage === 'group').map(m => m.groupName))];
    const standings: any = {};
    groupNames.forEach(name => {
      const gMatches = matches.filter(m => m.groupName === name);
      const teams = [...new Set(gMatches.flatMap(m => [m.team1Id, m.team2Id]))];
      standings[name!] = calculateStandings(gMatches, teams);
    });

    // 2. Generar cruces
    const playoffs = generatePlayoffs(standings, tournament.config.qualifiedPerGroup);
    
    // 3. Guardar y actualizar
    for (const match of playoffs) {
      await db.matches.add({ ...match, tournamentId: tId });
    }
    await db.tournaments.update(tId, { status: 'playoffs' });
  };

  if (!tournament) return <div className="p-10 text-center text-slate-400 font-bold">Cargando Torneo...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl border-b-4 border-emerald-500">
        <h2 className="text-2xl font-black uppercase italic">{tournament.name}</h2>
        <div className="flex gap-2 mt-2">
            <span className="bg-emerald-500 text-slate-900 px-2 py-0.5 rounded text-[10px] font-bold">{tournament.category}</span>
            <span className="text-slate-400 text-xs">{tournament.club}</span>
        </div>
      </div>

      {tournament.status === 'groups' && (
        <button 
          onClick={handleCreatePlayoffs}
          className="w-full bg-emerald-500 text-slate-900 font-black py-4 rounded-2xl shadow-lg shadow-emerald-100 uppercase tracking-widest hover:bg-emerald-400 transition-all"
        >
          Generar Cruces Eliminatorios
        </button>
      )}

      <div className="space-y-8">
        {Object.entries(STAGE_LABELS).map(([key, label]) => {
          const stageMatches = matches?.filter(m => m.stage === key);
          if (!stageMatches || stageMatches.length === 0) return null;

          return (
            <section key={key} className="space-y-3">
              <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest ml-2">{label}</h3>
              {stageMatches.map(m => (
                <div key={m.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700 w-1/3">{m.team1Id}</span>
                  <input 
                    className="w-16 text-center font-mono font-bold bg-slate-100 border-none rounded-lg p-2 text-emerald-600"
                    placeholder="0-0"
                    defaultValue={m.score}
                    onBlur={(e) => db.matches.update(m.id!, { score: e.target.value })}
                  />
                  <span className="text-sm font-bold text-slate-700 w-1/3 text-right">{m.team2Id}</span>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
