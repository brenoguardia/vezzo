# 08 · Layout adaptativo (iPhone, iPad, dobráveis)

## Premissa
Não existe "iPhone Duo". O design do dobrável usa duas telas de 540 × 720 pt separadas por uma dobradiça de 28 pt (referência: Surface Duo). Em React Native, o app não detecta modelos; ele reage à **largura disponível da janela**.

## Breakpoints (hook `useLayoutMode`)
```ts
const { width } = useWindowDimensions();
mode = width >= 600 ? "dual" : "single";   // 600 pt: iPad, iPhone Max em paisagem, dobráveis abertos
```
- `single` (< 600): layout do iPhone (390 de referência, fluido de 320 a 430).
- `dual` (≥ 600): duas colunas lado a lado. Largura de cada coluna = `(width - gap) / 2`, com `gap = 28` no dobrável. Em dobráveis Android abertos pode-se ler a posição da dobradiça via API nativa (ex.: Jetpack WindowManager por módulo nativo) e usar a largura real; sem isso, o gap fixo de 28 mantém a aparência do design.
- Em iPad, `dual` também vale, com cada coluna limitada a 640 de largura e o conteúdo centralizado.

## Regras do modo dual
1. O conteúdo nunca cruza a dobradiça. Cada coluna é uma `View` independente com seus próprios paddings (44 no topo, 28 nas laterais, no design).
2. Padrão **lista + detalhe**: esquerda mostra a lista (Hoje), direita mostra o detalhe do hábito selecionado (ou o gráfico semanal se nada estiver selecionado). Selecionar na esquerda atualiza a direita sem navegar.
3. Onboarding: atividades à esquerda, metas à direita, atualizando conforme as seleções. Botão "Começar" ancorado na coluna direita.
4. Abas: barra inferior continua única (centralizada, largura máxima 540) ou lateral; usar barra inferior para manter consistência.
5. Telas de formulário (auth, criar hábito) permanecem em coluna única centralizada com largura máxima de 480 e sem painel lateral.

## Mapeamento por tela
| Tela | single | dual |
|---|---|---|
| Hoje | resumo + lista | esquerda: resumo + lista; direita: detalhe do hábito selecionado + gráfico semanal |
| Progresso | coluna única | esquerda: gráfico e cartões; direita: por hábito e sequência |
| Onboarding 2 e 3 | passos separados | passos 2 e 3 lado a lado |
| Hábitos | lista | esquerda: lista; direita: edição |
| Perfil, Tema | coluna única | coluna única centralizada |

## Implementação
- Componente `<SplitView left right />` em `components/layout`: em `single` renderiza só o lado ativo pela navegação; em `dual` renderiza os dois.
- Seleção compartilhada em `useHabitsStore.selectedHabitId`.
- Rotação e mudança de largura (dobrar e abrir) devem preservar estado (sem remontar telas): manter o estado de seleção no store, não no componente.
- Suporte a iPad: habilitar `supportsTablet: true` em `app.json`, orientações `default`.
- Testar em: iPhone SE, iPhone 15/16, Pro Max (retrato e paisagem), iPad, emulador de dobrável Android (Pixel Fold).

## iPhone Duo (medido no simulador, Xcode 27.2 / iOS 27.2)
Referência: <https://expo.dev/blog/supporting-iphone-duo>. O Duo é tratado como iPhone: fechado = largura compacta, aberto = largura regular, e o layout se expande em vez de trocar de design.

| Pose | Janela (pt, 3×) | Safe area (T · R · B · L) | Rail (`useVerticalBarEdgeIOS`) | Modo do app |
|---|---|---|---|---|
| Fechado (tela externa, retrato) | 466 × 678 | 0 · **84** · 34 · 0 | `trailing` | `single` (util. 382) |
| Aberto, retrato | 669 × 951 | 82 · 0 · 34 · 0 | `null` | `dual` (colunas de 321) |
| Aberto, paisagem | 951 × 669 | 0 · **84** · 34 · 0 | `trailing` | `dual` (colunas de ~420) |
| Notebook (parcialmente aberto) | 669 × 951 (igual ao aberto retrato) | 82 · 0 · 34 · 0 | `null` | `dual` (colunas de 321) |

Regras adotadas:
- **Rail = inset horizontal.** Fechado e em paisagem o sistema reserva 84 pt à direita (borda da câmera). Nada que se leia ou toque pode ficar sob ele. `useLayoutMode()` expõe `usableWidth` e `sides`; `SettingsShell`, `OnboardingShell`, `AuthScreen` e `SplitView` somam os insets ao **conteúdo** (o fundo continua de borda a borda), e `TabBar` e `ToastHost` somam o inset às margens. O modo (`single`/`dual`) continua pela largura da janela; as colunas do dual dividem só a largura útil.
- **Ler a janela no render** (`useWindowDimensions`/`useSafeAreaInsets`): ao dobrar ou abrir, janela e insets mudam; valores em cache ficam velhos.
- **Notebook:** o app recebe a mesma janela do aberto retrato; a dobra horizontal no meio **não** aparece como janela nem como inset. Só `expo-hinge` (módulo nativo, `useHinge()`: `closed`/`partiallyOpen`/`fullyOpen` e ângulo) ou as reserved regions a revelam. Hoje o conteúdo rola por cima da dobra; ver "Pendências".
- **Nada foi trocado por `NativeTabs`/`ArrangementView`:** a barra de abas segue a do design (docs/05) e o dual é o `SplitView` do doc.

### Testar no Duo
- `bun run ios` já instala o app; use o UDID do simulador (`xcrun simctl list devices | grep Duo`).
- Fechado: `maestro --device <UDID> test -e POSE=closed e2e/duo/pose.yaml`.
- Aberto/notebook: `e2e/duo/capture.sh <UDID> <pose>` (deep link + capturas das duas telas físicas). Com o Duo aberto o XCUITest mede as coordenadas no espaço da tela externa e perde parte da janela interna, então o Maestro não serve nessas poses.
- A tela dev-only **Perfil → Layout e dobrável** mostra janela, safe area, rail e modo.

### Pendências
- Conteúdo que cruza a dobra no notebook (linhas de lista, cartões): aceitável para listas roláveis, mas alvos de toque exatamente sobre a dobra pedem `expo-hinge`.
- Split View (duas janelas do app), StandBy e extensões: só em aparelho.
