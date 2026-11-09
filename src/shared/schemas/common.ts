import { z } from "zod";
import { GOAL_UNITS } from "../categories";
import { isSingleEmoji } from "../emoji";

export const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const objectId = z.string().regex(/^[0-9a-f]{24}$/i);
export const goalUnit = z.enum(GOAL_UNITS);
export const emoji = z.string().min(1).max(16).refine(isSingleEmoji, "Use um único emoji");

export const ACCENTS = ["#b9d94c", "#3fbf9f", "#4f9cf0", "#9a7df0", "#ee6f8f", "#f08a52", "#eab33a"] as const;
export const themeMode = z.enum(["DARK", "LIGHT", "SYSTEM"]);
export const language = z.enum(["pt-BR", "en"]);
export const logStatus = z.enum(["PENDING", "DONE", "SKIPPED"]);
export const logSource = z.enum(["APP", "NOTIFICATION"]);

export const timezone = z.string().refine((tz) => {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}, "Fuso horário inválido");

/** Intervalo máximo aceito em consultas por período. */
export const MAX_RANGE_DAYS = 400;
