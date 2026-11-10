# E2E (Maestro)

Fluxos que rodam no simulador iOS com o development build (`com.itbuilder.vezzo`).

## Pré-requisitos
- Maestro (`brew tap mobile-dev-inc/tap && brew install mobile-dev-inc/tap/maestro`) e Java.
- Servidor de desenvolvimento no ar (`bunx expo start --dev-client`) e o simulador aberto.
- Sessão iniciada no app (os fluxos de `auth` partem de deslogado e fazem o próprio login).

## Rodar
```
maestro test e2e/tabs.yaml
maestro test e2e            # todos (os arquivos que começam com _ são auxiliares)
```
As capturas vão para `e2e/.shots/` (ignoradas pelo git).

## Dados de teste
Os fluxos rodam contra a conta logada e o banco de desenvolvimento. `habit-lifecycle.yaml` cria hábitos chamados "E2E ..."; limpe com `bun --env-file=.env scripts/e2e-cleanup.ts`. As capturas ficam em `~/.maestro/tests/<data>/<fluxo>/`.

## Armadilhas conhecidas
- O botão flutuante "Tools" do dev client cobre a ponta direita de "Salvar"; os fluxos tocam em `point: "25%,50%"`.
- Os cartões da lista expõem um único rótulo "Nome. Subtítulo": use `"Nome.*"` nos seletores.
- Abas: use `id: tab-home|tab-progress|tab-habits|tab-profile` (o texto repete em títulos de seção).
- A barra de abas flutuante cobre o fim das listas: use `centerElement: true` em `scrollUntilVisible` antes de tocar.
