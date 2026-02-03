import { db, type DayEntry, type Recording } from "./db";

export async function getEntry(date: string): Promise<DayEntry | undefined> {
  return db.entries.get(date);
}

export async function deleteEntry(date: string): Promise<void> {
  await db.entries.delete(date);
}

export async function getOrCreateEntry(date: string): Promise<DayEntry> {
  const existing = await db.entries.get(date);
  if (existing) return existing;

  const entry: DayEntry = {
    date,
    memo: "",
    tasks: "",
    updatedAt: Date.now(),
  };

  await db.entries.put(entry);
  return entry;
}

export async function saveEntry(params: {
  date: string;
  memo: string;
  tasks: string;
}): Promise<void> {
  await db.entries.put({
    date: params.date,
    memo: params.memo,
    tasks: params.tasks,
    updatedAt: Date.now(),
  });
}

export async function listRecordings(date: string): Promise<Recording[]> {
  return db.recordings.where("date").equals(date).sortBy("createdAt");
}

export async function addRecording(params: {
  date: string;
  name: string;
  mimeType: string;
  blob: Blob;
}): Promise<number> {
  return db.recordings.add({
    date: params.date,
    name: params.name,
    mimeType: params.mimeType,
    blob: params.blob,
    createdAt: Date.now(),
  });
}

export async function deleteRecording(id: number): Promise<void> {
  await db.recordings.delete(id);
}

export async function getDatesWithDataInRange(params: {
  startDateInclusive: string;
  endDateInclusive: string;
}): Promise<Set<string>> {
  const { startDateInclusive, endDateInclusive } = params;

  const entryRows = await db.entries
    .where("date")
    .between(startDateInclusive, endDateInclusive, true, true)
    .toArray();

  // recordings.primaryKeys() returns numeric IDs, so instead query date values
  const recordingRows = await db.recordings
    .where("date")
    .between(startDateInclusive, endDateInclusive, true, true)
    .toArray();

  const dates = new Set<string>();
  for (const e of entryRows) {
    if ((e.memo && e.memo.trim().length > 0) || (e.tasks && e.tasks.trim().length > 0)) {
      dates.add(e.date);
    }
  }
  for (const r of recordingRows) dates.add(r.date);

  return dates;
}
