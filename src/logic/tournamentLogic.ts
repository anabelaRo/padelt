// src/logic/tournamentLogic.ts

/**
 * Calcula la tabla de posiciones de un grupo
 */
export const calculateStandings = (matches: any[], teams: string[]) => {
  const stats = teams.reduce((acc: any, team) => {
    acc[team] = { 
      team, 
      played: 0, 
      won: 0, // PG
      lost: 0, 
      gamesWon: 0, // GG
      gamesLost: 0, 
      diff: 0, 
      points: 0 
    };
    return acc;
  }, {});

  matches.forEach(m => {
    if (!m.score || !m.score.includes('-')) return;

    const scores = m.score.split('-').map(Number);
    if (scores.length !== 2 || isNaN(scores[0]) || isNaN(scores[1])) return;

    const [s1, s2] = scores;
    
    // Aseguramos que los equipos existan en el objeto stats
    if (stats[m.team1Id] && stats[m.team2Id]) {
      stats[m.team1Id].played += 1;
      stats[m.team2Id].played += 1;
      stats[m.team1Id].gamesWon += s1;
      stats[m.team1Id].gamesLost += s2;
      stats[m.team2Id].gamesWon += s2;
      stats[m.team2Id].gamesLost += s1;

      // CÁLCULO DE GANADOR (PG)
      if (s1 > s2) {
        stats[m.team1Id].won = (stats[m.team1Id].won || 0) + 1;
        stats[m.team1Id].points = (stats[m.team1Id].points || 0) + 1;
        stats[m.team2Id].lost += 1;
      } else if (s2 > s1) {
        stats[m.team2Id].won = (stats[m.team2Id].won || 0) + 1;
        stats[m.team2Id].points = (stats[m.team2Id].points || 0) + 1;
        stats[m.team1Id].lost += 1;
      }
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

// ... (el resto de tus funciones promoteWinner y generatePlayoffs)
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
