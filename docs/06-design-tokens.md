# 06 · Design tokens

## Cores
| Token | Escuro | Claro |
|---|---|---|
| `bg` | `#121413` | `#f6f4ee` |
| `card` | `#1c1f1d` | `#ffffff` |
| `ink` | `#f2f3ef` | `#1b1d1a` |
| `mute` | `#9aa19b` | `#656a62` |
| `line` | `#2e332f` | `#e4e1d8` |
| `accInk` | `#14170c` | `#14170c` |
| `danger` | `#ee6f6f` | `#bf3a3a` |
| `tint` (fundo do emoji) | `acc` + alfa `30` hex | `acc` + alfa `40` hex |

Cores de destaque (escolha do usuário, padrão a primeira): lima `#b9d94c`, verde-água `#3fbf9f`, azul `#4f9cf0`, violeta `#9a7df0`, rosa `#ee6f8f`, laranja `#f08a52`, âmbar `#eab33a`. Todas aceitam `accInk` como texto. A sobreposição de texto sobre `acc` deve manter contraste mínimo de 4,5:1 (conferir violeta e azul ao implementar; ajustar `accInk` por cor se necessário).

Lock screen de notificação (sempre escuro): fundo `#14161a`, banner `rgba(255,255,255,.14)`, botões secundários `rgba(255,255,255,.16)`.

## Tipografia: Manrope (Google Fonts via `@expo-google-fonts/manrope`)
Pesos 400, 500, 600, 700, 800.
| Uso | Tamanho / peso | Letter-spacing |
|---|---|---|
| Número de sequência | 96 / 800 | -4 |
| Título de marca | 44 / 800 | -1,5 |
| Número de destaque | 40–44 / 800 | -1 |
| Título onboarding | 36 / 800 | -1,2 |
| Título de tela | 28–32 / 800 | -0,8 a -1 |
| Subtítulo de seção | 18 / 800 | 0 |
| Corpo forte | 15–16 / 600–700 | 0 |
| Corpo | 14–15 / 500 | 0 |
| Legenda | 11–13 / 600–700 | 0 |
| Rótulo de seção | 11 / 700 maiúsculas | +1 |
Line-height: 1,1 em títulos, 1,4 em texto corrido.

## Espaçamento e forma
- Escala: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28.
- Margens de tela: 22 (home e listas), 28 (auth e onboarding).
- Raios: 8 (células de grade), 10–14 (pílulas, chips), 16 (campos), 18 (botões), 20–24 (cartões), 28 (cartões de destaque), 34 (barra de abas), 50% (anéis, avatares). Ícone do app: 0,26 do lado.
- Sombra: apenas barra de abas (`0 8 24 rgba(0,0,0,.18)`). Cartões sem sombra.
- Borda: 1 `line` (secundário), 2 (check vazio, seleção).

## Movimento (a implementar com Reanimated)
- Marcar hábito: círculo preenche em 180 ms (ease-out), escala 1 → 1,15 → 1 em 220 ms, haptic leve (`expo-haptics`).
- Anel de progresso: anima de valor anterior para novo em 500 ms (ease-in-out).
- Troca de tema: crossfade de 200 ms.
- Respeitar "Reduzir movimento" do sistema.

## Ícone do app (V-check)
Quadrado com raio 0,26·lado, fundo `acc` (`#b9d94c`). V formado por dois traços de espessura 0,09·lado com pontas arredondadas, cor `#14170c`: traço curto de comprimento 0,20 centrado em (0,355; 0,54) girado 45°; traço longo de comprimento 0,42 centrado em (0,585; 0,46) girado -50°. Variantes de arte em `design/` (1a escolhida, 1b e 1c alternativas). Exportar 1024×1024 sem transparência para o iOS, adaptive icon (foreground com o V, fundo `#b9d94c`) e versão monocromática para Android.

## Acessibilidade e contraste (Fase 10)
- `mute` e `danger` do modo claro foram escurecidos para atingir 4,5:1 sobre `bg` e `card` (o original dava 4,35:1 e 2,7:1). O escuro não mudou.
- `acc` como **texto** no modo claro dá de 1,5:1 (lima) a 2,9:1 (violeta). O tema expõe `accText`, a cor de destaque escurecida em direção a `ink` até 4,5:1; `Text tone="acc"` usa `accText`. `acc` continua valendo para fundos, bordas, anel e gráficos.
- Dynamic Type/escala de fonte: `Text` limita a escala a 130% (`MAX_FONT_SCALE`).
- Os pisos estão em `src/shared/contrast.test.ts` (4,5:1 para `accInk` sobre as 7 cores).
