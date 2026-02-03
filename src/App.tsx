import { useEffect, useMemo, useState } from "react";
import { CalendarMonth } from "./components/CalendarMonth";
import { DayDetail } from "./components/DayDetail";
import { Recorder } from "./components/Recorder";
import { RecordingList } from "./components/RecordingList";
import { Card, CardContent } from "./components/ui/Card";
import { Button } from "./components/ui/Button";
import { getDatesWithDataInRange } from "./db/repository";
import {
  getCalendarGridRange,
  toIsoDateString,
  type IsoDateString,
} from "./lib/date";

function normalizeMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function App() {
  const [month, setMonth] = useState(() => normalizeMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<IsoDateString>(() =>
    toIsoDateString(new Date()),
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [refreshToken, setRefreshToken] = useState(0);
  const [datesWithData, setDatesWithData] = useState<Set<string>>(new Set());
  const [loadingDates, setLoadingDates] = useState(false);

  const monthRange = useMemo(() => {
    const { gridStart, gridEnd } = getCalendarGridRange(month);
    return {
      start: toIsoDateString(gridStart),
      end: toIsoDateString(gridEnd),
    };
  }, [month]);

  useEffect(() => {
    let cancelled = false;

    // Avoid sync setState in effect body (lint rule); schedule it.
    const t = setTimeout(() => {
      if (cancelled) return;
      setLoadingDates(true);
    }, 0);

    getDatesWithDataInRange({
      startDateInclusive: monthRange.start,
      endDateInclusive: monthRange.end,
    })
      .then((set) => {
        if (cancelled) return;
        setDatesWithData(set);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingDates(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [monthRange.start, monthRange.end, refreshToken]);

  const onChanged = () => setRefreshToken((v) => v + 1);

  const openSidebarForDate = (d: IsoDateString) => {
    setSelectedDate(d);
    setSidebarOpen(true);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
              Voice Log Calendar
            </h1>
            <p className="text-sm text-slate-500">
              録音 + メモ/課題を日付に紐づけて保存
            </p>
          </div>
          <div className="text-xs text-slate-500">
            {loadingDates ? "読み込み中..." : ""}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-4 py-6">
        <div
          className={
            "grid items-start gap-6 " +
            (sidebarOpen
              ? "md:grid-cols-[minmax(0,1fr)_560px]"
              : "md:grid-cols-1")
          }
        >
          <Card>
            <CardContent>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-sm text-slate-500">
                  日付を選択すると右に詳細が開きます
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setSidebarOpen((v) => !v)}
                >
                  {sidebarOpen ? "詳細を閉じる" : "詳細を開く"}
                </Button>
              </div>

              <CalendarMonth
                month={month}
                selectedDate={selectedDate}
                datesWithData={datesWithData}
                onMonthChange={(m) => setMonth(normalizeMonth(m))}
                onSelectDate={openSidebarForDate}
              />
            </CardContent>
          </Card>

          {/* Desktop: in-flow right column */}
          {sidebarOpen ? (
            <div className="hidden md:block">
              <div className="vlc-animate-slide-in-right space-y-4 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-900">詳細</div>
                  <Button variant="secondary" onClick={() => setSidebarOpen(false)}>
                    閉じる
                  </Button>
                </div>
                <DayDetail date={selectedDate} onChanged={onChanged} />
                <Recorder date={selectedDate} onSaved={onChanged} />
                <RecordingList
                  date={selectedDate}
                  refreshToken={refreshToken}
                  onChanged={onChanged}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Mobile: overlay + slide-over */}
        {sidebarOpen ? (
          <>
            <button
              type="button"
              className="vlc-animate-fade-in fixed inset-0 z-40 bg-black/30 md:hidden"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
            />
            <aside
              className="vlc-animate-slide-in-right fixed right-0 top-0 z-50 h-dvh w-[92vw] max-w-[560px] overflow-y-auto border-l border-slate-200 bg-slate-50 p-4 md:hidden"
              aria-label="Details sidebar"
            >
              <div className="mb-4 flex items-center justify-between gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                <div className="text-sm font-medium text-slate-900">詳細</div>
                <Button variant="secondary" onClick={() => setSidebarOpen(false)}>
                  閉じる
                </Button>
              </div>

              <div className="space-y-4">
                <DayDetail date={selectedDate} onChanged={onChanged} />
                <Recorder date={selectedDate} onSaved={onChanged} />
                <RecordingList
                  date={selectedDate}
                  refreshToken={refreshToken}
                  onChanged={onChanged}
                />
              </div>
            </aside>
          </>
        ) : null}
      </main>
    </div>
  );
}
