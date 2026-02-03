import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

export type IsoDateString = `${number}-${number}-${number}`;

export function toIsoDateString(date: Date): IsoDateString {
  return format(date, "yyyy-MM-dd") as IsoDateString;
}

export function parseIsoDateString(value: string): Date {
  // ISO date-only string parses as UTC in some environments; keep it safe by constructing manually.
  const [y, m, d] = value.split("-").map((v) => Number(v));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function getCalendarGridRange(month: Date) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  // Week starts on Monday (1)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return { gridStart, gridEnd, monthStart, monthEnd };
}

export function buildCalendarDays(month: Date): Date[] {
  const { gridStart, gridEnd } = getCalendarGridRange(month);
  const days: Date[] = [];

  for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) {
    days.push(day);
  }

  return days;
}

export function nextMonth(month: Date) {
  return addMonths(month, 1);
}

export function prevMonth(month: Date) {
  return subMonths(month, 1);
}
