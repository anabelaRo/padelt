import Dexie, { Table } from 'dexie';

export interface Tournament {
  id?: number;
  name: string;
  date: Date;
  category: string;
  club: string;
  status: 'groups' | 'playoffs' | 'finished';
  config: {
    teamsPerGroup: number;
    qualifiedPerGroup: number;
  };
}

export interface Match {
  id?: number;
  tournamentId: number;
  stage: 'group' | 'quarter' | 'semi' | 'final';
  groupName?: string; // "Zona A", "Zona B"
  team1Id: string; // "P1-P2"
  team2Id: string;
  score: string; // "6-4"
}

class PadelDB extends Dexie {
  tournaments!: Table<Tournament>;
  matches!: Table<Match>;
  players!: Table<{id?: number, name: string, category: string}>;

  constructor() {
    super('PadelTournamentDB');
    this.version(1).stores({
      tournaments: '++id, name, date, category',
      matches: '++id, tournamentId, stage, groupName',
      players: '++id, name, category'
    });
  }
}

export const db = new PadelDB();
