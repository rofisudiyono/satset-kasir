import { useEffect, useRef } from "react";

export function useDebouncedEffect(
  effect: () => void,
  deps: readonly unknown[],
  delayMs: number,
) {
  const effectRef = useRef(effect);
  effectRef.current = effect;

  useEffect(() => {
    const timer = setTimeout(() => {
      effectRef.current();
    }, delayMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
