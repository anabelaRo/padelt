import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { calculateStandings, generatePlayoffs } from '../logic/tournamentLogic';
import Bracket from '../components/Bracket';
import StandingsTable from '../components/StandingsTable';
import { 
  Trophy, 
  ChevronLeft, 
  LayoutGrid, 
  GitMerge, 
  Calendar, 
  MapPin,
  CheckCircle2
} from 'lucide-react';

export default function TournamentDetail() {
  const { id } = useParams();
  const tId = Number(id);
  
  // Estado para controlar qué pestaña vemos
  const [activeTab, setActiveTab] = useState<'groups' | 'playoffs'>('groups');

  // Queries en tiempo real a la base de datos local (Dexie)
  const tournament = useLiveQuery(() => db.tournaments.get(tId));
  const matches = useLiveQuery(() => db.matches.where('tournamentId').equals(tId).toArray());

  if (!tournament || !matches) return (
    <div className="flex flex-col items-center justify-center h-screen text-slate-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
      <p className="font-bold">Cargando Torneo...</p>
    </div>
  );

  const groupMatches = matches.filter(m => m.stage === 'group');
  const playoffMatches = matches.filter(m => m.stage !== 'group');
  const groups = [...new Set(groupMatches.map(m => m.groupName))];

  // Función para cerrar la fase de grupos y armar los cruces
  const handleCloseGroups = async () => {
    const confirmClose = window.confirm(
      "¿Deseas cerrar la fase de grupos? Se calcularán los clasificados y se generará el cuadro de eliminación automáticamente."
    );

    if (confirmClose) {
      const standingsByGroup: any = {};
      
      groups.forEach(gName => {
        const gMatches = groupMatches.filter(m => m.groupName === gName);
        const teams = [...new Set(gMatches.flatMap(m => [m.team1Id, m.team2Id]))];
        standingsByGroup[gName!] = calculateStandings(gMatches, teams);
      });

      // Generar los cruces basados en la configuración (ej. cuántos pasan)
      const playoffCruces = generatePlayoffs(standingsByGroup, tournament.config.qualifiedPerGroup);

      // Guardar nuevos partidos en la DB
      for (const match of playoffCruces) {
        await db.matches.add({ ...match, tournamentId: tId });
      }

      // Cambiar estado del torneo
      await db.tournaments.update(tId, { status: 'playoffs' });
      setActiveTab('playoffs');
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 px-4 pt-4">
      
      {/* HEADER DE TORNEO */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-emerald-500 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter">
              {tournament.name}
            </h2>
            {tournament.status === 'finished' && <CheckCircle2 className="text-emerald-500" size={20} />}
          </div>
          <div className="flex gap-4 mt-1">
            <span className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase">
              <MapPin size={12} /> {tournament.club}
            </span>
            <span className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase">
              <Calendar size={12} /> {new Date(tournament.date).toLocaleDateString()}
            </span>
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-black uppercase">
              {tournament.category}
            </span>
          </div>
        </div>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="flex bg-slate-200 p-1 rounded-2xl mb-8">
        <button 
          onClick={() => setActiveTab('groups')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'groups' ? 'bg-white text-emerald-600 shadow-md scale-[1.02]' : 'text-slate-500'
          }`}
        >
          <LayoutGrid size={18} /> Zonas
        </button>
        <button 
          onClick={() => setActiveTab('playoffs')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'playoffs' ? 'bg-white text-emerald-600 shadow-md scale-[1.02]' : 'text-slate-500'
          }`}
        >
          <GitMerge size={18} /> Cuadro Final
        </button>
      </div>

      {/* CONTENIDO DE PESTAÑA: GRUPOS */}
      {activeTab === 'groups' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {groups.map(gName => {
            const gMatches = groupMatches.filter(m => m.groupName === gName);
            const teams = [...new Set(gMatches.flatMap(m => [m.team1Id, m.team2Id]))];
            const stats = calculateStandings(gMatches, teams);

            return (
              <div key={gName} className="space-y-6">
                <h3 className="font-black text-slate-800 uppercase italic text-xl px-2 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div> {gName}
                </h3>

                <div className="space-y-8">
                  {/* Listado de Partidos */}
                  <section>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-3">Resultados de Partidos</p>
                    <div className="space-y-2">
                      {gMatches.map(m => (
                        <div key={m.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-emerald-200 transition-colors">
                          <div className="flex-1 font-bold text-slate-800 text-sm leading-tight">{m.team1Id}</div>
                          <input 
                            className="w-16 text-center font-mono font-black bg-slate-50 border-2 border-transparent focus:border-emerald-400 rounded-xl py-2 text-emerald-600 transition-all outline-none"
                            placeholder="0-0"
                            defaultValue={m.score}
                            onBlur={(e) => db.matches.update(m.id!, { score: e.target.value })}
                          />
                          <div className="flex-1 font-bold text-slate-800 text-sm text-right leading-tight">{m.team2Id}</div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Tabla de Posiciones */}
                  <section>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-3">Posiciones en Vivo</p>
                    <StandingsTable stats={stats} />
                  </section>
                </div>
              </div>
            );
          })}

          {/* Botón de Acción para el Organizador */}
          {tournament.status === 'groups' && (
            <div className="pt-6">
              <button 
                onClick={handleCloseGroups}
                className="w-full bg-slate-900 text-emerald-400 font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-95 transition-all"
              >
                <Trophy size={22} /> Finalizar Fase de Grupos
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-4 italic">
                * Esto cerrará las zonas y armará los cruces eliminatorios según las posiciones actuales.
              </p>
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO DE PESTAÑA: PLAYOFFS */}
      {activeTab === 'playoffs' && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-emerald-500 p-4 rounded-2xl mb-8 shadow-lg shadow-emerald-100 flex items-center justify-between">
            <p className="text-white text-xs font-black uppercase tracking-wider">Camino a la Gloria</p>
            <Trophy className="text-white opacity-50" size={20} />
          </div>
          
          <div className="overflow-x-auto pb-8">
            <Bracket matches={playoffMatches} />
          </div>
          
          {playoffMatches.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <GitMerge className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold">Aún no se han generado los cruces.</p>
              <p className="text-slate-300 text-xs">Finaliza la fase de grupos para ver el cuadro.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
