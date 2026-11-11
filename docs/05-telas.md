# 05 · Telas

Medidas em pt (pontos). Frame de referência do iPhone: 390 × 844. Fonte: Manrope. Cores com `bg`, `card`, `ink`, `mute`, `line`, `acc` vêm de `06-design-tokens.md`. `accInk` = `#14170c` (texto sobre `acc`). Margem lateral padrão das telas: 22 (home, listas) ou 28 (auth, onboarding). Respeitar safe area; o topo de 64–72 do design já inclui a barra de status.

Componentes recorrentes:
- **Botão primário**: altura ~52, raio 18, fundo `acc`, texto `accInk` Manrope 700/16 centralizado. Em telas de formulário fica ancorado a 56 do fim.
- **Botão secundário**: igual, borda 1 `line`, texto `ink` 600/16.
- **Campo**: fundo `card`, raio 16, padding 14×18; rótulo 600/11 `mute`; valor 600/16 `ink`.
- **Cartão**: fundo `card`, raio 20–28, padding 16–22.
- **Emoji tile**: quadrado de lado L, raio 0,35·L, fundo `acc` com 19% (escuro) ou 25% (claro) de opacidade, emoji com fonte 0,55·L.
- **Progresso do onboarding**: 3 barras de altura 4, raio 2, gap 6; preenchidas `acc`, restantes `line`.
- **Chip de atividade**: padding 10×16, raio 14, 600/14, emoji + nome. Selecionado: fundo `acc`, texto `accInk`, borda `acc`. Não selecionado: transparente, borda `line`, texto `ink`.
- **Barra de abas flutuante**: left/right 16, bottom 22, altura 68, raio 34, fundo `card`, sombra `0 8 24 rgba(0,0,0,.18)`. 4 itens: ícone 18×18 + rótulo 700/10. Ativo `acc`, inativo `mute`. Ícones: formas simples (círculo, quadrado, quadrado raio 9, círculo com topo arredondado); substituir por ícones de uma lib (ex.: Phosphor) mantendo o tamanho.

## 1. Splash e boas-vindas
Centro: marca 112 (quadrado raio 0,26·112, fundo `acc`, V-check em `accInk`), "Vezzo" 800/44 letter-spacing -1,5, tagline 500/16 `mute` ("Pequenos passos, todos os dias."). Rodapé (bottom 56, laterais 32): botão "Criar conta" e secundário "Já tenho conta", com a frase "Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade" (caption `mute`, links em `acc`) logo abaixo.

## 2. Criar conta
Título 800/32 "Crie sua conta". Campos E-mail e Senha (gap 14), link "Esqueci minha senha" à direita 700/13 `acc`, botão "Continuar", divisor "ou", botões Apple e Google (secundários com logo oficial à esquerda). Validação: e-mail válido; senha com regras de `passwordRule`. Erro: texto 12 `#ee6f6f` abaixo do campo. Rodapé com a mesma frase de aceite dos Termos e da Política (também em Entrar).

## 3. Redefinir senha (3 telas)
Detalhadas em `04-autenticacao.md`. Layout: seta "‹ Voltar" 700/14 `mute`; título 800/32 (margem topo 28); subtítulo 500/15 `mute`.
- 3.1 "Redefinir senha": campo e-mail, botão "Enviar link", link "Voltar ao login" centralizado no rodapé.
- 3.2 "Verifique seu e-mail": círculo 84 com emoji ✉️ (40), texto com o e-mail em destaque, "O link vale por 30 minutos.", botão "Abrir app de e-mail", "Não recebeu? Reenviar link".
- 3.3 "Crie uma nova senha": campos "Nova senha" e "Confirmar senha", checklist (círculo 20; marcado = `acc` com ✓), botão "Salvar nova senha".

## 4. Onboarding
**4.1 Nome** (barra 1/3): título 800/36 "Como você quer ser chamado?", subtítulo, campo de texto grande 700/34 com sublinhado 2 `acc` e cursor. Botão "Continuar". Mín. 1, máx. 30 caracteres.
**4.2 Atividades** (2/3): título 800/32 "Quais hábitos você quer construir?". Seções por categoria (rótulo 700/11 maiúsculas, letter-spacing 1, `mute`) com chips. Botão "Continuar · N" (N = selecionados; mínimo 1). Chips pré-selecionados no design: água, meditar, ler, treinar.
**4.3 Metas** (3/3): título "Defina suas metas". Um cartão por hábito (raio 20, padding 16×18): emoji tile 36 + nome 700/16; à direita stepper (botões 28 redondos, valor 700/15, "−" com borda, "+" em `acc`); abaixo 7 pílulas de dia (S T Q Q S S D; padding 7×0, raio 10, 700/11; ativa `acc`/`accInk`, inativa `line`/`mute`). Botão "Começar" chama `POST /v1/onboarding/complete`.
Passos do stepper por unidade: água 0,25 L; minutos 5; páginas 5; contagem 1.

## 5. Home · resumo diário (aba Hoje)
- Cabeçalho: "Hoje" 500/14 `mute`; "Olá, {nome}" 800/28 letter-spacing -0,8.
- Cartão de resumo (raio 28, padding 20): anel 112 (trilha `line`, progresso `acc`, miolo 90 `card`) com "3/5" 800/30 e "feitos" 600/11; à direita frase motivacional 600/15 e "Sequência de 12 dias" 500/12 `mute`. Toque no cartão abre a tela de sequência.
- "Hábitos" 800/18. Lista (gap 10): cartão raio 20, padding 13×16: emoji tile 40, nome 700/15, subtítulo 500/12 `mute` (progresso ou "concluído 07:30"), círculo 28 de check (concluído: `acc` + ✓; pendente: borda 2 `line`). Concluídos com emoji em opacidade total, pendentes em 55%.
- Toque no círculo: marca ou desmarca. Hábitos com meta numérica abrem o detalhe ao tocar na linha.
- Frase motivacional: banco de 30 frases pt/en, uma por dia (índice = dia do ano), variando por faixa de progresso (0, <50%, ≥50%, 100%).

## 6. Home · resumo semanal (aba Progresso)
Título "Seu progresso" 800/28. Seletor Semana / Mês / Ano (cartão raio 16, padding 4, item ativo `acc`). Cartão (raio 28, padding 20): "Conclusão" 600/13, "78%" 800/40, selo "+8% vs semana passada"; gráfico de 7 colunas (altura 150, raio 10; dia atual `acc`, demais `line`; rótulo 700/11). Dois cartões: "Melhor dia" e "Sequência" (com "Recorde"). Seção "Por hábito": rótulo + valor, barra de 8 de altura com preenchimento `acc`. No design só a visão semanal está desenhada; mês e ano reutilizam o mesmo layout (mês: grade de 28 a 31 células; ano: 12 colunas).

## 7. Detalhe do hábito
Cabeçalho "‹ Voltar" e "Editar". Emoji tile 56 + nome 800/28 + meta 500/13 `mute`. Cartão de progresso (raio 28, padding 22): "1,8 / 2,5 L" 800/44, barra 10 com `acc`, botões rápidos "+ 250 ml" (fundo `line`) e "+ 500 ml" (`acc`). "Últimas 4 semanas": grade 7×4 de quadrados (raio 8) em `acc` com opacidade por dia (1 cumprido, 0,6 parcial, 0,3 quase, 0,15 não feito). Cartões "Sequência" e "Lembretes".

## 8. Criar e editar hábito
Barra: "Cancelar", "Novo hábito", "Salvar" (`acc`). Campos: Nome; **Emoji**: grade de 10 pré-selecionados (tile 46, raio 14; selecionado com contorno 2 `acc`) e tile tracejado "+" que abre o teclado de emojis do sistema (usar `TextInput` oculto com foco e validar um único emoji com `isSingleEmoji`); Frequência (7 pílulas); Meta e Lembrete lado a lado; switch "Ações rápidas na notificação" (46×28). Emojis pré-selecionados: 📖 💧 🏃 🧘 🥗 😴 ✍️ 🎯 💰 🌿. Ao escolher uma atividade pré-definida, nome, emoji, meta e dias vêm preenchidos.

## 9. Sequência e frases
Cabeçalho "‹ Voltar". Número 800/96 letter-spacing -4, "dias seguidos" 700/18 `mute`. Cartão com a semana: 7 círculos (marcado `acc` + ✓, vazio borda 2 `line`). "Próximas conquistas" 800/18 com barras para 15, 30 e 100 dias. Cartão final em `acc`, texto `accInk` 700/17: frase do dia.

## 10. Tema
Título "Tema". Cartão de prévia (anel 72 e botão). Rótulo "Cor de destaque": 7 círculos de 50, gap 14, selecionado com contorno 2 `ink` offset 3. Rótulo "Aparência": segmentado Escuro/Claro (futuramente Sistema). Botão "Aplicar". A cor muda tudo ao vivo (prévia) e é salva em `PUT /v1/profile`.

## 11. Perfil e configurações
Avatar 84 (inicial, fundo `acc`), nome 800/24, "Usando desde ...". Três cartões de métrica (sequência, hábitos, conclusão). Seção "Preferências": Tema, Idioma, Lembretes, Ações rápidas, Gerenciar hábitos. Seção "Conta e segurança": E-mail, Redefinir senha (›), Sair (texto `#ee6f6f`). Seção "Sobre" (entre Conta e Excluir conta): Termos de Uso (›) e Política de Privacidade (›). Incluir também "Excluir conta" em área separada no fim.

## 11b. Termos de Uso e Política de Privacidade (páginas públicas)
Rotas `/terms` e `/privacy` (grupo `src/app/(legal)`), fora de `Stack.Protected`: abrem com ou sem sessão, no app e na web (`https://<domínio>/privacy` é a URL informada nas lojas). Usam `SettingsShell` (voltar, título 28, data de atualização em caption `mute`, seções com título 18 e corpo `mute`; e-mail de contato tocável). Idioma pelo `useLocale` (pt-BR e en). Textos em `src/i18n/legal/`, dados do controlador em `src/shared/legal/config.ts`. Entradas: boas-vindas, Criar conta, Entrar e Perfil → Sobre.

## 12. Notificação (lock screen)
Especificação em `07-notificacoes.md`. O design mostra o banner expandido com os botões "Concluir", "Adiar 1h", "Pular".

## Estados a implementar (fora do design)
Carregando (**sempre skeleton**, ver abaixo), vazio (sem hábitos: emoji 🌱 + botão "Criar hábito"), erro de rede (faixa discreta e fila offline), dia sem hábitos agendados, hábito arquivado, primeiro dia (sem recorde).

### Padrão de loading: Skeleton
- Todo carregamento de **conteúdo** (telas, listas, números, linhas) é um skeleton: blocos `line` pulsando (opacidade 1 ↔ 0,45, 900 ms), sem spinner. O pulso respeita "Reduzir movimento" do sistema.
- O skeleton **espelha o layout real** (mesmas alturas, raios e margens) para a tela não saltar quando os dados chegam. Composições em `src/components/ui/skeletons.tsx`; a primitiva é `Skeleton` (`Skeleton.tsx`).
- Acessibilidade: cada região é um `SkeletonGroup` (`progressbar`, rótulo "Carregando", `aria-live` polite); os blocos internos são mudos para o leitor de tela.
- Quando mostrar: primeira carga sem cache (`useLoadingFirst`), dados que ainda não chegaram (resumo do Perfil, permissão de lembretes, "tem senha?", mês/ano do Progresso) e hábito ainda hidratando (detalhe/edição não dizem "não encontrado" antes de hidratar).
- Abertura do app: a splash sai quando as fontes carregam e entra `AppShellSkeleton` até sessão e perfil resolverem o gate.
- Exceção: botões enviando (`Button loading`) mantêm o spinner, por ser ação em andamento e não conteúdo carregando.
