/** "outubro de 2026" / "October 2026" a partir de um instante ISO. */
export function formatMonthYear(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(iso));
}

/** Hora local "07:30" de um instante ISO, no fuso do usuário. */
export function formatClock(iso: string, timeZone: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone }).format(
    new Date(iso),
  );
}
