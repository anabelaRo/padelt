export interface TeamStats {
  teamId: string;
  matchesWon: number;
  gamesWon: number;
  gamesLost: number;
  diff: number;
}

export const calculateStandings = (matches: any[], teams: any[]) => {
  const stats: Record<string, TeamStats> = {};

  teams.forEach(t => {
    stats[t.id] = { teamId: t.id, matchesWon: 0, gamesWon: 0, gamesLost: 0, diff: 0 };
  });

  matches.forEach(m => {
    if (!m.score) return;
    const [g1, g2] = m.score.split('-').map(Number);
    
    stats[m.team1Id].gamesWon += g1;
    stats[m.team1Id].gamesLost += g2;
    stats[m.team2Id].gamesWon += g2;
    stats[m.team2Id].gamesLost += g1;

    if (g1 > g2) stats[m.team1Id].matchesWon++;
    else if (g2 > g1) stats[m.team2Id].matchesWon++;
  });

  return Object.values(stats).sort((a, b) => {
    if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
    if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
    return (b.gamesWon - b.gamesLost) - (a.gamesWon - a.gamesLost);
  });
};

// src/logic/tournamentLogic.ts

export const generatePlayoffs = (standingsByGroup: Record<string, TeamStats[]>, qualifiedPerGroup: number) => {
  let allQualified: string[] = [];
  
  // 1. Extraer clasificados respetando el orden de mérito de cada grupo
  // Primero todos los 1eros, luego todos los 2dos, etc.
  const maxRank = qualifiedPerGroup;
  for (let r = 0; r < maxRank; r++) {
    Object.keys(standingsByGroup).forEach(groupName => {
      const team = standingsByGroup[groupName][r];
      if (team) allQualified.push(team.teamId);
    });
  }

  const totalQualified = allQualified.length;

  // 2. Determinar el nombre de la ronda inicial
  // 2 equipos = final, 4 = semi, 8 = 4tos, 16 = 8vos, 32 = 16avos
  let stageName: 'final' | 'semi' | 'quarter' | 'round_of_16' | 'round_of_32' = 'final';
  
  if (totalQualified <= 2) stageName = 'final';
  else if (totalQualified <= 4) stageName = 'semi';
  else if (totalQualified <= 8) stageName = 'quarter';
  else if (totalQualified <= 16) stageName = 'round_of_16';
  else stageName = 'round_of_32';

  const playoffMatches = [];
  const numMatches = Math.floor(totalQualified / 2);

  // 3. Emparejamiento: Mejor clasificado vs Peor clasificado (Cruces tradicionales)
  for (let i = 0; i < numMatches; i++) {
    playoffMatches.push({
      team1Id: allQualified[i],
      team2Id: allQualified[totalQualified - 1 - i],
      stage: stageName,
      score: ''
    });
  }

  return playoffMatches;
};
