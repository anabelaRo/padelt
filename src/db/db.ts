import Dexie, { Table } from 'dexie';

export interface Tournament {
  id?: number;
  name: string;
  category: string;
  club: string;
  date: Date;
  status: 'groups' | 'playoffs' | 'finished';
  config: { qualifiedPerGroup: number };
}

export interface Match {
  id?: number;
  tournamentId: number;
  stage: 'group' | 'round_of_32' | 'round_of_16' | 'quarter' | 'semi' | 'final';
  groupName?: string;
  team1Id: string;
  team2Id: string;
  score: string;
}

class TournamentDB extends Dexie {
  tournaments!: Table<Tournament>;
  matches!: Table<Match>;

  constructor() {
    super('PadelProDB');
    this.version(1).stores({
      tournaments: '++id, name, status',
      matches: '++id, tournamentId, stage'
    });
  }
}

export const db = new TournamentDB();