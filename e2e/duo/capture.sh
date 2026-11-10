#!/usr/bin/env bash
# Captura as telas do app no iPhone Duo numa pose, navegando por deep link.
# Com o Duo aberto o XCUITest (Maestro) mede as coordenadas no espaço da tela externa e perde
# parte da janela interna; por isso a navegação é por deep link e a validação é visual.
#
# Uso: e2e/duo/capture.sh <UDID do Duo> <pose>   (pose: closed, open-portrait, open-landscape, laptop)
# Saída: e2e/.shots/duo/<pose>/<rota>-<largura>x<altura>.png (uma captura por tela física)
set -euo pipefail
udid="${1:?UDID do simulador}"
pose="${2:?nome da pose}"
out="e2e/.shots/duo/$pose"
mkdir -p "$out"

# Telas físicas (classe 0): externa 1398x2034 e interna 2007x2853; a apagada sai preta.
displays=$(xcrun simctl io "$udid" enumerate | python3 -c '
import re, sys
uuid = None
for line in sys.stdin:
    m = re.search(r"^\s+UUID: (\S+)", line)
    if m: uuid = m.group(1); klass = w = None
    if re.search(r"Display class: 0", line): klass = 0
    m = re.search(r"Default width: (\d+)", line)
    if m: w = m.group(1)
    m = re.search(r"Default height: (\d+)", line)
    if m and klass == 0 and w: print(uuid, f"{w}x{m.group(1)}"); klass = None
')

for route in home progress habits profile theme layout-debug; do
  xcrun simctl openurl "$udid" "vezzo://$route"
  maestro --device "$udid" test e2e/duo/_confirm-open.yaml >/dev/null 2>&1 || true
  sleep 2
  while read -r uuid size; do
    xcrun simctl io "$udid" screenshot --display="$uuid" "$out/$route-$size.png" >/dev/null 2>&1 || true
  done <<<"$displays"
  echo "capturado: $route"
done
echo "Capturas em $out"
