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
