import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, MapPin, ChevronRight, Plus, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const tournaments = useLiveQuery(() => db.tournaments.reverse().toArray());

  // FUNCIÓN PARA ELIMINAR TORNEO Y SUS PARTIDOS
  const handleDeleteTournament = async (e: React.MouseEvent, id: number, name: string) => {
    e.preventDefault(); // Evita que al hacer clic entre al torneo
    e.stopPropagation();

    if (window.confirm(`¿Estás seguro de eliminar el torneo "${name.toUpperCase()}"? Se borrarán todos los resultados y llaves.`)) {
      try {
        // 1. Borrar todos los partidos asociados a ese torneo
        await db.matches.where('tournamentId').equals(id).delete();
        // 2. Borrar el torneo
        await db.tournaments.delete(id);
        alert("Torneo eliminado correctamente");
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar el torneo");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header y Saludo (Igual que antes) */}
      <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-lg opacity-90 font-medium">Panel de Control</h2>
          <p className="text-4xl font-black mt-1 uppercase italic tracking-tighter">Tus Torneos</p>
        </div>
        <Trophy className="absolute right-[-10px] bottom-[-10px] text-white opacity-20 w-32 h-32 rotate-12" />
      </div>

      <div className="flex justify-between items-center px-2">
        <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Historial Reciente</h3>
      </div>

      {/* Lista de Torneos */}
      <div className="space-y-4">
        {tournaments && tournaments.length > 0 ? (
          tournaments.map((t) => (
            <div key={t.id} className="relative group">
              <Link 
                to={`/tournament/${t.id}`}
                className="block bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                        {t.category}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-slate-800 uppercase italic leading-tight">{t.name}</h4>
                    <div className="flex gap-3 mt-2 text-slate-400 text-xs font-medium">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {t.club}</span>
                    </div>
                  </div>
                  
                  {/* BOTÓN ELIMINAR */}
                  <button 
                    onClick={(e) => handleDeleteTournament(e, t.id!, t.name)}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </Link>
            </div>
          ))
        ) : (
          /* Estado Vacío (Igual que antes) */
          <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
             <p className="text-slate-400 font-bold uppercase text-xs">No hay torneos</p>
             <Link to="/tournaments/new" className="inline-block mt-4 text-emerald-500 font-bold">Crear uno nuevo</Link>
          </div>
        )}
      </div>
    </div>
  );
}