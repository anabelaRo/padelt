const fs = require('fs');
const path = require('path');

const files = {
  'src/components/Layout.tsx': `
import { Outlet, Link } from 'react-router-dom';
import { Trophy, Users, Home, BarChart3 } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <header className="bg-slate-900 text-emerald-400 p-4 shadow-xl">
        <h1 className="text-xl font-black italic tracking-tighter">PADEL PRO <span className="text-white">AMERICANO</span></h1>
      </header>
      <main className="p-4 max-w-2xl mx-auto"><Outlet /></main>
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 z-50">
        <Link to="/" className="flex flex-col items-center text-slate-400 focus:text-emerald-500"><Home size={24} /><span className="text-[10px]">Inicio</span></Link>
        <Link to="/tournaments" className="flex flex-col items-center text-slate-400 focus:text-emerald-500"><Trophy size={24} /><span className="text-[10px]">Torneos</span></Link>
        <Link to="/stats" className="flex flex-col items-center text-slate-400 focus:text-emerald-500"><BarChart3 size={24} /><span className="text-[10px]">Stats</span></Link>
      </nav>
    </div>
  );
}`,

  'src/pages/TournamentDetail.tsx': `
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { calculateStandings } from '../logic/tournamentLogic';

export default function TournamentDetail() {
  const { id } = useParams();
  const tournament = useLiveQuery(() => db.tournaments.get(Number(id)));
  const matches = useLiveQuery(() => db.matches.where('tournamentId').equals(Number(id)).toArray());

  if (!tournament || !matches) return <p>Cargando Torneo...</p>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{tournament.category}</span>
        <h2 className="text-2xl font-bold text-slate-800 mt-2">{tournament.name}</h2>
        <p className="text-slate-400 text-sm">{tournament.club} • {tournament.date.toLocaleDateString()}</p>
      </div>

      {/* Zonas / Grupos */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <div className="w-1 h-5 bg-emerald-500 rounded-full"></div> Fase de Grupos
        </h3>
        
        <div className="grid gap-4">
            {/* Ejemplo de un partido de zona */}
            {matches.filter(m => m.stage === 'group').map(m => (
                <div key={m.id} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="flex-1 text-sm font-medium">{m.team1Id}</div>
                    <input 
                        type="text" 
                        placeholder="0-0" 
                        defaultValue={m.score}
                        className="w-16 text-center font-mono bg-slate-50 border-none rounded-lg p-1 mx-2"
                        onBlur={async (e) => {
                            await db.matches.update(m.id!, { score: e.target.value });
                        }}
                    />
                    <div className="flex-1 text-sm font-medium text-right">{m.team2Id}</div>
                </div>
            ))}
        </div>
      </div>

      <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200">
        Cerrar Grupos y Armar Playoff
      </button>
    </div>
  );
}`,

  'src/pages/Dashboard.tsx': `
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export default function Dashboard() {
  const tCount = useLiveQuery(() => db.tournaments.count());
  
  return (
    <div className="space-y-6">
      <div className="bg-emerald-500 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-100">
        <h2 className="text-lg opacity-80">Bienvenido de nuevo</h2>
        <p className="text-4xl font-black mt-2">¡A jugar!</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Torneos Hoy</p>
            <p className="text-3xl font-bold text-slate-800">{tCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Partidos Offline</p>
            <p className="text-3xl font-bold text-slate-800">Sincronizado</p>
        </div>
      </div>
    </div>
  );
}`
};

// ... lógica de escritura de archivos igual a la anterior ...