import { useEffect, useMemo, useRef, useState } from "react";
import type { IsoDateString } from "../lib/date";
import { addRecording } from "../db/repository";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { Input } from "./ui/Input";

function pickMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  if (typeof MediaRecorder === "undefined") return "";
  for (const c of candidates) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isSupported = (MediaRecorder as any).isTypeSupported?.(c);
    if (isSupported) return c;
  }

  return "";
}

type Props = {
  date: IsoDateString;
  onSaved?: () => void;
};

export function Recorder({ date, onSaved }: Props) {
  const supported = typeof navigator !== "undefined" && !!navigator.mediaDevices;
  const mimeType = useMemo(() => pickMimeType(), []);

  const [name, setName] = useState<string>("録音");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedDateRef = useRef<IsoDateString>(date);

  useEffect(() => {
    return () => {
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        // ignore
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function start() {
    setError(null);
    setBusy(true);

    try {
      startedDateRef.current = date;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.addEventListener("dataavailable", (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      });

      recorder.addEventListener("stop", async () => {
        setBusy(true);
        try {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || mimeType || "audio/webm",
          });

          if (blob.size === 0) {
            return;
          }

          const trimmed = name.trim();
          const finalName = trimmed.length > 0 ? trimmed : "録音";
          await addRecording({
            date: startedDateRef.current,
            name: finalName,
            mimeType: blob.type,
            blob,
          });
          onSaved?.();
        } catch (e) {
          setError(e instanceof Error ? e.message : String(e));
        } finally {
          setBusy(false);
        }
      });

      recorder.start();
      setRecording(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function stop() {
    setError(null);

    try {
      mediaRecorderRef.current?.stop();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return;
    }

    setRecording(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

  }

  const disabled = !supported || busy;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm text-slate-500">録音</div>
            <div className="text-base font-semibold text-slate-900">
              MediaRecorder
            </div>
          </div>
          <div className="flex items-center gap-2">
            {recording ? (
              <Button variant="danger" onClick={stop} disabled={disabled}>
                停止
              </Button>
            ) : (
              <Button onClick={start} disabled={disabled}>
                録音開始
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm font-medium text-slate-800">
              ファイル名（表示用）
            </div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: ハミング練習"
              disabled={busy}
            />
          </div>

          <div className="text-xs text-slate-500">
            {supported ? (
              <>
                {mimeType ? (
                  <>使用mimeType: {mimeType}</>
                ) : (
                  <>使用mimeType: ブラウザ既定</>
                )}
              </>
            ) : (
              <>このブラウザは録音APIに対応していません。</>
            )}
          </div>

          {error ? (
            <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
              {error}
            </div>
          ) : null}

          <p className="text-xs text-slate-500">
            ※ 初回はマイク権限が必要です（拒否すると録音できません）。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
