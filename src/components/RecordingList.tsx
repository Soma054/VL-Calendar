import { useEffect, useMemo, useState } from "react";
import type { Recording } from "../db/db";
import { addRecording, deleteRecording, listRecordings } from "../db/repository";
import type { IsoDateString } from "../lib/date";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader } from "./ui/Card";

function RecordingRow({
  recording,
  onDelete,
}: {
  recording: Recording;
  onDelete: (id: number) => void;
}) {
  const url = useMemo(() => {
    return URL.createObjectURL(recording.blob);
  }, [recording.blob]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [url]);

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-slate-900">
            {recording.name}
          </div>
          <div className="text-xs text-slate-500">{recording.mimeType}</div>
        </div>
        <Button
          variant="ghost"
          className="text-rose-700 hover:bg-rose-50"
          onClick={() => onDelete(recording.id ?? -1)}
          disabled={!recording.id}
        >
          削除
        </Button>
      </div>
      <audio controls src={url} className="w-full" />
    </div>
  );
}

type Props = {
  date: IsoDateString;
  refreshToken?: number;
  onChanged?: () => void;
};

export function RecordingList({ date, refreshToken, onChanged }: Props) {
  const [items, setItems] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const rows = await listRecordings(date);
      setItems(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, refreshToken]);

  async function onUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError(null);
    try {
      const file = files[0];
      await addRecording({
        date,
        name: file.name,
        mimeType: file.type || "audio/*",
        blob: file,
      });
      await reload();
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function onDelete(id: number) {
    if (id < 0) return;
    setError(null);
    try {
      await deleteRecording(id);
      await reload();
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm text-slate-500">音声ファイル</div>
            <div className="text-base font-semibold text-slate-900">
              保存 / 再生 / 削除
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50">
              アップロード
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => void onUpload(e.target.files)}
              />
            </label>
            <Button variant="secondary" onClick={() => void reload()}>
              再読込
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {error ? (
            <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="text-sm text-slate-500">読み込み中...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-slate-500">
              この日の音声ファイルはまだありません。
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((r) => (
                <RecordingRow
                  key={String(r.id)}
                  recording={r}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          <p className="text-xs text-slate-500">
            アップロードした音声もこのブラウザ内に保存されます。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
