import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { calculateStandings, generatePlayoffs } from '../logic/tournamentLogic';
import Bracket from '../components/Bracket';
import { Trophy, Users, ChevronLeft, LayoutGrid, GitMerge } from 'lucide-react';

export default function TournamentDetail() {
  const { id } = useParams();
  const tId = Number(id);
  const [activeTab, setActiveTab] = useState<'groups' | 'playoffs'>('groups');

  const tournament = useLiveQuery(() => db.tournaments.get(tId));
  const matches = useLiveQuery(() => db.matches.where('tournamentId').equals(tId).toArray());

  if (!tournament || !matches) return (
    <div className="flex justify-center items-center h-64 text-slate-400 font-bold">
      Cargando Torneo...
    </div>
  );

  const groupMatches = matches.filter(m => m.stage === 'group');
  const playoffMatches = matches.filter(m => m.stage !== 'group');

  // Agrupar partidos por zona para la vista de grupos
  const groups = [...new Set(groupMatches.map(m => m.groupName))];

  const handleCloseGroups = async () => {
    if (confirm("¿Confirmas que la fase de grupos ha terminado? Esto generará los cruces eliminatorios.")) {
      const standingsByGroup: any = {};
      
      groups.forEach(gName => {
        const gMatches = groupMatches.filter(m => m.groupName === gName);
        const teams = [...new Set(gMatches.flatMap(m => [m.team1Id, m.team2Id]))];
        standingsByGroup[gName!] = calculateStandings(gMatches, teams);
      });

      const playoffCruces = generatePlayoffs(standingsByGroup, tournament.config.qualifiedPerGroup);

      for (const match of playoffCruces) {
        await db.matches.add({ ...match, tournamentId: tId });
      }

      await db.tournaments.update(tId, { status: 'playoffs' });
      setActiveTab('playoffs');
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header Fijo/Superior */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/tournaments" className="p-2 bg-white rounded-full shadow-sm text-slate-600">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase italic">
            {tournament.name}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">
            {tournament.club} • {tournament.category}
          </p>
        </div>
      </div>

      {/* Selector de Fase (Tabs) */}
      <div className="flex bg-slate-200 p-1 rounded-2xl mb-6">
        <button 
          onClick={() => setActiveTab('groups')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'groups' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
        >
          <LayoutGrid size={18} /> Fase de Grupos
        </button>
        <button 
          onClick={() => setActiveTab('playoffs')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'playoffs' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
        >
          <GitMerge size={18} /> Playoffs
        </button>
      </div>

      {/* Contenido Dinámico */}
      {activeTab === 'groups' ? (
        <div className="space-y-8">
          {groups.map(gName => (
            <div key={gName} className="space-y-3">
              <div className="flex justify-between items-end px-2">
                <h3 className="font-black text-slate-800 uppercase italic text-lg">{gName}</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Resultados</span>
              </div>
              
              <div className="space-y-2">
                {groupMatches.filter(m => m.groupName === gName).map(m => (
                  <div key={m.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <div className="flex-1 font-bold text-slate-700 text-sm">{m.team1Id}</div>
                    <input 
                      className="w-14 text-center font-mono font-black bg-slate-50 border-2 border-slate-100 rounded-lg py-1 text-emerald-600 focus:border-emerald-400 outline-none"
                      placeholder="0-0"
                      defaultValue={m.score}
                      onBlur={(e) => db.matches.update(m.id!, { score: e.target.value })}
                    />
                    <div className="flex-1 font-bold text-slate-700 text-sm text-right">{m.team2Id}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {tournament.status === 'groups' && (
            <div className="pt-4">
              <button 
                onClick={handleCloseGroups}
                className="w-full bg-slate-900 text-emerald-400 font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Trophy size={20} /> Finalizar Grupos
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-6">
            <p className="text-emerald-700 text-xs font-bold text-center uppercase tracking-wider">
              Cuadro Eliminatorio Automático
            </p>
          </div>
          <Bracket matches={playoffMatches} />
        </div>
      )}
    </div>
  );
}
