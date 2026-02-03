export interface TeamStats {
  teamId: string;
  matchesWon: number;
  gamesWon: number;
  gamesLost: number;
}

// Criterio: Partidos Ganados > Games Ganados > Diferencia Games
export const calculateStandings = (matches: any[], teams: string[]): TeamStats[] => {
  const stats: Record<string, TeamStats> = {};

  teams.forEach(id => {
    stats[id] = { teamId: id, matchesWon: 0, gamesWon: 0, gamesLost: 0 };
  });

  matches.forEach(m => {
    if (!m.score || !m.score.includes('-')) return;
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

export const generatePlayoffs = (standingsByGroup: Record<string, TeamStats[]>, qualifiedPerGroup: number) => {
  let allQualified: string[] = [];
  
  // Extraer clasificados: Primero todos los 1ros, luego los 2dos...
  for (let r = 0; r < qualifiedPerGroup; r++) {
    Object.keys(standingsByGroup).forEach(groupName => {
      const team = standingsByGroup[groupName][r];
      if (team) allQualified.push(team.teamId);
    });
  }

  const total = allQualified.length;
  let stage: 'final' | 'semi' | 'quarter' | 'round_of_16' | 'round_of_32' = 'final';

  if (total > 16) stage = 'round_of_32';
  else if (total > 8) stage = 'round_of_16';
  else if (total > 4) stage = 'quarter';
  else if (total > 2) stage = 'semi';

  const playoffMatches = [];
  const numMatches = Math.floor(total / 2);

  // Cruce: Mejor contra Peor (1ero vs último clasificado)
  for (let i = 0; i < numMatches; i++) {
    playoffMatches.push({
      team1Id: allQualified[i],
      team2Id: allQualified[total - 1 - i],
      stage,
      score: ''
    });
  }
  return playoffMatches;
};
