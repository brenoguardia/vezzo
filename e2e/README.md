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
