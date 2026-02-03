import { Outlet, Link, useLocation } from 'react-router-dom';
import { Trophy, Home, PlusCircle, BarChart3 } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Superior */}
      <header className="bg-slate-900 text-white p-5 shadow-lg border-b-2 border-emerald-500">
        <h1 className="text-xl font-black italic tracking-tighter">
          PADEL PRO <span className="text-emerald-400">AMERICANO</span>
        </h1>
      </header>

      {/* Contenido de la página actual */}
      <main className="p-4 max-w-2xl mx-auto">
        <Outlet />
      </main>

      {/* Navegación Inferior (Tab Bar) */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Link to="/" className={`flex flex-col items-center transition-colors ${isActive('/') ? 'text-emerald-500' : 'text-slate-400'}`}>
          <Home size={24} />
          <span className="text-[10px] font-bold mt-1 uppercase">Inicio</span>
        </Link>
        <Link to="/tournaments/new" className={`flex flex-col items-center transition-colors ${isActive('/tournaments/new') ? 'text-emerald-500' : 'text-slate-400'}`}>
          <PlusCircle size={24} />
          <span className="text-[10px] font-bold mt-1 uppercase">Nuevo</span>
        </Link>
        <div className="flex flex-col items-center text-slate-300">
          <BarChart3 size={24} />
          <span className="text-[10px] font-bold mt-1 uppercase">Stats</span>
        </div>
      </nav>
    </div>
  );
}