// E2E do fluxo de redefinição de senha: handler real do Better Auth + MongoDB + Resend.
// Usa o endereço de teste do Resend (delivered@resend.dev), lê os e-mails pela API do Resend
// e remove o usuário criado ao final. Rode com: bun scripts/e2e-reset-password.ts
import { Resend } from "resend";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";

const base = process.env.BETTER_AUTH_URL ?? "http://localhost:8081";
const resend = new Resend(process.env.RESEND_API_KEY);
const email = `delivered+e2e${Date.now()}@resend.dev`;
const oldPassword = "senha-antiga-123";
const newPassword = "senha-nova-456";

const call = (path: string, init?: { method?: string; body?: unknown }) =>
  auth.handler(
    new Request(`${base}/api/auth${path}`, {
      method: init?.method ?? (init?.body ? "POST" : "GET"),
      headers: { "content-type": "application/json", origin: base, "accept-language": "en" },
      body: init?.body ? JSON.stringify(init.body) : undefined,
      redirect: "manual",
    }),
  );

const step = (msg: string) => console.log(`✔ ${msg}`);
function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`FALHA: ${msg}`);
}

/** Espera chegar um e-mail para `email` com o assunto e devolve o HTML (via API do Resend). */
async function waitForEmail(subject: RegExp, seen: Set<string>): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const list = await resend.emails.list();
    const hit = list.data?.data.find((m) => !seen.has(m.id) && m.to.includes(email) && subject.test(m.subject));
    if (hit) {
      seen.add(hit.id);
      const full = await resend.emails.get(hit.id);
      assert(full.data?.html, "e-mail sem html");
      return full.data.html;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`FALHA: e-mail ${subject} não chegou`);
}
const linkOf = (html: string) => html.match(/href="([^"]+)"/)![1]!.replaceAll("&amp;", "&");

async function main() {
  const seen = new Set<string>();

  const signUp = await call("/sign-up/email", { body: { email, password: oldPassword, name: "E2E" } });
  assert(signUp.ok, `sign-up ${signUp.status}`);
  step("cadastro");

  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  assert(profile?.language === "en", "Profile criado pelo hook com idioma de Accept-Language");
  step("Profile criado pelo hook após o cadastro");

  assert((await call("/sign-in/email", { body: { email, password: oldPassword } })).status === 403, "login bloqueado sem verificação");
  step("login bloqueado antes da verificação");

  const verifyLink = linkOf(await waitForEmail(/confirm your email/i, seen));
  assert((await call(new URL(verifyLink).pathname.replace("/api/auth", "") + new URL(verifyLink).search)).status < 400, "verificação");
  step("e-mail verificado pelo link recebido");

  assert((await call("/request-password-reset", { body: { email, redirectTo: "vezzo://reset-password" } })).ok, "pedido de redefinição");
  const resetLink = new URL(linkOf(await waitForEmail(/reset your vezzo password/i, seen)));
  step("e-mail de redefinição recebido");

  const redirect = await call(resetLink.pathname.replace("/api/auth", "") + resetLink.search);
  const location = redirect.headers.get("location") ?? "";
  assert(location.startsWith("vezzo://reset-password?token="), `redirect para o deep link (${location.slice(0, 40)})`);
  const token = new URL(location).searchParams.get("token")!;
  step("link redireciona para vezzo://reset-password?token=…");

  assert((await call("/reset-password", { body: { newPassword, token } })).ok, "reset-password");
  step("senha redefinida");

  await waitForEmail(/password was changed/i, seen);
  step("aviso password-changed recebido");

  assert((await call("/reset-password", { body: { newPassword: "outra-senha-789", token } })).status >= 400, "token é de uso único");
  step("token reutilizado é rejeitado");

  assert((await call("/sign-in/email", { body: { email, password: oldPassword } })).status === 401, "senha antiga recusada");
  assert((await call("/sign-in/email", { body: { email, password: newPassword } })).ok, "senha nova aceita");
  step("login: senha antiga recusada, nova aceita");

  return user.id;
}

let userId: string | undefined;
main()
  .then((id) => {
    userId = id;
    console.log("\nE2E OK");
  })
  .catch((e) => {
    process.exitCode = 1;
    console.error(e);
  })
  .finally(async () => {
    const user = await prisma.user.findUnique({ where: { email } });
    const id = userId ?? user?.id;
    if (id) {
      await prisma.session.deleteMany({ where: { userId: id } });
      await prisma.account.deleteMany({ where: { userId: id } });
      await prisma.profile.deleteMany({ where: { userId: id } });
      await prisma.user.deleteMany({ where: { id } });
    }
    await prisma.verification.deleteMany({ where: { identifier: { contains: email } } });
    console.log("limpeza: usuário de teste removido");
    await prisma.$disconnect();
  });
