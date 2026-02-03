import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { calculateStandings, generatePlayoffs, promoteWinner } from '../logic/tournamentLogic';
import StandingsTable from '../components/StandingsTable';
import { 
  Trophy, 
  ChevronLeft, 
  LayoutGrid, 
  GitMerge, 
  MapPin, 
  RefreshCcw, 
  Swords,
  CheckCircle2
} from 'lucide-react';

export default function TournamentDetail() {
  const { id } = useParams();
  const tId = Number(id); // Definido al inicio del componente

  // ESTADOS
  const [activeTab, setActiveTab] = useState<'groups' | 'playoffs'>('groups');
  const [playoffStage, setPlayoffStage] = useState<string>('quarter');

  // DATOS EN VIVO
  const tournament = useLiveQuery(() => db.tournaments.get(tId));
  const matches = useLiveQuery(() => db.matches.where('tournamentId').equals(tId).toArray());

  // ORGANIZAR PARTIDOS DE PLAYOFF POR ETAPA
  const playoffMatchesByStage = useMemo(() => {
    const pMatches = matches?.filter(m => m.stage !== 'group') || [];
    const grouped: Record<string, any[]> = {};
    pMatches.forEach(m => {
      if (!grouped[m.stage]) grouped[m.stage] = [];
      grouped[m.stage].push(m);
    });
    return grouped;
  }, [matches]);

  // --- FUNCIÓN CRÍTICA CORREGIDA ---
  const handleScoreUpdate = async (match: any, newScore: string) => {
  if (!newScore.includes('-') || newScore === match.score) return;
  
  await db.matches.update(match.id!, { score: newScore });

  if (match.stage !== 'group') {
    const allPlayoffMatches = await db.matches
      .where('tournamentId').equals(tId)
      .and(m => m.stage !== 'group')
      .toArray();

    const promotion = promoteWinner({ ...match, score: newScore }, allPlayoffMatches);
    
    if (promotion) {
      const { winnerId, nextStage, nextMatchIndex, isTeam1InNextMatch } = promotion;
      
      // IMPORTANTE: Buscamos TODOS los partidos de la etapa siguiente
      const nextStageMatches = allPlayoffMatches
        .filter(m => m.stage === nextStage)
        .sort((a, b) => (a.id || 0) - (b.id || 0));

      // ¿Ya existe el partido donde debe ir este ganador?
      const targetMatch = nextStageMatches[nextMatchIndex];

      if (targetMatch) {
        const updateData = isTeam1InNextMatch ? { team1Id: winnerId } : { team2Id: winnerId };
        await db.matches.update(targetMatch.id!, updateData);
      } else {
        // Si no existe, creamos el slot. 
        // Pero atención: si estamos en Cuartos (4 partidos), 
        // el sistema debe saber que habrá 2 partidos de Semis.
        await db.matches.add({
          tournamentId: tId,
          stage: nextStage as any,
          team1Id: isTeam1InNextMatch ? winnerId : 'A confirmar',
          team2Id: isTeam1InNextMatch ? 'A confirmar' : winnerId,
          score: ''
        });
      }
    }
  }
};

  const handleCloseGroups = async () => {
    if (!window.confirm("¿Finalizar zonas y generar cruces de Playoff?")) return;
    
    const groupMatches = matches?.filter(m => m.stage === 'group') || [];
    const groups = [...new Set(groupMatches.map(m => m.groupName))];
    
    const standingsByGroup: any = {};
    groups.forEach(gName => {
      const gMatches = groupMatches.filter(m => m.groupName === gName);
      const teams = [...new Set(gMatches.flatMap(m => [m.team1Id, m.team2Id]))];
      standingsByGroup[gName!] = calculateStandings(gMatches, teams);
    });

    const playoffs = generatePlayoffs(standingsByGroup, tournament!.config.qualifiedPerGroup);
    
    for (const m of playoffs) {
      await db.matches.add({ ...m, tournamentId: tId });
    }

    await db.tournaments.update(tId, { status: 'playoffs' });
    setActiveTab('playoffs');
    setPlayoffStage(playoffs[0].stage);
  };

  if (!tournament || !matches) return (
    <div className="flex flex-col items-center justify-center h-screen text-slate-400">
      <RefreshCcw className="animate-spin mb-2" />
      <p className="font-bold">Cargando torneo...</p>
    </div>
  );

  const stageLabels: Record<string, string> = {
    'round_of_16': '8vos', 'quarter': '4tos', 'semi': 'Semis', 'final': 'Final'
  };

  const currentGroupMatches = matches.filter(m => m.stage === 'group');
  const groupNames = [...new Set(currentGroupMatches.map(m => m.groupName))];

  return (
    <div className="max-w-2xl mx-auto pb-24 px-4 pt-4">
      {/* CABECERA */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-emerald-500 transition-colors">
          <ChevronLeft size={20}/>
        </Link>
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{tournament.name}</h2>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{tournament.category}</span>
        </div>
      </div>

      {/* TABS PRINCIPALES */}
      <div className="flex bg-slate-200 p-1 rounded-2xl mb-6">
        <button onClick={() => setActiveTab('groups')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${activeTab === 'groups' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>
          <LayoutGrid size={16} /> ZONAS
        </button>
        <button onClick={() => setActiveTab('playoffs')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${activeTab === 'playoffs' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>
          <GitMerge size={16} /> PLAYOFFS
        </button>
      </div>

      {activeTab === 'groups' ? (
        <div className="space-y-10 animate-in fade-in duration-500">
          {groupNames.map(gName => {
            const gMatches = currentGroupMatches.filter(m => m.groupName === gName);
            const teams = [...new Set(gMatches.flatMap(m => [m.team1Id, m.team2Id]))];
            return (
              <div key={gName} className="space-y-4">
                <h3 className="font-black text-slate-800 uppercase italic text-sm border-l-4 border-emerald-500 pl-3">{gName}</h3>
                <div className="space-y-2">
                  {gMatches.map(m => (
                    <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 border border-slate-100">
                      <span className="flex-1 text-xs font-bold text-slate-700">{m.team1Id}</span>
                      <input 
                        className="w-14 text-center font-black bg-slate-50 rounded-lg py-2 text-emerald-600 text-sm border-2 border-transparent focus:border-emerald-300 outline-none" 
                        defaultValue={m.score} 
                        onBlur={(e) => handleScoreUpdate(m, e.target.value)} 
                        placeholder="0-0" 
                      />
                      <span className="flex-1 text-xs font-bold text-slate-700 text-right">{m.team2Id}</span>
                    </div>
                  ))}
                </div>
                <StandingsTable stats={calculateStandings(gMatches, teams)} />
              </div>
            );
          })}
          {tournament.status === 'groups' && (
            <button onClick={handleCloseGroups} className="w-full bg-slate-900 text-emerald-400 font-black py-4 rounded-2xl shadow-xl uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 mt-8">
              <Trophy size={18} /> Generar Cuadro Eliminatorio
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          {/* SUB-TABS PLAYOFFS */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['round_of_16', 'quarter', 'semi', 'final'].map(stage => (
              playoffMatchesByStage[stage] && (
                <button 
                  key={stage}
                  onClick={() => setPlayoffStage(stage)}
                  className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-tighter transition-all border-2 ${playoffStage === stage ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}
                >
                  {stageLabels[stage]}
                </button>
              )
            ))}
          </div>

          {/* LISTA PARTIDOS PLAYOFF */}
          <div className="space-y-3">
            {playoffMatchesByStage[playoffStage]?.map((m, idx) => (
              <div key={m.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-50"></div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cruce {idx + 1}</span>
                  {m.score && <CheckCircle2 size={14} className="text-emerald-500" />}
                </div>
                <div className="flex items-center gap-4">
                  <div className={`flex-1 text-sm font-black uppercase italic ${m.team1Id === 'A confirmar' ? 'text-slate-300' : 'text-slate-800'}`}>
                    {m.team1Id}
                  </div>
                  <input 
                    className="w-16 text-center font-mono font-black bg-slate-100 rounded-xl py-3 text-emerald-600 border-none outline-none focus:ring-2 focus:ring-emerald-400 transition-all shadow-inner"
                    placeholder="0-0"
                    defaultValue={m.score}
                    onBlur={(e) => handleScoreUpdate(m, e.target.value)}
                  />
                  <div className={`flex-1 text-sm font-black uppercase italic text-right ${m.team2Id === 'A confirmar' ? 'text-slate-300' : 'text-slate-800'}`}>
                    {m.team2Id}
                  </div>
                </div>
              </div>
            ))}
            {!playoffMatchesByStage[playoffStage] && (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Swords className="mx-auto text-slate-200 mb-2" size={32} />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Esta fase se habilitará pronto</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}