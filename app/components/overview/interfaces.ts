export interface ChartData {

  missionSuccessRate: any[],
  deaths: any[],
  revives: any[],
  missionsWon: any[],
  timePlayed: any[],
  automatonKills: any[],
  illuminateKills: any[],
  missionsLost: any[],
  bulletsFired: any[],
  friendlies: any[],
  bulletsHit: any[],
  accurracy: any[],
  bugKills: any[],
  missionTime: any[]

}

export interface Stats {
  galaxy_stats: StatBlock;
  planets_stats: PlanetStatBlock[]
}

export type PlanetStatBlock = {
  planetIndex: number;
  missionSuccessRate: number;
  deaths: number;
  revives: number;
  missionsWon: number;
  timePlayed: number;
  automatonKills: number;
  illuminateKills: number;
  missionsLost: number;
  created: Created;
  bulletsFired: number;
  friendlies: number;
  bulletsHit: number;
  accurracy: number;
  bugKills: number;
  missionTime: number;
}

export type StatBlock = {
  missionSuccessRate: number;
  deaths: number;
  revives: number;
  missionsWon: number;
  timePlayed: number;
  automatonKills: number;
  illuminateKills: number;
  missionsLost: number;
  created: Created;
  bulletsFired: number;
  friendlies: number;
  bulletsHit: number;
  accurracy: number;
  bugKills: number;
  missionTime: number;
}

interface Created {
  seconds: number;
  nanoseconds: number;
}
