# Textos legais

Os Termos de Uso e a Política de Privacidade vivem no código, para o app e a web mostrarem a mesma versão:

- Textos: `src/i18n/legal/pt-BR.ts` e `src/i18n/legal/en.ts` (mesma estrutura de seções nos dois idiomas; há teste de paridade).
- Dados do controlador, prazos e data de atualização: `src/shared/legal/config.ts`.
- Rotas públicas: `/terms` e `/privacy` (`src/app/(legal)`).
- Antes de publicar: preencher os campos `null` do config e rodar `bun scripts/check-legal.ts`.

Ao mudar o texto, atualize `updatedAt` no config. Os textos seguem a LGPD, mas **não substituem revisão jurídica**.
