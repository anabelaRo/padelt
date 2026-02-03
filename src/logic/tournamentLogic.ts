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
