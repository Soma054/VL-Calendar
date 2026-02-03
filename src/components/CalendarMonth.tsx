import { format, isSameMonth, isToday } from "date-fns";
import type { IsoDateString } from "../lib/date";
import {
  buildCalendarDays,
  getCalendarGridRange,
  nextMonth,
  prevMonth,
  toIsoDateString,
} from "../lib/date";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

const WEEKDAYS_JA = ["月", "火", "水", "木", "金", "土", "日"];

type Props = {
  month: Date;
  selectedDate?: IsoDateString | null;
  datesWithData?: Set<string>;
  onMonthChange: (month: Date) => void;
  onSelectDate: (date: IsoDateString) => void;
};

export function CalendarMonth({
  month,
  selectedDate,
  datesWithData,
  onMonthChange,
  onSelectDate,
}: Props) {
  const days = buildCalendarDays(month);
  const { monthStart } = getCalendarGridRange(month);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {format(monthStart, "yyyy年 M月")}
          </h2>
          <Badge>月表示</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => onMonthChange(prevMonth(month))}>
            前
          </Button>
          <Button variant="secondary" onClick={() => onMonthChange(new Date())}>
            今月
          </Button>
          <Button variant="secondary" onClick={() => onMonthChange(nextMonth(month))}>
            次
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-sm font-medium text-slate-500">
        {WEEKDAYS_JA.map((label) => (
          <div key={label} className="px-2 py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => {
          const iso = toIsoDateString(day);
          const inMonth = isSameMonth(day, monthStart);
          const selected = iso === selectedDate;
          const hasData = datesWithData?.has(iso) ?? false;
          const today = isToday(day);

          const base =
            "relative flex h-24 flex-col justify-between rounded-2xl px-3 py-2 text-left text-base transition";
          const color = selected
            ? "bg-slate-900 text-white"
            : inMonth
              ? "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
              : "bg-slate-50 text-slate-400 ring-1 ring-slate-100 hover:bg-slate-100";

          return (
            <button
              key={iso}
              type="button"
              className={`${base} ${color}`}
              onClick={() => onSelectDate(iso)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold leading-none">{format(day, "d")}</span>
                {today && !selected ? (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    今日
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between">
                {hasData ? (
                  <span
                    className={
                      selected
                        ? "text-white/90"
                        : "text-slate-700"
                    }
                  >
                    ●
                  </span>
                ) : (
                  <span className="text-transparent">●</span>
                )}
                <span className="text-[10px] text-transparent">_</span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-500">
        ● = メモ/課題または録音が存在
      </p>
    </div>
  );
}
