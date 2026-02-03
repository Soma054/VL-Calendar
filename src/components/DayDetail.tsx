import { useEffect, useMemo, useState } from "react";
import type { IsoDateString } from "../lib/date";
import { parseIsoDateString } from "../lib/date";
import { deleteEntry, getEntry, saveEntry } from "../db/repository";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { Textarea } from "./ui/Textarea";

type Props = {
  date: IsoDateString;
  onChanged?: () => void;
};

export function DayDetail({ date, onChanged }: Props) {
  const title = useMemo(() => {
    const d = parseIsoDateString(date);
    return `${d.getFullYear()}年 ${d.getMonth() + 1}月 ${d.getDate()}日`;
  }, [date]);

  const [memo, setMemo] = useState("");
  const [tasks, setTasks] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDirty(false);

    getEntry(date)
      .then((entry) => {
        if (cancelled) return;
        setMemo(entry?.memo ?? "");
        setTasks(entry?.tasks ?? "");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  async function onSave() {
    setSaving(true);
    try {
      const memoTrimmed = memo.trim();
      const tasksTrimmed = tasks.trim();
      if (memoTrimmed.length === 0 && tasksTrimmed.length === 0) {
        await deleteEntry(date);
      } else {
        await saveEntry({ date, memo, tasks });
      }
      setDirty(false);
      onChanged?.();
    } finally {
      setSaving(false);
    }
  }

  async function onClear() {
    setSaving(true);
    try {
      await deleteEntry(date);
      setMemo("");
      setTasks("");
      setDirty(false);
      onChanged?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm text-slate-500">選択日</div>
            <div className="text-lg font-semibold text-slate-900">{title}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={onClear}
              disabled={saving || loading}
              title="メモ/課題の内容を削除"
            >
              クリア
            </Button>
            <Button onClick={onSave} disabled={saving || loading || !dirty}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="mb-1 text-sm font-medium text-slate-800">
              今日のメモ
            </div>
            <Textarea
              rows={5}
              placeholder={loading ? "読み込み中..." : "気づいたこと、振り返りなど"}
              value={memo}
              onChange={(e) => {
                setMemo(e.target.value);
                setDirty(true);
              }}
              disabled={loading || saving}
            />
          </div>

          <div>
            <div className="mb-1 text-sm font-medium text-slate-800">
              今日の課題
            </div>
            <Textarea
              rows={4}
              placeholder={loading ? "読み込み中..." : "次回までにやること、意識すること"}
              value={tasks}
              onChange={(e) => {
                setTasks(e.target.value);
                setDirty(true);
              }}
              disabled={loading || saving}
            />
          </div>

          <p className="text-xs text-slate-500">
            内容はこのブラウザ内に保存されます。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
