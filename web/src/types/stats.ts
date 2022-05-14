import { Purchase } from './purchase';

export type Stats = {
  totalPlaytimeMinutes: number
  numberPlayed: number;
  percentagePlayed: number;
  numberOwned: number;
  totalCost: number;
  costPerMinute: number;
  playedList: Purchase[]
  };