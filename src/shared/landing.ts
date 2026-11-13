/** Links das lojas. `null` mostra o selo "Em breve"; preencha com a URL pública quando o app for publicado. */
export const STORE_LINKS: {
  appStore: string | null;
  playStore: string | null;
} = {
  appStore: null,
  playStore: null,
};

/** URL pública do site (landing, Termos e Privacidade). */
export const SITE_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.vezzo.cloud";
