---
name: enviar-para-loja
description: Use quando o usuário disser "envie para a loja" (ou variações como "manda pra loja", "publica na Play Store"). Decide a versão SemVer, escreve as notas de lançamento da Google Play, commita a versão, abre um PR contra a main e só então roda o build + submit no EAS.
---

# Enviar para a loja

Fluxo fixo, executado de ponta a ponta sempre que o usuário pedir "envie para a loja". O pedido já autoriza o build e o submit no EAS (consomem créditos e enviam para a trilha `internal` da Google Play) e a abertura do PR. Não peça confirmação a cada etapa; pare só se algo falhar.

A `main` é protegida (exige PR e o check `check`): **nunca** dê push direto nela.

## 0. Pré-checagens
- `git status --short` deve estar vazio, senão avise e pare (há trabalho não commitado do usuário).
- `git switch main && git pull --ff-only`. Se a `main` local divergir do remoto, pare e avise.
- Rode `bun run typecheck`, `bun run test` e `bun run lint`. Se algo falhar, pare e relate; não envie build quebrado.

## 1. Decidir a versão (SemVer)
- Ache o último release: `git log --grep='chore(release)' -1 --format=%h` e leia `APP_VERSION` em `app.config.ts`.
- Liste o que mudou desde então: `git log <hash>..HEAD --no-merges --format='%h %s'` (e `git diff --stat` se precisar entender o impacto).
- Escolha **uma** das opções:
  - `major`: quebra de compatibilidade, migração de dados ou mudança que exija ação do usuário.
  - `minor`: funcionalidade nova visível ao usuário (`feat`).
  - `patch`: só correções, UX, performance, libs e ajustes internos.
- Informe ao usuário a versão escolhida e o motivo em uma linha.
- Crie a branch: `git switch -c chore/release-<nova-versão>`.

## 2. Notas de lançamento
- Edite `docs/loja/notas-de-lancamento.md`: adicione no topo (acima da seção mais recente) uma seção `## <versão> · <tema curto>` com os blocos **pt-BR** e **en-US**, no mesmo formato das seções existentes.
- Escreva do ponto de vista do usuário final: ignore testes, CI, docs, refactors e libs. Só inclua o que ele percebe.
- Cada idioma tem **no máximo 500 caracteres** (conte de verdade, por exemplo com `python3 -c 'print(len(open(...).read()))'`) e o título indica a contagem, como `### pt-BR (402 caracteres)`.
- Estilo: primeira linha "Novidades:" (ou "Melhorias e correções:" para patch), depois uma linha por item começando com emoji.
- Não cite número de versão no texto das notas.

## 3. Subir a versão (sem build)
- `bun run release <patch|minor|major> --no-build` com o bump decidido no passo 1. O script só sobe a versão em `app.config.ts` e `package.json`. O build vem depois do commit (passo 5).
- Não edite a versão à mão e não rode o script sem `--no-build`: ele buildaria antes do commit.

## 4. Commit e PR
- Confira com `git diff --stat` que só mudaram `app.config.ts`, `package.json` e `docs/loja/notas-de-lancamento.md`.
- Commit: `chore(release): <versão>`, com a linha `Co-Authored-By` definida nas instruções do sistema.
- `git push -u origin chore/release-<versão>`.
- `gh pr create --base main --title "chore(release): <versão>"` com corpo em pt-BR: resumo (versão, notas na loja) e lista das mudanças desde o último release; termine com a linha de atribuição "🤖 Generated with [Claude Code](https://claude.com/claude-code)".

## 5. Build e submit (com a versão já commitada)
- Com a árvore limpa (`git status --short` vazio), rode o mesmo comando que o script usaria: `bunx eas-cli@latest build --platform android --profile production --auto-submit`.
- Não rode `bun run release` de novo: ele subiria a versão outra vez.
- Se o EAS falhar, relate o erro e informe que o PR já está aberto; não altere a versão para tentar de novo.

## 6. Resposta final
Informe: versão (e por que esse bump), link do PR, link do build no EAS, e os textos das notas pt-BR e en-US prontos para colar no Play Console. Lembre que, após o merge, `git switch main && git pull` realinha o local, e que o envio foi para a trilha `internal` (promover no Play Console).
