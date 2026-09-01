const DEFAULT_TIMEZONE = "Asia/Kolkata";

const WEEKDAY_ABBREV = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;

export type ResolvedDate = {
  iso: string;
  label: string;
};

function getDatePartsInTimezone(
  date: Date,
  timeZone: string
): { year: number; month: number; day: number; dayOfWeek: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });

  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find((p) => p.type === "year")!.value, 10);
  const month = parseInt(parts.find((p) => p.type === "month")!.value, 10) - 1;
  const day = parseInt(parts.find((p) => p.type === "day")!.value, 10);
  const weekday = parts
    .find((p) => p.type === "weekday")!
    .value.toLowerCase();
  const dayOfWeek = WEEKDAY_ABBREV.indexOf(weekday as typeof WEEKDAY_ABBREV[number]);

  return { year, month, day, dayOfWeek };
}

function getUTCDateForLocalDate(
  year: number,
  month: number,
  day: number,
  timeZone: string
): Date {
  const noonUTC = new Date(Date.UTC(year, month, day, 12, 0, 0));
  const offsetStr = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  }).format(noonUTC);

  const offsetMatch = offsetStr.match(/GMT([+-])(\d+):(\d+)/);
  if (!offsetMatch) {
    return new Date(Date.UTC(year, month, day, 0, 0, 0));
  }

  const sign = offsetMatch[1] === "+" ? 1 : -1;
  const hours = parseInt(offsetMatch[2], 10);
  const minutes = parseInt(offsetMatch[3], 10);
  const offsetMs = sign * (hours * 60 + minutes) * 60 * 1000;

  return new Date(Date.UTC(year, month, day, 0, 0, 0) - offsetMs);
}

function addDaysInTimezone(
  reference: Date,
  daysToAdd: number,
  timeZone: string
): { year: number; month: number; day: number } {
  const refParts = getDatePartsInTimezone(reference, timeZone);
  const base = new Date(Date.UTC(refParts.year, refParts.month, refParts.day, 12, 0, 0));
  base.setUTCDate(base.getUTCDate() + daysToAdd);
  return {
    year: base.getUTCFullYear(),
    month: base.getUTCMonth(),
    day: base.getUTCDate(),
  };
}

function resolveExplicitDate(text: string): string | null {
  const trimmed = text.trim();

  const isoDate = trimmed.match(/^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{1,2}:\d{2}(?::\d{2})?)?(?:\s*([+-]\d{2}:?\d{2}|Z))?)?$/);
  if (isoDate) {
    const dateStr = isoDate[1];
    const timeStr = isoDate[2] ?? "00:00:00";
    const offsetStr = isoDate[3] ?? "Z";
    const candidate = `${dateStr}T${timeStr}${offsetStr}`;
    const parsed = new Date(candidate);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  const commonFormats = [
    trimmed,
    trimmed.replace(/\//g, "-"),
  ];

  for (const candidate of commonFormats) {
    const parsed = new Date(candidate);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return null;
}

export function resolveRelativeDate(
  text: string,
  reference: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE
): ResolvedDate | null {
  const normalized = text.trim().toLowerCase();

  const explicit = resolveExplicitDate(normalized);
  if (explicit !== null) {
    const date = new Date(explicit);
    const label = date.toLocaleString("en-US", {
      timeZone,
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return { iso: explicit, label };
  }

  const refParts = getDatePartsInTimezone(reference, timeZone);

  if (normalized === "today") {
    const utcDate = getUTCDateForLocalDate(refParts.year, refParts.month, refParts.day, timeZone);
    return { iso: utcDate.toISOString(), label: "today" };
  }

  if (normalized === "tomorrow") {
    const tomorrow = addDaysInTimezone(reference, 1, timeZone);
    const utcDate = getUTCDateForLocalDate(tomorrow.year, tomorrow.month, tomorrow.day, timeZone);
    return { iso: utcDate.toISOString(), label: "tomorrow" };
  }

  if (normalized === "yesterday") {
    const yesterday = addDaysInTimezone(reference, -1, timeZone);
    const utcDate = getUTCDateForLocalDate(yesterday.year, yesterday.month, yesterday.day, timeZone);
    return { iso: utcDate.toISOString(), label: "yesterday" };
  }

  const weekdayMatch = normalized.match(/^(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
  if (weekdayMatch) {
    const isNext = weekdayMatch[1] === "next ";
    const targetDay = WEEKDAY_ABBREV.indexOf(weekdayMatch[2].slice(0, 3) as typeof WEEKDAY_ABBREV[number]);
    const currentDay = refParts.dayOfWeek;

    let daysUntil: number;
    if (isNext) {
      daysUntil = (targetDay - currentDay + 7) % 7;
      if (daysUntil === 0) {
        daysUntil = 7;
      } else {
        daysUntil += 7;
      }
    } else {
      daysUntil = (targetDay - currentDay + 7) % 7;
    }

    const target = addDaysInTimezone(reference, daysUntil, timeZone);
    const utcDate = getUTCDateForLocalDate(target.year, target.month, target.day, timeZone);
    return { iso: utcDate.toISOString(), label: weekdayMatch[0].trim() };
  }

  return null;
}

export { DEFAULT_TIMEZONE };
