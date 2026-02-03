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
  stage: string; 
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
