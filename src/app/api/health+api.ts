import { json } from "@/server/http";

// Exceção deliberada à regra 13: health check público, sem sessão.
export function GET() {
  return json({ ok: true, time: new Date().toISOString() });
}
