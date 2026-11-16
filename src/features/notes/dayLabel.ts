import { addDays, type Ymd } from "@/shared/dates";

type Translate = (key: string) => string;

/** "Hoje", "Ontem" ou o dia por extenso ("12 de novembro"), sempre a partir da data local `YYYY-MM-DD`. */
export function dayLabel(date: Ymd, today: Ymd, locale: string, t: Translate): string {
  if (date === today) return t("habit.notes.today");
  if (date === addDays(today, -1)) return t("habit.notes.yesterday");
  const sameYear = date.slice(0, 4) === today.slice(0, 4);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
