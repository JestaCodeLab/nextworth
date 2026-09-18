export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatRelativeTime(value: string | Date) {
  const seconds = (Date.now() - new Date(value).getTime()) / 1000;
  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (seconds >= unitSeconds) {
      return relativeTimeFormatter.format(-Math.floor(seconds / unitSeconds), unit);
    }
  }
  return relativeTimeFormatter.format(0, "minute");
}
