import { useCallback, useEffect, useState } from "react";

/** Contagem regressiva em segundos; `restart()` reinicia (ex.: 60 s para reenviar o link). */
export function useCountdown(initial: number) {
  const [seconds, setSeconds] = useState(initial);
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);
  const restart = useCallback(() => setSeconds(initial), [initial]);
  return { seconds, restart };
}
