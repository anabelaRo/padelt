import React, { useState } from 'react';
import { db } from '../db/db';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, ClipboardList } from 'lucide-react';

export default function TournamentCreator() {
  const navigate = useNavigate();
  const [rawData, setRawData] = useState('');
  const [config, setConfig] = useState({
    name: '',
    category: '',
    club: '',
    teamsPerGroup: 4,
    qualifiedPerGroup: 2
  });

  const handleCreate = async () => {
    // 1. Limpiar y normalizar parejas
    // Filtramos líneas vacías y procesamos el formato de nombres
    const lines = rawData.split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');

    if (lines.length < 2) return alert("Carga al menos 2 parejas");

    // Normalización: Soporta "J1-J2", "J1 -J2", "J1 - J2", etc.
    const normalizedTeams = lines.map(line => {
      if (line.includes('-')) {
        const parts = line.split('-').map(p => p.trim());
        return `${parts[0]} - ${parts[1]}`;
      }
      return line; // Si no hay guion, se guarda tal cual
    });

    // 2. Crear el Torneo
    const tournamentId = await db.tournaments.add({
      name: config.name,
      category: config.category,
      club: config.club,
      date: new Date(),
      status: 'groups',
      config: { qualifiedPerGroup: config.qualifiedPerGroup }
    });

    // 3. Distribución Automática en Grupos
    const alphabet = "ABCDEFGHIJ".split("");

    for (let i = 0; i < normalizedTeams.length; i++) {
      const groupIndex = Math.floor(i / config.teamsPerGroup);
      const groupName = `Zona ${alphabet[groupIndex]}`;
      
      const currentTeam = normalizedTeams[i];
      const startIndex = groupIndex * config.teamsPerGroup;
      
      // Generar enfrentamientos Round Robin para la zona
      for (let j = startIndex; j < i; j++) {
        const opponentTeam = normalizedTeams[j];
        await db.matches.add({
          tournamentId: Number(tournamentId),
          stage: 'group',
          groupName,
          team1Id: currentTeam,
          team2Id: opponentTeam,
          score: ''
        });
      }
    }

    navigate(`/tournament/${tournamentId}`);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-4">
          <Trophy className="text-emerald-500" /> NUEVO TORNEO
        </h2>
        
        <div className="grid gap-4">
          <input 
            placeholder="Nombre del Torneo (ej: Americano Nocturno)"
            className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            onChange={e => setConfig({...config, name: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <input 
              placeholder="Categoría"
              className="p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              onChange={e => setConfig({...config, category: e.target.value})}
            />
            <input 
              placeholder="Club"
              className="p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              onChange={e => setConfig({...config, club: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ClipboardList size={18} /> Pegar Parejas de WhatsApp
        </h3>
        <textarea 
          placeholder="Jugador 1 - Jugador 2&#10;Jugador 3-Jugador 4&#10;Jugador 5 -Jugador 6"
          className="w-full h-48 p-4 bg-slate-50 rounded-2xl font-mono text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          onChange={e => setRawData(e.target.value)}
        />
        <div className="mt-2 space-y-1">
          <p className="text-[10px] text-slate-400 italic">* Una pareja por cada línea de texto.</p>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">✓ Soporta formatos con o sin espacios entre guiones.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Configuración de Zonas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Parejas por Zona</label>
            <input 
              type="number" 
              defaultValue={4}
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-emerald-600 outline-none"
              onChange={e => setConfig({...config, teamsPerGroup: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Clasifican por Zona</label>
            <input 
              type="number" 
              defaultValue={2}
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-emerald-600 outline-none"
              onChange={e => setConfig({...config, qualifiedPerGroup: Number(e.target.value)})}
            />
          </div>
        </div>
      </div>

      <button 
        onClick={handleCreate}
        className="w-full bg-emerald-500 text-slate-900 font-black py-5 rounded-2xl shadow-xl shadow-emerald-100 uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all"
      >
        Crear y Generar Fixture
      </button>
    </div>
  );
}
