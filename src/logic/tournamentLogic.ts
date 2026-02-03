// src/logic/tournamentLogic.ts

/**
 * Calcula la tabla de posiciones de un grupo
 */
export const calculateStandings = (matches: any[], teams: string[]) => {
  // Inicializamos las estadísticas para cada equipo
  const stats = teams.reduce((acc: any, team) => {
    acc[team] = { 
      team, 
      played: 0, 
      won: 0, 
      lost: 0, 
      gamesWon: 0, 
      gamesLost: 0, 
      diff: 0, 
      points: 0 
    };
    return acc;
  }, {});

  matches.forEach(m => {
    const scoreStr = m.score || "";
    const scores = scoreStr.split('-').map(Number);
    
    // Solo procesar si el score es válido (ej: "6-2")
    if (scores.length !== 2 || isNaN(scores[0]) || isNaN(scores[1])) return;

    const [s1, s2] = scores;
    const t1 = m.team1Id;
    const t2 = m.team2Id;

    // Verificamos que los equipos existan en nuestro objeto de estadísticas
    if (!stats[t1] || !stats[t2]) return;

    stats[t1].played++;
    stats[t2].played++;
    stats[t1].gamesWon += s1;
    stats[t1].gamesLost += s2;
    stats[t2].gamesWon += s2;
    stats[t2].gamesLost += s1;

    // LÓGICA DE PARTIDOS GANADOS (PG)
    if (s1 > s2) {
      stats[t1].won += 1;   // Suma 1 a Partidos Ganados
      stats[t1].points += 1; // Suma 1 a Puntos
      stats[t2].lost += 1;
    } else if (s2 > s1) {
      stats[t2].won += 1;   // Suma 1 a Partidos Ganados
      stats[t2].points += 1; // Suma 1 a Puntos
      stats[t1].lost += 1;
    }
  });

  return Object.values(stats)
    .map((s: any) => ({ 
      ...s, 
      diff: s.gamesWon - s.gamesLost 
    }))
    .sort((a: any, b: any) => 
      b.points - a.points || 
      b.diff - a.diff || 
      b.gamesWon - a.gamesWon
    );
};
/**
 * Genera la primera fase de Playoffs (Cuartos o Semis) desde las zonas
 */
export const generatePlayoffs = (standingsByGroup: any, qualifiedPerGroup: number) => {
  const allClassified: string[] = [];
  Object.values(standingsByGroup).forEach((group: any) => {
    for (let i = 0; i < qualifiedPerGroup; i++) {
      if (group[i]) allClassified.push(group[i].team);
    }
  });

  const totalTeams = allClassified.length;
  let stage: 'round_of_16' | 'quarter' | 'semi' | 'final' = 'quarter';
  
  if (totalTeams <= 2) stage = 'final';
  else if (totalTeams <= 4) stage = 'semi';
  else if (totalTeams <= 8) stage = 'quarter';
  else stage = 'round_of_16';

  const playoffMatches = [];
  // Cruces simples: 1ero vs último, 2do vs anteúltimo
  for (let i = 0; i < totalTeams / 2; i++) {
    playoffMatches.push({
      stage,
      team1Id: allClassified[i],
      team2Id: allClassified[totalTeams - 1 - i],
      score: ''
    });
  }
  return playoffMatches;
};

/**
 * LÓGICA DE PROGRESIÓN DE LLAVES (CORREGIDA)
 * Determina a qué partido de la siguiente fase debe ir el ganador
 */
export const promoteWinner = (currentMatch: any, allPlayoffMatches: any[]) => {
  // 1. Validaciones de existencia
  if (!currentMatch || !currentMatch.stage || !currentMatch.score) return null;

  // 2. Validar formato de score "X-Y"
  const parts = currentMatch.score.split('-');
  if (parts.length !== 2) return null;
  
  const s1 = parseInt(parts[0]);
  const s2 = parseInt(parts[1]);
  if (isNaN(s1) || isNaN(s2)) return null;

  // 3. Identificar al ganador
  const winnerId = s1 > s2 ? currentMatch.team1Id : currentMatch.team2Id;
  if (!winnerId || winnerId === 'A confirmar') return null;

  // 4. Mapa de flujo de torneo
  const nextStageMap: Record<string, string> = {
    'round_of_16': 'quarter',
    'quarter': 'semi',
    'semi': 'final'
  };

  const nextStage = nextStageMap[currentMatch.stage];
  if (!nextStage) return null;

  // 5. Encontrar la posición del partido actual en su etapa
  // Filtramos por stage y ORDENAMOS por ID para que el MatchIndex sea consistente
  const stageMatches = allPlayoffMatches
    .filter(m => m.stage === currentMatch.stage)
    .sort((a, b) => (a.id || 0) - (b.id || 0));

  const matchIndex = stageMatches.findIndex(m => m.id === currentMatch.id);
  
  if (matchIndex === -1) return null;

  // 6. Matemática de llaves
  // MatchIndex 0 y 1 de Cuartos alimentan el MatchIndex 0 de Semis
  // MatchIndex 2 y 3 de Cuartos alimentan el MatchIndex 1 de Semis
  const nextMatchIndex = Math.floor(matchIndex / 2);
  const isTeam1InNextMatch = (matchIndex % 2 === 0);

  return {
    winnerId,
    nextStage,
    nextMatchIndex,
    isTeam1InNextMatch
  };
};
