import Dexie, { type Table } from "dexie";

export type DayEntry = {
  date: string; // yyyy-MM-dd
  memo: string;
  tasks: string;
  updatedAt: number;
};

export type Recording = {
  id?: number;
  date: string; // yyyy-MM-dd
  name: string;
  mimeType: string;
  blob: Blob;
  createdAt: number;
};

class VoiceLogDatabase extends Dexie {
  entries!: Table<DayEntry, string>;
  recordings!: Table<Recording, number>;

  constructor() {
    super("voice-log-db");

    this.version(1).stores({
      entries: "date, updatedAt",
      recordings: "++id, date, createdAt",
    });
  }
}

export const db = new VoiceLogDatabase();
